import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthUserType } from '../../../common/types/auth-user.type';
import { AttendEventDto } from '../dto/attend-event.dto';
import { QueryRunner } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { AttendeeService } from '../../attendee/services/attendee.service';
import { AttendanceService } from '../../attendance/services/attendance.service';

@Injectable()
export class GenerateAttendanceDayOnDirectRegisterInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendeeService: AttendeeService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const user: AuthUserType = req.user;
    const body: AttendEventDto = req.body;
    const queryRunner = req.queryRunner;

    // perform the logic
    await this._processAttendanceRecordsGeneration(body, user, queryRunner);

    return next.handle();
  }

  private async _processAttendanceRecordsGeneration(
    payload: AttendEventDto,
    user: AuthUserType,
    queryRunner: QueryRunner,
  ) {
    // first get the event
    const eventRepo = queryRunner.manager.getRepository(Event);

    const event: Event = await eventRepo.findOneOrFail({
      where: { id: payload.event_id },
      select: { id: true, directRegister: true, supportAttendance: true },
    });

    // first, check if the event has direct registration & support attendance enabled...
    if (event.directRegister && event.supportAttendance) {
      // generate qr code and store it...
      const attendeeId: number = await this.attendeeService
        .getAttendeeByUserId(user.sub)
        .then((attendee) => attendee.id);

      await this.attendanceService.generateAndStoreAttendanceRecords(
        attendeeId,
        event.id,
        queryRunner,
      );
    }
  }
}
