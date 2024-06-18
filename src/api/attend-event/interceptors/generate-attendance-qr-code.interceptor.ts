import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';
import { QrCodeService } from '../../attendance/services/qrcode.service';
import { ChangeAttendEventStatusDto } from '../dto/change-attend-event-status.dto';
import { tap } from 'rxjs/operators';
import { AttendeeEventStatus } from '../enums/attendee-event-status.enum';
import { AttendanceQrCode } from '../../attendance/entities/attendance-qrcode.entity';

@Injectable()
export class GenerateAttendanceQrCodeInterceptor implements NestInterceptor {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const body: ChangeAttendEventStatusDto = req.body;
    const queryRunner = req.queryRunner;

    return (
      next
        .handle()
        // after finalizing the operation...
        .pipe(tap(() => this._generateQrCode(queryRunner, body)))
    );
  }

  private async _generateQrCode(
    queryRunner: QueryRunner,
    payload: ChangeAttendEventStatusDto,
  ) {
    // check if the operation is switching to accepted status...
    // then, we have to create qr code for this attendee in this event
    // only if it's not already created...
    const status: AttendeeEventStatus = payload.status;
    switch (status) {
      case AttendeeEventStatus.accepted:
        return this._processSwitchingToAcceptedStatus(queryRunner, payload);
      case AttendeeEventStatus.rejected:
        break;
      case AttendeeEventStatus.waiting:
        break;
    }
    return null;
  }

  private async _processSwitchingToAcceptedStatus(
    queryRunner: QueryRunner,
    payload: ChangeAttendEventStatusDto,
  ) {
    // create a new attendance qr code
    const attendanceQrCodeRepo =
      queryRunner.manager.getRepository(AttendanceQrCode);

    const isExist = await attendanceQrCodeRepo.exists({
      where: {
        attendee: { id: payload.attendee_id },
        event: { id: payload.event_id },
      },
    });

    // if not exists, create it...
    if (!isExist) {
      // generate qr code...
      const generatedQrCode: string =
        await this.qrCodeService.generateAttendanceQrCode(
          payload.attendee_id,
          payload.event_id,
        );
      const created = attendanceQrCodeRepo.create({
        event: { id: payload.event_id },
        attendee: { id: payload.attendee_id },
        code: generatedQrCode,
      });

      // save it...
      await attendanceQrCodeRepo.save(created);
    }

    return attendanceQrCodeRepo.findOne({
      where: {
        event: { id: payload.event_id },
        attendee: { id: payload.attendee_id },
      },
    });
  }
}
