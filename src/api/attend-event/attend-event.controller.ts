import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendEventService } from './services/attend-event.service';
import { AttendEventDto } from './dto/attend-event.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { ChangeAttendEventStatusDto } from './dto/change-attend-event-status.dto';
import { ManageAttendEventService } from './services/manage-attend-event.service';
import { CheckEventFormIfSubmittedInterceptor } from './interceptors/check-event-form-if-submitted.interceptor';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../userRole/enums/user-role.enum';
import { CheckAttendeeBalanceAgainstEventFeesInterceptor } from './interceptors/check-attendee-balance-against-event-fees.interceptor';
import { TransactionInterceptor } from '../../common/interceptors/transaction/transaction.interceptor';
import { HandleRegisterInEventsPaymentInterceptor } from './interceptors/handle-register-in-events-payment.interceptor';
import { QueryRunnerParam } from '../../common/decorators/query-runner-param.decorator';
import { QueryRunner } from 'typeorm';
import { HandleChangeAttendeeEventStatusPaymentInterceptor } from './interceptors/handle-change-attendee-event-status-payment.interceptor';
import { User } from '../../common/decorators/user.decorator';
import { AuthUserType } from '../../common/types/auth-user.type';
import { GenerateAttendanceQrCodeInterceptor } from './interceptors/generate-attendance-qr-code.interceptor';
import { GenerateAttendanceQrCodeOnDirectRegisterInterceptor } from './interceptors/generate-attendance-qr-code-on-direct-register.interceptor';

@Controller('attend-event')
export class AttendEventController {
  constructor(
    private readonly attendEventService: AttendEventService,
    private readonly manageAttendEventService: ManageAttendEventService,
  ) {}

  @Post()
  @Roles(UserRoleEnum.ATTENDEE)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @UseInterceptors(
    TransactionInterceptor,
    CheckEventFormIfSubmittedInterceptor,
    CheckAttendeeBalanceAgainstEventFeesInterceptor,
    HandleRegisterInEventsPaymentInterceptor,
    GenerateAttendanceQrCodeOnDirectRegisterInterceptor,
  )
  attendEvent(
    @QueryRunnerParam() queryRunner: QueryRunner,
    @Body() attendEventDto: AttendEventDto,
    @User() user: AuthUserType,
  ) {
    return this.attendEventService.attendEvent(
      attendEventDto,
      +user.sub,
      queryRunner,
    );
  }

  @Post('manage')
  // @Roles(UserRoleEnum.EMPLOYEE)
  // @UseGuards(AccessTokenGuard, RoleGuard)
  @UseInterceptors(
    TransactionInterceptor,
    HandleChangeAttendeeEventStatusPaymentInterceptor,
    GenerateAttendanceQrCodeInterceptor,
  )
  changeAttendEventStatus(
    @Body() changeAttendEventStatusDto: ChangeAttendEventStatusDto,
    @QueryRunnerParam() queryRunner: QueryRunner,
  ) {
    return this.manageAttendEventService.changeAttendEventStatus(
      changeAttendEventStatusDto,
      queryRunner,
    );
  }
}
