import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AgeGroup } from '../age-group/entities/age-group.entity';
import { ApprovalStatus } from '../approval-status/entities/approval-status.entity';
import { City } from '../city/entities/city.entity';
import { FieldType } from '../dynamic-forms/entities/field-type.entity';
import { Job } from '../job/entities/job.entity';
import { QueryOperator } from '../dynamic-forms/entities/query-operator';
import { Permission } from '../permission/entities/permission.entity';
import { TicketEventType } from '../payment/entities/ticket-event-type.entity';
import { SlotStatus } from '../slot-status/entities/slot-status.entity';
import { State } from '../state/entities/state.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Contact } from '../contact/entities/contact.entity';
import { UserRole } from '../userRole/entities/user_role.entity';
import { Address } from '../address/entities/address.entity';
import { Reaction } from '../chat/entities/reaction.entity';
import { FieldTypeOperatorsEntity } from '../dynamic-forms/entities/field-type-operators.entity';
import { FeaturedEventType } from '../featured-events/entities/featured-event-type.entity';
import { AbuseType } from '../abuse-type/entities/abuse-type.entity';
import { hash } from 'bcrypt';
import { Admin } from '../admin/entities/admin.entity';
import { User } from '../user/entities/user.entity';
import { DefinedDataEntity } from '../gamification/entities/data-definition/defined-data.entity';
import { OperatorEntity } from '../gamification/entities/data-definition/operator.entity';
import { DefinedDataOperatorsEntity } from '../gamification/entities/data-definition/defined-data-operators.entity';
import { RewardTypeEntity } from '../gamification/entities/rewards/reward-type.entity';
import { PrizeTypeEntity } from '../gamification/entities/prizes/prize-type.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedAbuseTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE abuse_types_id_seq RESTART WITH 1;',
    );

    const abuseTypes: AbuseType[] = [
      {
        id: 1,
        name: 'Harassment',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 2,
        name: 'Spam',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 3,
        name: 'Hate Speech',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 4,
        name: 'Threats',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 5,
        name: 'Explicit Content',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 6,
        name: 'Impersonation',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 7,
        name: 'Scam',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 8,
        name: 'Other',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    await this.dataSource.getRepository(AbuseType).upsert(abuseTypes, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedAgeGroups() {
    await this.dataSource.query(
      'ALTER SEQUENCE age_groups_id_seq RESTART WITH 1;',
    );

    const ageGroups: AgeGroup[] = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:35:31.849619'),
        updatedAt: new Date('2024-04-16 16:35:31.849619'),
        deletedAt: null,
        fromAge: 5,
        toAge: 17,
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:35:31.849619'),
        updatedAt: new Date('2024-04-16 16:35:31.849619'),
        deletedAt: null,
        fromAge: 18,
        toAge: 25,
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:35:31.849619'),
        updatedAt: new Date('2024-04-16 16:35:31.849619'),
        deletedAt: null,
        fromAge: 26,
        toAge: 40,
      },
      {
        id: 4,
        createdAt: new Date('2024-04-16 16:35:31.849619'),
        updatedAt: new Date('2024-04-16 16:35:31.849619'),
        deletedAt: null,
        fromAge: 41,
        toAge: 60,
      },
    ];

    await this.dataSource.getRepository(AgeGroup).upsert(ageGroups, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedApprovalStatus() {
    await this.dataSource.query(
      'ALTER SEQUENCE approval_statuses_id_seq RESTART WITH 1;',
    );

    const approvalStatuses: ApprovalStatus[] = [
      {
        id: 1,
        statusName: 'In Review',
        createdAt: new Date('2024-04-16 16:39:52.143549'),
        updatedAt: new Date('2024-04-16 16:39:52.143549'),
        deletedAt: null,
      },
      {
        id: 2,
        statusName: 'Approved',
        createdAt: new Date('2024-04-16 16:39:52.143549'),
        updatedAt: new Date('2024-04-16 16:39:52.143549'),
        deletedAt: null,
      },
      {
        id: 3,
        statusName: 'Declined',
        createdAt: new Date('2024-04-16 16:39:52.143549'),
        updatedAt: new Date('2024-04-16 16:39:52.143549'),
        deletedAt: null,
      },
    ];

    await this.dataSource
      .getRepository(ApprovalStatus)
      .upsert(approvalStatuses, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedCities() {
    await this.dataSource.query('ALTER SEQUENCE cities_id_seq RESTART WITH 1;');

    const citiesData: City[] = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:30:06.05292'),
        updatedAt: new Date('2024-04-16 16:30:06.05292'),
        deletedAt: null,
        cityName: 'Muhajirin',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:30:06.05292'),
        updatedAt: new Date('2024-04-16 16:30:06.05292'),
        deletedAt: null,
        cityName: 'Rukn Aldeen',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:30:06.05292'),
        updatedAt: new Date('2024-04-16 16:30:06.05292'),
        deletedAt: null,
        cityName: 'Abu Romanah',
      },
    ];

    await this.dataSource.getRepository(City).upsert(citiesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedFieldsTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE field_types_id_seq RESTART WITH 1;',
    );

    const fieldTypesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-03 22:25:49.918381'),
        updatedAt: new Date('2024-04-03 22:25:49.918381'),
        deletedAt: null,
        name: 'TEXT',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-03 22:25:49.918381'),
        updatedAt: new Date('2024-04-03 22:25:49.918381'),
        deletedAt: null,
        name: 'NUMBER',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-03 22:25:49.918381'),
        updatedAt: new Date('2024-04-03 22:25:49.918381'),
        deletedAt: null,
        name: 'DATE',
      },
      {
        id: 4,
        createdAt: new Date('2024-04-03 22:25:49.918381'),
        updatedAt: new Date('2024-04-03 22:25:49.918381'),
        deletedAt: null,
        name: 'RADIO_BUTTON',
      },
    ];

    await this.dataSource.getRepository(FieldType).upsert(fieldTypesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedJobs() {
    await this.dataSource.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1;');

    const jobsData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:32:03.191557'),
        updatedAt: new Date('2024-04-16 16:32:03.191557'),
        deletedAt: null,
        jobName: 'Software Engineering',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:32:03.191557'),
        updatedAt: new Date('2024-04-16 16:32:03.191557'),
        deletedAt: null,
        jobName: 'Accountant',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:32:03.191557'),
        updatedAt: new Date('2024-04-16 16:32:03.191557'),
        deletedAt: null,
        jobName: 'Student',
      },
      {
        id: 4,
        createdAt: new Date('2024-04-16 16:32:03.191557'),
        updatedAt: new Date('2024-04-16 16:32:03.191557'),
        deletedAt: null,
        jobName: 'Teacher',
      },
    ];

    await this.dataSource.getRepository(Job).upsert(jobsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedQueryOperators() {
    await this.dataSource.query(
      'ALTER SEQUENCE operators_id_seq RESTART WITH 1;',
    );

    const operatorsData = [
      {
        id: 1,
        createdAt: new Date('2024-03-25 18:00:11.568841'),
        updatedAt: new Date('2024-03-25 18:00:11.568841'),
        deletedAt: null,
        name: 'Greater',
        value: '>',
      },
      {
        id: 2,
        createdAt: new Date('2024-03-25 18:00:24.837709'),
        updatedAt: new Date('2024-03-25 18:00:24.837709'),
        deletedAt: null,
        name: 'Greater Or Equal',
        value: '>=',
      },
      {
        id: 3,
        createdAt: new Date('2024-03-25 18:00:37.35309'),
        updatedAt: new Date('2024-03-25 18:00:37.35309'),
        deletedAt: null,
        name: 'Smaller',
        value: '<',
      },
      {
        id: 4,
        createdAt: new Date('2024-03-25 18:00:47.382586'),
        updatedAt: new Date('2024-03-25 18:00:47.382586'),
        deletedAt: null,
        name: 'Smaller Or Equal',
        value: '<=',
      },
      {
        id: 5,
        createdAt: new Date('2024-03-25 18:00:55.657532'),
        updatedAt: new Date('2024-03-25 18:00:55.657532'),
        deletedAt: null,
        name: 'Equal',
        value: '=',
      },
      {
        id: 6,
        createdAt: new Date('2024-03-25 18:01:29.79325'),
        updatedAt: new Date('2024-03-25 18:01:29.79325'),
        deletedAt: null,
        name: 'Contain',
        value: 'LIKE',
      },
      {
        id: 7,
        createdAt: new Date('2024-03-25 18:01:29.79325'),
        updatedAt: new Date('2024-03-25 18:01:29.79325'),
        deletedAt: null,
        name: 'Not Contain',
        value: 'NOT LIKE',
      },
    ];

    await this.dataSource.getRepository(QueryOperator).upsert(operatorsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedPermissions() {
    await this.dataSource.query(
      'ALTER SEQUENCE permissions_id_seq RESTART WITH 1;',
    );

    const permissionsData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:41:08.310476'),
        updatedAt: new Date('2024-04-16 16:41:08.310476'),
        deletedAt: null,
        name: 'Create Event',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:41:08.310476'),
        updatedAt: new Date('2024-04-16 16:41:08.310476'),
        deletedAt: null,
        name: 'Update Event',
      },
    ];

    await this.dataSource.getRepository(Permission).upsert(permissionsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedTicketsEventsTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE ticket_event_type_id_seq RESTART WITH 1;',
    );

    const ticketEventTypesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-29 19:43:15.806141'),
        updatedAt: new Date('2024-04-29 19:43:15.806141'),
        deletedAt: null,
        name: 'Purchase',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-29 19:43:27.085039'),
        updatedAt: new Date('2024-04-29 19:43:27.085039'),
        deletedAt: null,
        name: 'Consume',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-29 19:43:27.085039'),
        updatedAt: new Date('2024-04-29 19:43:27.085039'),
        deletedAt: null,
        name: 'Redeem',
      },
    ];

    await this.dataSource
      .getRepository(TicketEventType)
      .upsert(ticketEventTypesData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedSlotStatuses() {
    await this.dataSource.query(
      'ALTER SEQUENCE slot_statuses_id_seq RESTART WITH 1;',
    );

    const slotStatusesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:39:04.465917'),
        updatedAt: new Date('2024-04-16 16:39:04.465917'),
        deletedAt: null,
        statusName: 'Pending',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:39:04.465917'),
        updatedAt: new Date('2024-04-16 16:39:04.465917'),
        deletedAt: null,
        statusName: 'Completed',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:39:04.465917'),
        updatedAt: new Date('2024-04-16 16:39:04.465917'),
        deletedAt: null,
        statusName: 'Cancelled',
      },
      {
        id: 4,
        createdAt: new Date('2024-04-16 16:39:04.465917'),
        updatedAt: new Date('2024-04-16 16:39:04.465917'),
        deletedAt: null,
        statusName: 'In Progress',
      },
    ];

    await this.dataSource.getRepository(SlotStatus).upsert(slotStatusesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedStates() {
    await this.dataSource.query('ALTER SEQUENCE states_id_seq RESTART WITH 1;');

    const statesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:31:05.191403'),
        updatedAt: new Date('2024-04-16 16:31:05.191403'),
        deletedAt: null,
        stateName: 'Damascus',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:31:05.191403'),
        updatedAt: new Date('2024-04-16 16:31:05.191403'),
        deletedAt: null,
        stateName: 'Homs',
      },
    ];

    await this.dataSource.getRepository(State).upsert(statesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedTags() {
    await this.dataSource.query('ALTER SEQUENCE tags_id_seq RESTART WITH 1;');

    const tagsData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Programming',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Economy',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Software Development',
      },
      {
        id: 4,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Academic',
      },
      {
        id: 5,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Sport',
      },
      {
        id: 6,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Tech',
      },
      {
        id: 7,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Music',
      },
      {
        id: 8,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Gaming',
      },
      {
        id: 9,
        createdAt: new Date('2024-04-16 16:33:37.473361'),
        updatedAt: new Date('2024-04-16 16:33:37.473361'),
        deletedAt: null,
        tagName: 'Entertainment',
      },
    ];

    await this.dataSource.getRepository(Tag).upsert(tagsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedContacts() {
    await this.dataSource.query(
      'ALTER SEQUENCE contacts_id_seq RESTART WITH 1;',
    );

    const contactsData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'Facebook',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'LinkedIn',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'Github',
      },
      {
        id: 4,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'Instagram',
      },
      {
        id: 5,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'Phone Number',
      },
      {
        id: 6,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        name: 'Email',
      },
    ];

    await this.dataSource.getRepository(Contact).upsert(contactsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedUserRoles() {
    await this.dataSource.query(
      'ALTER SEQUENCE user_roles_id_seq RESTART WITH 1;',
    );

    const userRolesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:16:42.7072'),
        updatedAt: new Date('2024-04-16 16:16:42.7072'),
        deletedAt: null,
        roleName: 'Admin',
      },
      {
        id: 2,
        createdAt: new Date('2024-04-16 16:16:42.7072'),
        updatedAt: new Date('2024-04-16 16:16:42.7072'),
        deletedAt: null,
        roleName: 'Employee',
      },
      {
        id: 3,
        createdAt: new Date('2024-04-16 16:16:42.7072'),
        updatedAt: new Date('2024-04-16 16:16:42.7072'),
        deletedAt: null,
        roleName: 'Attendee',
      },
    ];

    await this.dataSource.getRepository(UserRole).upsert(userRolesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedAddresses() {
    await this.dataSource.query(
      'ALTER SEQUENCE addresses_id_seq RESTART WITH 1;',
    );

    const addressesData = [
      {
        id: 1,
        createdAt: new Date('2024-04-16 16:36:55.1834'),
        updatedAt: new Date('2024-04-16 16:36:55.1834'),
        deletedAt: null,
        city: { id: 1 } as City,
        state: { id: 1 } as State,
      },
    ];

    await this.dataSource.getRepository(Address).upsert(addressesData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedChatReactions() {
    await this.dataSource.query(
      'ALTER SEQUENCE reactions_id_seq RESTART WITH 1;',
    );

    const reactionsData = [
      {
        id: 1,
        createdAt: new Date('2024-05-02 17:10:18.688896'),
        updatedAt: new Date('2024-05-02 17:10:18.688896'),
        deletedAt: null,
        label: 'Love',
        icon: '/assets/love.png',
      },
      {
        id: 2,
        createdAt: new Date('2024-05-02 17:10:18.688896'),
        updatedAt: new Date('2024-05-02 17:10:18.688896'),
        deletedAt: null,
        label: 'Like',
        icon: '/assets/like.png',
      },
      {
        id: 3,
        createdAt: new Date('2024-05-02 17:10:18.688896'),
        updatedAt: new Date('2024-05-02 17:10:18.688896'),
        deletedAt: null,
        label: 'Dislike',
        icon: '/assets/dislike.png',
      },
    ];

    await this.dataSource.getRepository(Reaction).upsert(reactionsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedFieldsTypesOperators() {
    await this.dataSource.query(
      'ALTER SEQUENCE field_type_operators_id_seq RESTART WITH 1;',
    );
    const fieldTypeOperatorsData = [
      { id: 1, field_type_id: 1, query_operator_id: 5 },
      { id: 2, field_type_id: 1, query_operator_id: 6 },
      { id: 3, field_type_id: 1, query_operator_id: 7 },
      { id: 4, field_type_id: 2, query_operator_id: 1 },
      { id: 5, field_type_id: 2, query_operator_id: 2 },
      { id: 6, field_type_id: 2, query_operator_id: 3 },
      { id: 7, field_type_id: 2, query_operator_id: 4 },
      { id: 8, field_type_id: 2, query_operator_id: 5 },
      { id: 9, field_type_id: 3, query_operator_id: 1 },
      { id: 10, field_type_id: 3, query_operator_id: 2 },
      { id: 11, field_type_id: 3, query_operator_id: 3 },
      { id: 12, field_type_id: 3, query_operator_id: 4 },
      { id: 13, field_type_id: 3, query_operator_id: 5 },
      { id: 14, field_type_id: 4, query_operator_id: 5 },
    ];

    await this.dataSource
      .getRepository(FieldTypeOperatorsEntity)
      .upsert(fieldTypeOperatorsData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedFeaturedEventsTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE featured_events_types_id_seq RESTART WITH 1;',
    );
    const featuredEventsData = [
      {
        id: 1,
        created_at: new Date('2024-05-14T10:23:09.059887Z'),
        updated_at: new Date('2024-05-14T10:23:09.059887Z'),
        deleted_at: null,
        name: 'Home page carousel',
      },
    ];

    await this.dataSource
      .getRepository(FeaturedEventType)
      .upsert(featuredEventsData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedAdmin() {
    const user = this.dataSource.getRepository(User).create();

    user.username = 'admin';
    user.email = 'admin@hotmail.com';
    user.password = await hash('admin', 10);
    user.userRole = { id: 1 } as UserRole;

    await this.dataSource.getRepository(User).upsert(user, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });

    const admin = this.dataSource.getRepository(Admin).create();

    admin.user = user;
    admin.firstName = 'admin';
    admin.lastName = 'admin';

    await this.dataSource.getRepository(Admin).upsert(admin, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedGamificationDefinedData() {
    await this.dataSource.query(
      'ALTER SEQUENCE g_defined_data_id_seq RESTART WITH 1;',
    );

    const definedData = [
      { id: 1, name: 'Fill Form' },
      { id: 2, name: 'Send Message' },
      { id: 3, name: 'Buy Package' },
      { id: 4, name: 'Consume Tickets' },
      // { id: 5, name: 'Earn Badge' },
    ];

    await this.dataSource.getRepository(DefinedDataEntity).upsert(definedData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedGamificationOperators() {
    await this.dataSource.query(
      'ALTER SEQUENCE g_operators_id_seq RESTART WITH 1;',
    );

    const operatorsData = [
      { id: 1, name: 'Equal' },
      { id: 2, name: 'Greater' },
      { id: 3, name: 'Smaller' },
    ];

    await this.dataSource.getRepository(OperatorEntity).upsert(operatorsData, {
      conflictPaths: ['id'],
      upsertType: 'on-duplicate-key-update',
    });
  }

  async seedGamificationDefinedDataOperators() {
    await this.dataSource.query(
      'ALTER SEQUENCE g_data_operators_id_seq RESTART WITH 1;',
    );

    const definedDataOperatorsData = [
      { id: 1, defined_data_id: 1, operator_id: 1 },
      { id: 2, defined_data_id: 1, operator_id: 2 },
      { id: 3, defined_data_id: 1, operator_id: 3 },
      { id: 4, defined_data_id: 2, operator_id: 1 },
      { id: 5, defined_data_id: 2, operator_id: 2 },
      { id: 6, defined_data_id: 2, operator_id: 3 },
      { id: 7, defined_data_id: 3, operator_id: 1 },
      { id: 8, defined_data_id: 3, operator_id: 2 },
      { id: 9, defined_data_id: 3, operator_id: 3 },
      { id: 10, defined_data_id: 4, operator_id: 1 },
      { id: 11, defined_data_id: 4, operator_id: 2 },
      { id: 12, defined_data_id: 4, operator_id: 3 },
      // { id: 13, defined_data_id: 5, operator_id: 1 },
      // { id: 14, defined_data_id: 5, operator_id: 2 },
      // { id: 15, defined_data_id: 5, operator_id: 3 },
    ];

    await this.dataSource
      .getRepository(DefinedDataOperatorsEntity)
      .upsert(definedDataOperatorsData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedGamificationRewardTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE g_reward_types_id_seq RESTART WITH 1;',
    );

    const rewardTypesData = [
      { id: 1, name: 'Points' },
      { id: 2, name: 'Badge' },
      { id: 3, name: 'Redeemable Points' },
    ];

    await this.dataSource
      .getRepository(RewardTypeEntity)
      .upsert(rewardTypesData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }

  async seedGamificationPrizesTypes() {
    await this.dataSource.query(
      'ALTER SEQUENCE g_prize_types_id_seq RESTART WITH 1;',
    );

    const prizeTypesData = [{ id: 1, name: 'Tickets' }];

    await this.dataSource
      .getRepository(PrizeTypeEntity)
      .upsert(prizeTypesData, {
        conflictPaths: ['id'],
        upsertType: 'on-duplicate-key-update',
      });
  }
}
