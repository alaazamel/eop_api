import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/entities/employee.entity';
import { Event } from './entities/event.entity';
import { Organization } from '../organization/entities/organization.entity';
import {
  DEFAULT_DB_DATE_FORMAT,
  EVENT_FILES,
} from '../../common/constants/constants';
import * as moment from 'moment';
import { Address } from '../address/entities/address.entity';
import { EventTagDto } from './dto/event-tag.dto';
import { EventTag } from './entities/event-tag.entity';
import { EventPhoto } from './entities/event-photo.entity';
import { EventAttachment } from './entities/event-attachment.entity';
import { EventAgeGroupDto } from './dto/event-age-group.dto';
import { EventAgeGroup } from './entities/event-age-group.entity';
import { CreateEventDaySlotDto } from './dto/create-event-day-slot.dto';
import { SlotStatus } from '../slot-status/entities/slot-status.entity';
import { EventDaySlot } from './entities/event-day-slot.entity';
import { ApprovalStatus } from '../approval-status/entities/approval-status.entity';
import { EventApprovalStatus } from './entities/event-approval-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeEvent } from '../attend-event/entities/attendee-event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagsDto } from './dto/update-event-tags.dto';
import { UpdateEventAgeGroupsDto } from './dto/update-event-age-groups.dto';
import { EventDay } from './entities/event-day.entity';
import { Form } from '../dynamic-forms/entities/form.entity';
import { MessageGroupStatus } from '../chat/enums/message-group-status.enum';
import { ChatGroup } from '../chat/entities/chat-group.entity';
import { AuthUserType } from '../../common/types/auth-user.type';

@Injectable()
export class EventService {
  private readonly dataSource: DataSource;
  private readonly employeeService: EmployeeService;

  constructor(
    employeeService: EmployeeService,
    dataSource: DataSource,
    @InjectRepository(AttendeeEvent)
    private readonly attendeeEventRepository: Repository<AttendeeEvent>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    this.dataSource = dataSource;
    this.employeeService = employeeService;
  }

  async findEvent(
    id: number,
    includeChatGroup: boolean = false,
  ): Promise<Event | null> {
    return this.eventRepository
      .findOneOrFail({
        where: { id },
        relations: {
          organization: true,
          chatGroup: includeChatGroup,
          form: true,
        },
      })
      .then(async (event: Event | null) => {
        // query group member count if exist
        if (!event) {
          return null;
        }

        let chatGroupMembers: number = 0;
        if (event.isChattingEnabled && event.chatGroup) {
          console.log('Fetched');
          chatGroupMembers = await this.dataSource.manager
            .getRepository(AttendeeEvent)
            .count({ where: { event: { id } } });

          if (event.chatGroup) {
            event.chatGroup.memberCount = chatGroupMembers;
          }
        }

        return event;
      });
  }

  async updateEventTags(eventId: number, payload: UpdateEventTagsDto) {
    // check for existence
    if (!(await this.checkEventExistence(eventId))) {
      throw new NotFoundException(`Event with Id=${eventId} was not found!`);
    }

    // pluck the ids
    const deletedTagIds = payload.deleted_tags.map((item) => {
      return item.tag_id;
    });

    // pluck the ids
    const addedTags = payload.added_tags
      .map((item) => {
        return {
          event: { id: eventId },
          tag: { id: item.tag_id },
        };
      })
      .map((item) => {
        return this.dataSource.manager.create(EventTag, item);
      });

    // first, delete the deleted ones.
    if (deletedTagIds.length > 0) {
      await this.dataSource
        .getRepository(EventTag)
        .createQueryBuilder()
        .delete()
        .where('event_id = :eventId', { eventId })
        .andWhere('tag_id IN (:...values)', { values: deletedTagIds })
        .execute();
    }

    // second, insert the new ones
    if (addedTags.length > 0) {
      await this.dataSource.manager.save(EventTag, addedTags);
    }

    return this.findEvent(eventId, true);
  }

  async updateEventAgeGroups(
    eventId: number,
    payload: UpdateEventAgeGroupsDto,
  ) {
    // check for existence
    if (!(await this.checkEventExistence(eventId))) {
      throw new NotFoundException(`Event with Id=${eventId} was not found!`);
    }

    // pluck the ids
    const deletedAgeGroupIds = payload.deleted_age_groups.map((item) => {
      return item.age_group_id;
    });

    // pluck the ids
    const addedAgeGroups = payload.added_age_groups
      .map((item) => {
        return {
          event: { id: eventId },
          ageGroup: { id: item.age_group_id },
        };
      })
      .map((item) => {
        return this.dataSource.manager.create(EventAgeGroup, item);
      });

    // first, delete the deleted ones.
    if (deletedAgeGroupIds.length > 0) {
      await this.dataSource
        .getRepository(EventAgeGroup)
        .createQueryBuilder()
        .delete()
        .where('event_id = :eventId', { eventId })
        .andWhere('age_group_id IN (:...values)', {
          values: deletedAgeGroupIds,
        })
        .execute();
    }

    // second, insert the new ones
    if (addedAgeGroups.length > 0) {
      await this.dataSource.manager.save(EventAgeGroup, addedAgeGroups);
    }

    return this.findEvent(eventId);
  }

