import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AttendanceService } from '../../attendance/services/attendance.service';
import { QueryRunner } from 'typeorm';
import { ChangeAttendEventStatusDto } from '../dto/change-attend-event-status.dto';
import { AttendeeEventStatus } from '../enums/attendee-event-status.enum';

@Injectable()
export class GenerateAttendanceDayInterceptor implements NestInterceptor {
  constructor(private readonly attendanceService: AttendanceService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const body: ChangeAttendEventStatusDto = req.body;
    const queryRunner = req.queryRunner;

    // only if the new status is accepted, generate records.
    if (body.status === AttendeeEventStatus.accepted) {
      await this._generateAttendanceRecords(
        body.attendee_id,
        body.event_id,
        queryRunner,
      );
    } else {
      await this._deleteAttendanceRecordsIfExist(
        body.attendee_id,
        body.event_id,
        queryRunner,
      );
    }

    return next.handle();
  }

  private async _generateAttendanceRecords(
    attendeeId: number,
    eventId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.attendanceService.generateAndStoreAttendanceRecords(
      attendeeId,
      eventId,
      queryRunner,
    );
  }

  private async _deleteAttendanceRecordsIfExist(
    attendeeId: number,
    eventId: number,
    queryRunner: QueryRunner,
  ) {
    await this.attendanceService.deleteAttendanceRecordsIfGenerated(
      attendeeId,
      eventId,
      queryRunner,
    );
  }
}
