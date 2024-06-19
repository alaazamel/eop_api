import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Attendee } from '../../attendee/entities/attendee.entity';
import { Event } from '../../event/entities/event.entity';
import { AttendanceStatus } from '../enums/attendance-status.enum';
import { EventDay } from '../../event/entities/event-day.entity';

@Entity('attendance_days')
export class AttendanceDay extends BaseEntity {
  // attendee
  @ManyToOne(() => Attendee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee: Attendee;

  @RelationId((day: AttendanceDay) => day.attendee, 'attendee_id')
  attendeeId: number;

  // event
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @RelationId((day: AttendanceDay) => day.event, 'event_id')
  eventId: number;

  @ManyToOne(() => EventDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_day_id' })
  eventDay: EventDay;

  @RelationId((day: AttendanceDay) => day.eventDay, 'event_day_id')
  eventDayId: number;

  // date
  @Column({
    name: 'day_date',
    type: 'date',
  })
  dayDate: Date;

  // status
  @Column({
    name: 'status',
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.absent,
  })
  status: AttendanceStatus;
}