  // create new event
  async createEvent(payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // create a transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userId: number = +payload.user['sub'];
      const employee: Employee | null =
        await this.employeeService.findByUserId(userId);

      if (!employee) {
        throw new UnauthorizedException(
          "You don't have permissions to create an event!",
        );
      }

      // TODO: CHECK THE REQUIRED PERMISSIONS

      // get the Organization id from userId
      const organizationId = employee.organization.id;

      // create the event
      let data = {
        title: payload.title,
        eventType: payload.event_type,
        organization: { id: organizationId } as Organization,
        coverPictureUrl: `${EVENT_FILES}/${payload.cover_picture[0].filename}`,
        description: payload.description,
        addressNotes: payload.address_notes ?? undefined,
        capacity: payload.capacity ?? undefined,
        directRegister: payload.direct_register,
        isChattingEnabled: payload.is_chatting_enabled,
        supportAttendance: payload.support_attendance,
        fees: payload.fees,
        registrationStartDate: payload.registration_start_date
          ? moment(payload.registration_start_date).format(
              DEFAULT_DB_DATE_FORMAT,
            )
          : undefined,
        registrationEndDate: payload.registration_end_date
          ? moment(payload.registration_end_date).format(DEFAULT_DB_DATE_FORMAT)
          : undefined,
        form: { id: payload.form_id } as Form,
      };

      let newData;
      if (payload.location) {
        newData = { ...data, location: payload.location };
      } else {
        const address = { id: payload.address_id } as Address;
        newData = { ...data, address };
      }

      // save the main entity
      const created = queryRunner.manager.create(Event, newData);
      const savedEvent = await queryRunner.manager.save(Event, created);

      // create the event tags
      if (payload.tags && payload.tags.length > 0) {
        const eventTags = (payload.tags as Array<EventTagDto>)
          .map((tag: EventTagDto) => {
            return {
              event: { id: savedEvent.id },
              tag: { id: tag.tag_id },
            };
          })
          .map((tag) => {
            return queryRunner.manager.create(EventTag, tag);
          });

        // save the created tags
        await queryRunner.manager.save(EventTag, eventTags);
      }

      // create the event age groups
      if (payload.age_groups && payload.age_groups.length > 0) {
        const eventAgeGroups = (payload.age_groups as Array<EventAgeGroupDto>)
          .map((ageGroup: EventAgeGroupDto) => {
            return {
              event: { id: savedEvent.id },
              ageGroup: { id: ageGroup.age_group_id },
            };
          })
          .map((ageGroup) => {
            return queryRunner.manager.create(EventAgeGroup, ageGroup);
          });

        // save the created tags
        await queryRunner.manager.save(EventAgeGroup, eventAgeGroups);
      }

      // create the event photos
      if (payload.photos && payload.photos.length > 0) {
        const eventPhotos = payload.photos
          .map((photo: any) => {
            return {
              event: { id: savedEvent.id },
              photoName: `EV_${savedEvent.id}_IMG_${photo.filename}`,
              photoUrl: `${EVENT_FILES}/${photo.filename}`,
            };
          })
          .map((photo: any) => {
            return queryRunner.manager.create(EventPhoto, photo);
          });

        // save the created attachments
        await queryRunner.manager.save(EventPhoto, eventPhotos);
      }

      // create the event attachments
      if (payload.attachments && payload.attachments.length > 0) {
        const eventAttachments = payload.attachments
          .map((attachment: any) => {
            return {
              event: { id: savedEvent.id },
              fileName: `EV_${savedEvent.id}_ATT_${attachment.filename}`,
              fileUrl: `${EVENT_FILES}/${attachment.filename}`,
            };
          })
          .map((attachment: any) => {
            return queryRunner.manager.create(EventAttachment, attachment);
          });

        // save the created attachments
        await queryRunner.manager.save(EventAttachment, eventAttachments);
      }

      // create the event days
      if (payload.days && payload.days.length > 0) {
        for (const day of payload.days) {
          // store the main day entity

          const dayData = {
            event: { id: savedEvent.id },
            dayDate: day.day_date,
          };

          const createdDay = queryRunner.manager.create(EventDay, dayData);
          const savedDay = await queryRunner.manager.save(EventDay, createdDay);

          // store the slots
          if (!day.slots || day.slots.length == 0) {
            throw new BadRequestException('Day slots cannot be empty!');
          }

          const slotsData = (day.slots as Array<CreateEventDaySlotDto>)
            .map((slot: CreateEventDaySlotDto) => {
              return {
                eventDay: { id: savedDay.id },
                slotStatus: { id: SlotStatus.PENDING },
                label: slot.label,
                startTime: slot.start_time,
                endTime: slot.end_time,
              };
            })
            .map((slot) => {
              return queryRunner.manager.create(EventDaySlot, slot);
            });

          // save them all
          await queryRunner.manager.save(EventDaySlot, slotsData);
        }
      }

      // create a chatting group if chatting is enabled.
      if (payload.is_chatting_enabled) {
        const eventChatGroup = {
          event: { id: savedEvent.id },
          status: MessageGroupStatus.disabled,
          groupTitle: payload.chat_group.group_title,
        };

        // create entity
        const createdGroup: ChatGroup = queryRunner.manager.create(
          ChatGroup,
          eventChatGroup,
        );

        // store it.
        await queryRunner.manager.save(ChatGroup, createdGroup);
      }

      // create a default approval status entity
      const eventApprovalStatusData = {
        approvalStatus: { id: ApprovalStatus.IN_REVIEW },
        event: { id: savedEvent.id },
        setBy: { id: userId },
        fromDate: new Date(),
      };

      const createdApprovalStatus = queryRunner.manager.create(
        EventApprovalStatus,
        eventApprovalStatusData,
      );
      await queryRunner.manager.save(
        EventApprovalStatus,
        createdApprovalStatus,
      );

      // commit the transaction
      // await queryRunner.commitTransaction();

      const newEntity = await this.findEvent(savedEvent.id, true);

      await queryRunner.release();
      return newEntity;
    } catch (e) {
      // rollback the transaction
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw e;
    }
  }

  async updateEventData(payload: any): Promise<Event | null> {
    // check for existence
    if (!(await this.checkEventExistence(payload.id))) {
      throw new NotFoundException(`Event with Id=${payload.id} was not found!`);
    }

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      await queryRunner.connect();

      // update the entry
      await queryRunner.manager.update(
        Event,
        { id: payload.id },
        UpdateEventDto.toModel(payload),
      );

      // update days if exist.
      if (payload.days) {
        // delete the old days
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(EventDay)
          .where('event_id = :event_id')
          .setParameters({ event_id: payload.id })
          .execute();

        if (payload.days.length == 0) {
          throw new BadRequestException('Event Days cannot be empty!');
        }

        for (const day of payload.days) {
          // store the main day entity

          const dayData = {
            event: { id: payload.id },
            dayDate: moment(day.day_date, 'YYYY-MM-DD').format(
              DEFAULT_DB_DATE_FORMAT,
            ),
          };

          const createdDay = queryRunner.manager.create(EventDay, dayData);
          const savedDay = await queryRunner.manager.save(EventDay, createdDay);

          // store the slots
          if (!day.slots || day.slots.length == 0) {
            throw new BadRequestException('Day slots cannot be empty!');
          }

          const slotsData = (day.slots as Array<CreateEventDaySlotDto>)
            .map((slot: CreateEventDaySlotDto) => {
              return {
                eventDay: { id: savedDay.id },
                slotStatus: { id: SlotStatus.PENDING },
                label: slot.label,
                startTime: slot.start_time,
                endTime: slot.end_time,
              };
            })
            .map((slot) => {
              return queryRunner.manager.create(EventDaySlot, slot);
            });

          // save them all
          await queryRunner.manager.save(EventDaySlot, slotsData);
        }
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findEvent(payload.id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw e;
    }
  }

  async deleteEventForm(eventID: number) {
    const event = await this.eventRepository.findOneOrFail({
      where: {
        id: eventID,
      },
    });

    event.form = null;

    await this.eventRepository.save(event);
  }

  async getEventAttendees(eventID: number) {
    return await this.attendeeEventRepository.find({
      where: {
        event: { id: eventID } as Event,
      },
      relations: {
        attendee: true,
      },
    });
  }

  public async deleteEvent(
    queryRunner: QueryRunner,
    user: AuthUserType,
    id: number,
  ): Promise<{ message: string }> {
    // make sure the employee belongs to the same org
    const isExist: boolean = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('ev')
      .innerJoin('ev.organization', 'org')
      .innerJoin('org.employees', 'employees')
      .where('ev.id = :event_id', { event_id: id })
      .where('employees.user_id = :user_id', { user_id: user.sub })
      .getExists();

    if (!isExist) {
      throw new NotFoundException(
        'Event was not found in your organization events!',
      );
    }

    // delete the event
    const deleted = await queryRunner.manager
      .createQueryBuilder()
      .softDelete()
      .from(Event)
      .where('id = :eventID', { eventID: id })
      .execute();

    const hasBeenDeleted: boolean = +deleted.affected! > 0;

    if (!hasBeenDeleted) {
      throw new BadRequestException('Event has not been deleted');
    }
    return {
      message: 'Event has been deleted',
    };
  }

  private async checkEventExistence(id: number): Promise<boolean> {
    try {
      const event = await this.dataSource.manager.findOneByOrFail(Event, {
        id,
      });
      return !!event;
    } catch (e) {
      return false;
    }
  }
}
