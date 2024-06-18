import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Address } from '../../address/entities/address.entity';
import { Job } from '../../job/entities/job.entity';
import { AttendeeContact } from './attendee-contact.entity';
import { AttendeeEvent } from '../../attend-event/entities/attendee-event.entity';
import { FilledForm } from '../../dynamic-forms/entities/filled-form.entity';
import { FollowingAttendee } from '../../organization/entities/following-attendee.entity';
import { AttendeesTickets } from '../../payment/entities/attendees-tickets.entity';
import { InsertedDataEntity } from '../../gamification/entities/data-insertion/inserted-data.entity';
import { AttendeeBadgeEntity } from '../../gamification/entities/rewards-attendee/attendee-badge.entity';
import { AttendeePointsEntity } from '../../gamification/entities/rewards-attendee/attendee-points.entity';
import { AttendeeRedeemablePointsEntity } from '../../gamification/entities/rewards-attendee/attendee-redeemable-points.entity';
import { AttendanceQrCode } from '../../attendance/entities/attendance-qrcode.entity';

@Entity('attendees')
export class Attendee extends BaseEntity {
  // Foreign Key
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((attendee: Attendee) => attendee.user, 'user_id')
  userId?: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    nullable: false,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: false,
  })
  lastName!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    name: 'profile_picture_url',
    type: 'text',
    nullable: true,
  })
  profilePictureUrl?: string;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: true,
  })
  birthDate?: Date;

  @Column({
    name: 'bio',
    type: 'text',
    nullable: true,
  })
  bio?: string;

  @Column({
    name: 'cover_picture_url',
    type: 'text',
    nullable: true,
  })
  coverPictureUrl?: string;

  @OneToMany(
    () => AttendeeContact,
    (attendeeContact) => attendeeContact.attendee,
    { eager: true },
  )
  contacts: AttendeeContact[];

  @ManyToOne(() => Address, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'id' })
  address?: Address;

  @ManyToOne(() => Job, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'job_id', referencedColumnName: 'id' })
  job?: Job;

  @OneToMany(() => AttendeeEvent, (attendeeEvent) => attendeeEvent.attendee)
  events: AttendeeEvent[];

  @OneToMany(() => FilledForm, (filledForm) => filledForm.attendee)
  filledForms: FilledForm[];

  @OneToMany(
    () => FollowingAttendee,
    (followingAttendee) => followingAttendee.attendee,
  )
  followingOrganizations: FollowingAttendee[];

  @OneToMany(
    () => AttendeesTickets,
    (attendeeTickets) => attendeeTickets.attendee,
  )
  ticketsEvents: AttendeesTickets[];

  @OneToMany(
    () => InsertedDataEntity,
    (insertedDataEntity) => insertedDataEntity.attendee,
  )
  insertedData: InsertedDataEntity[];

  @OneToMany(
    () => AttendeeBadgeEntity,
    (attendeeBadgeEntity) => attendeeBadgeEntity.attendee,
  )
  badges: AttendeeBadgeEntity[];

  @OneToMany(
    () => AttendeePointsEntity,
    (attendeePointsEntity) => attendeePointsEntity.attendee,
  )
  points: AttendeePointsEntity[];

  @OneToMany(
    () => AttendeeRedeemablePointsEntity,
    (attendeeRedeemablePointsEntity) => attendeeRedeemablePointsEntity.attendee,
  )
  redeemablePoints: AttendeeRedeemablePointsEntity[];

  @OneToMany(() => AttendanceQrCode, (code) => code.attendee, {
    onDelete: 'CASCADE',
  })
  attendanceQrCodes: AttendanceQrCode[];
}
