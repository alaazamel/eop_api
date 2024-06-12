import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, DeleteResult } from 'typeorm';
import { AttendeeEventStatus } from '../../attend-event/enums/attendee-event-status.enum';
import { Event } from '../../event/entities/event.entity';
import { ChatGroup } from '../entities/chat-group.entity';
import { AttendeeEvent } from '../../attend-event/entities/attendee-event.entity';
import { ChatGroupFilter } from '../dto/chat-group.filter';
import { GroupMessage } from '../entities/group-message.entity';
import { GetChatGroupDto } from '../dto/get-chat-group.dto';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../userRole/entities/user_role.entity';

/**
 * In this class we will provide the needed endpoint functions
 * to get the needed data in request-response manner
 */
@Injectable()
export class ChatApiService {
  // main data source
  private readonly dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async deleteMessage(messageId: number) {
    const repository = this.dataSource.getRepository(GroupMessage);

    // get the message object
    const message: GroupMessage = await repository.findOneOrFail({
      where: { id: messageId },
      loadRelationIds: { relations: ['group'] },
    });

    // delete the message
    const deleted: DeleteResult = await repository.softDelete(message.id);
    const isDeleted = deleted.affected != undefined && deleted.affected > 0;
    return {
      isDeleted: isDeleted,
      groupId: message.groupId,
    };
  }

  async getChattingList(attendeeId: number) {
    const queryBuilder = this.dataSource
      .getRepository(ChatGroup)
      .createQueryBuilder();

    const groupMemberCountSubQuery = queryBuilder
      .subQuery()
      .from(Event, 'ev') // Use distinct alias for events table in the subQuery
      .innerJoin('ev.attendees', 'ae')
      .innerJoin('ev.chatGroup', 'chat_groups')
      .where('ae.status = :status')
      .setParameters({ status: AttendeeEventStatus.accepted })
      .groupBy('ev.id')
      .select([
        'ev.id as event_id',
        'ev.coverPictureUrl as event_cover',
        'COUNT(*) as group_members',
      ]); // Use the alias here

    return await queryBuilder
      .from(ChatGroup, 'cg')
      .innerJoin('cg.event', 'events')
      .innerJoin('events.attendees', 'attendee_event')
      .leftJoin(
        `(${groupMemberCountSubQuery.getQuery()})`,
        'group_counts',
        'group_counts.event_id = events.id',
      )
      .where(
        'attendee_event.id IN ' +
          queryBuilder
            .subQuery()
            .select('attendee_event.id')
            .from(AttendeeEvent, 'attendee_event')
            .where('attendee_event.attendee_id = :attendeeId')
            .andWhere('attendee_event.status = :status')
            .setParameters({
              attendeeId: attendeeId,
              status: AttendeeEventStatus.accepted,
            })
            .getQuery(),
      )
      .andWhere('events.is_chatting_enabled = :isChattingEnabled')
      .setParameters({ isChattingEnabled: true })
      .select([
        'attendee_event.attendee_id AS attendee_id',
        'events.id AS event_id',
        'events.coverPictureUrl AS event_cover',
        'cg.id AS chat_group_id',
        'cg.group_title AS group_title',
        'COALESCE(group_counts.group_members, 0) AS group_members_count',
        'cg.group_status AS group_status',
      ])
      .distinctOn(['chat_group_id'])
      .getRawMany();
  }

  async isEmployeeHasAccessToChatGroup(
    groupId: number,
    userId: number,
  ): Promise<boolean> {
    const matchingRecords = await this.dataSource
      .createQueryBuilder()
      .from(ChatGroup, 'cg')
      .innerJoin('cg.event', 'event')
      .innerJoin('event.organization', 'org')
      .innerJoin('org.employees', 'employees')
      .where('cg.id = :groupId')
      .andWhere('employees.user_id = :userId')
      .setParameters({ groupId, userId })
      .select(['cg.id'])
      .getCount();
    return matchingRecords > 0;
  }

  async isAttendeeHasAccessToChatGroup(
    groupId: number,
    userId: number,
  ): Promise<boolean> {
    const matchingRecords = await this.dataSource
      .createQueryBuilder()
      .from(ChatGroup, 'cg')
      .innerJoin('cg.event', 'event')
      .innerJoin('event.attendees', 'event_attendees')
      .innerJoin('event_attendees.attendee', 'attendee')
      .where('attendee.user_id = :userId')
      .andWhere('cg.id = :groupId')
      .setParameters({ groupId, userId })
      .select('cg.id', 'group_id')
      .getCount();

    return matchingRecords > 0;
  }

  async getChatGroupById(
    params: ChatGroupFilter,
    user: any,
    payload: GetChatGroupDto,
  ) {
    // first check that user role is (employee or attendee)
    const userData = await this.dataSource.getRepository(User).findOneOrFail({
      where: { id: user.sub },
      loadRelationIds: { relations: ['userRole'] },
    });

    const userRoleId = userData.userRoleId;
    if (userRoleId != UserRole.ATTENDEE && userRoleId != UserRole.EMPLOYEE) {
      throw new ForbiddenException('You are not allowed to access chat group');
    }

    // check if the user is employee
    if (userRoleId == UserRole.EMPLOYEE) {
      // make sure that the employee belongs to the same event organization.
      const isEmployeeHasAccess: boolean =
        await this.isEmployeeHasAccessToChatGroup(payload.group_id, user.sub);

      if (!isEmployeeHasAccess) {
        throw new ForbiddenException(
          'You are not allowed to access this chat group',
        );
      }
    } else {
      const isAttendeeHasAccess = await this.isAttendeeHasAccessToChatGroup(
        payload.group_id,
        user.sub,
      );

      if (!isAttendeeHasAccess) {
        throw new ForbiddenException(
          'You are not allowed to access this chat group',
        );
      }
    }

    // first get group details
    const group = await this.dataSource.getRepository(ChatGroup).findOne({
      where: { id: payload.group_id },
      relations: { event: true, messages: false },
    });

    if (!group) {
      throw new NotFoundException('The Given groupId was not exist');
    }

    const messages = await this.dataSource
      .getRepository(GroupMessage)
      .createQueryBuilder('gm')
      .where('gm.chat_group_id = :groupId')
      .setParameter('groupId', payload.group_id)
      .orderBy('gm.createdAt', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .setFindOptions({
        loadEagerRelations: true,
        relations: { repliedMessage: true },
      })
      .getManyAndCount();

    return {
      group,
      messages: messages[0],
      meta_data: {
        total: messages[1],
        current_page: params.page,
        page_size: params.pageSize,
        last_page: Math.ceil(messages[1] / params.pageSize),
      },
    };
  }
}
