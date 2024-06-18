import { Module } from '@nestjs/common';
import { AttendEventService } from './services/attend-event.service';
import { AttendEventController } from './attend-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeEvent } from './entities/attendee-event.entity';
import { Event } from '../event/entities/event.entity';
import { IsEventInRegisterPeriodConstraint } from './validators/is_event_in_register_period_constraint';
import { Attendee } from '../attendee/entities/attendee.entity';
import { ManageAttendEventService } from './services/manage-attend-event.service';
import { IsEventCapacityCanHoldConstraint } from './validators/is_event_capacity_can_hold_constraint';
import { AttendeesTickets } from '../payment/entities/attendees-tickets.entity';
import { PaymentModule } from '../payment/payment.module';
import { IsAttendeeEventStatusSameConstraint } from './validators/is_attendee_event_status_same_constraint';
import { OrganizationsTickets } from '../payment/entities/organizations-tickets.entity';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendeeEvent,
      Event,
      Attendee,
      AttendeesTickets,
      OrganizationsTickets,
    ]),
    PaymentModule,
    AttendanceModule,
  ],
  controllers: [AttendEventController],
  providers: [
    AttendEventService,
    ManageAttendEventService,
    IsEventInRegisterPeriodConstraint,
    IsEventCapacityCanHoldConstraint,
    IsAttendeeEventStatusSameConstraint,
  ],
})
export class AttendEventModule {}
