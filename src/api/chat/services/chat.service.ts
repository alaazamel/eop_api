import { Injectable } from '@nestjs/common';
import { AuthUserType } from '../../../common/types/auth-user.type';
import { UserRole } from '../../userRole/entities/user_role.entity';
import { DataSource } from 'typeorm';
import { AttendeeEvent } from '../../attend-event/entities/attendee-event.entity';
import { Attendee } from '../../attendee/entities/attendee.entity';
import { AttendeeEventStatus } from '../../attend-event/enums/attendee-event-status.enum';
import { MessageGroupStatus } from '../enums/message-group-status.enum';
import { GroupChannelType } from '../types/group-channel.type';
import { Employee } from '../../employee/entities/employee.entity';
import { GroupMessageType } from '../types/group-message.type';
import { GroupMessage } from '../entities/group-message.entity';
import { ChatGroup } from '../entities/chat-group.entity';
import { MessageReactionType } from '../types/message-reaction.type';
import { MessageReaction } from '../entities/message-reaction.entity';

@Injectable()
export class ChatService {
  constructor(private readonly dataSource: DataSource) {}

  // this function is responsible for getting list of chat groups
  async getListOfChannels(user: AuthUserType): Promise<GroupChannelType[]> {
    let groupsMetaData: GroupChannelType[];
    let groups: number[] = [];
    if (user.role_id == +UserRole.ATTENDEE) {
      // get list of attendee groups.

      // get attendee Id
      const attendeeId = await this.dataSource
        .getRepository(Attendee)
        .findOneOrFail({ where: { user: { id: user.sub } } })
        .then((attendee) => attendee.id);

      groups = await this.dataSource
        .getRepository(AttendeeEvent)
        .find({
          where: {
            attendee: { id: attendeeId },
            status: AttendeeEventStatus.accepted,
            event: {
              chatGroup: { status: MessageGroupStatus.enabled },
              isChattingEnabled: true,
            },
          },
          relations: {
            event: { chatGroup: true },
          },
        })
        .then((attendeeEvents) =>
          attendeeEvents.map((ae) => ae.event.chatGroup?.id!),
        );
    } else if (user.role_id == UserRole.EMPLOYEE) {
      // get the employee id.
      const employeeId: number = await this.dataSource
        .getRepository(Employee)
        .findOneOrFail({ where: { user: { id: user.sub } } })
        .then((employee) => employee.id);

      groups = await this.dataSource
        .createQueryBuilder()
        .from(Employee, 'emp')
        .where('emp.id = :id', { id: employeeId })
        .innerJoin('emp.organization', 'org')
        .leftJoinAndSelect('org.events', 'events')
        .andWhere('events.is_chatting_enabled = :en', { en: true })
        .innerJoin('events.chatGroup', 'cg')
        .andWhere('cg.group_status = :status', {
          status: MessageGroupStatus.enabled,
        })
        .select('cg.id as group_id')
        .getRawMany()
        .then((items) => items.map((item) => item.group_id));
    }

    groupsMetaData = groups.map((groupId) => ({
      group_id: groupId,
      channel: `group-${groupId}`,
    }));

    return groupsMetaData;
  }

  async getMessageReceiverUserIds(groupId: number) {
    let userIds: number[] = [];

    // query attendees
    const attendeeUsers = await this.dataSource
      .getRepository(AttendeeEvent)
      .createQueryBuilder('ae')
      .innerJoin('ae.event', 'event')
      .innerJoin('event.chatGroup', 'cg')
      .innerJoin('event.organization', 'org')
      // TODO: ADD CHECK TO EXCLUDE BLOCKED ATTENDEES
      .innerJoin('ae.attendee', 'attendee')
      .innerJoin('attendee.user', 'user')
      .where('event.is_chatting_enabled = :isEnabled')
      .andWhere('cg.group_status = :status')
      .setParameters({
        isEnabled: true,
        status: MessageGroupStatus.enabled,
      })
      .select('user.id as user_id')
      .getRawMany()
      .then((users) => users.map((item) => +item.user_id));

    // add them to the array
    userIds = [...userIds, ...attendeeUsers];

    // query employees
    const employeeUsers = await this.dataSource
      .getRepository(ChatGroup)
      .createQueryBuilder('cg')
      .where('cg.id = :groupId', { groupId })
      .andWhere('cg.group_status = :status')
      .innerJoin('cg.event', 'event')
      .innerJoin('event.organization', 'org')
      .leftJoin('org.employees', 'employees')
      .innerJoin('employees.user', 'user')
      .select('DISTINCT(user.id) as user_id')
      .setParameters({ status: MessageGroupStatus.enabled })
      .getRawMany()
      .then((users) => users.map((item) => +item.user_id));

    // add them to the array
    userIds = [...userIds, ...employeeUsers];

    return [...new Set(userIds)];
  }

  async storeMessage(payload: GroupMessageType) {
    // create the new message
    const repository = this.dataSource.getRepository(GroupMessage);
    const created = repository.create({
      content: payload.content,
      senderType: payload.senderType,
      group: { id: payload.group_id },
      sender: { id: payload.sender_id },
      repliedMessage: payload.reply_to ? { id: +payload.reply_to } : undefined,
    });

    // store it.
    const stored = await repository.save(created);

    // load fully detailed message.
    return this.loadCompleteMessage(stored.id);
  }

  async storeReaction(payload: MessageReactionType) {
    // create the new reaction...
    const messageReactionRepository =
      this.dataSource.getRepository(MessageReaction);

    // if user is already reacted. remove reaction...
    const existingReaction = await messageReactionRepository.findOne({
      where: {
        reactedBy: { id: payload.reactor_id },
        message: { id: payload.message_id },
      },
    });

    // this reaction is already exist...
    if (existingReaction) {
      // remove the reaction...
      await messageReactionRepository.delete(existingReaction.id);

      // // return the complete message...
      // return this.loadCompleteMessage(payload.message_id);
      if (existingReaction.reactionId == payload.reaction_id) {
        return this.loadCompleteMessage(payload.message_id);
      }
    }

    const created = messageReactionRepository.create({
      message: { id: payload.message_id },
      reaction: { id: payload.reaction_id },
      reactedBy: { id: payload.reactor_id },
    });

    // save it
    await messageReactionRepository.save(created);

    // load the complete message.
    return this.loadCompleteMessage(payload.message_id);
  }

  private async loadCompleteMessage(messageId: number) {
    const groupMessageRepository = this.dataSource.getRepository(GroupMessage);
    return await groupMessageRepository.findOne({
      where: { id: messageId },
      relations: {
        sender: true,
        repliedMessage: true,
        reactions: { reactedBy: true },
      },
      loadEagerRelations: true,
    });
  }
}
