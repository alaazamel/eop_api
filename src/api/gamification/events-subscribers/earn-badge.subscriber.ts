import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { InsertedDataEntity } from '../entities/data-insertion/inserted-data.entity';
import { Injectable } from '@nestjs/common';
import { AttendeeBadgeEntity } from '../entities/rewards-attendee/attendee-badge.entity';
import { DefinedDataEnum } from '../constants/defined-data.constant';

@Injectable()
export class EarnBadgeSubscriber
  implements EntitySubscriberInterface<AttendeeBadgeEntity>
{
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo(): Function | string {
    return AttendeeBadgeEntity;
  }

  async afterInsert(event: InsertEvent<AttendeeBadgeEntity>): Promise<any> {
    const badge = event.entity;
    const attendee_id = badge.attendee.id;

    await event.queryRunner.manager.getRepository(InsertedDataEntity).insert({
      attendee_id: attendee_id,
      defined_data_id: DefinedDataEnum.EARN_BADGE,
      value: 1,
    });
  }
}
