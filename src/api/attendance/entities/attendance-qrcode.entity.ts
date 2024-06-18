import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Attendee } from '../../attendee/entities/attendee.entity';
import { Event } from '../../event/entities/event.entity';

@Entity('attendance_qr_codes')
export class AttendanceQrCode extends BaseEntity {
  @Column({
    name: 'code',
    type: 'text',
    nullable: false,
  })
  code: string;

  @ManyToOne(() => Attendee)
  @JoinColumn({ name: 'attendee_id' })
  attendee: Attendee;

  @RelationId((code: AttendanceQrCode) => code.attendee, 'attendee_id')
  attendeeId: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @RelationId((code: AttendanceQrCode) => code.event, 'event_id')
  eventId: number;
}
