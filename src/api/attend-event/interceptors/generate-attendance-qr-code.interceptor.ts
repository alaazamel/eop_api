import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { QueryRunner } from 'typeorm';
import { QrCodeService } from '../../attendance/services/qrcode.service';
import { ChangeAttendEventStatusDto } from '../dto/change-attend-event-status.dto';
import { AttendeeEventStatus } from '../enums/attendee-event-status.enum';

@Injectable()
export class GenerateAttendanceQrCodeInterceptor implements NestInterceptor {
  constructor(private readonly qrCodeService: QrCodeService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const body: ChangeAttendEventStatusDto = req.body;
    const queryRunner = req.queryRunner;

    await this._generateQrCode(queryRunner, body);
    return next.handle();
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
      case AttendeeEventStatus.waiting:
        return this._processSwitchingToRejectedOrWaitingStatus(
          queryRunner,
          payload,
        );
    }
  }

  private async _processSwitchingToAcceptedStatus(
    queryRunner: QueryRunner,
    payload: ChangeAttendEventStatusDto,
  ) {
    // check for qr code existence
    const qrCode = await this.qrCodeService.findOneBy(
      payload.event_id,
      payload.attendee_id,
      queryRunner,
    );

    // if not exists, create it...
    if (!qrCode) {
      return this.qrCodeService.createAndStoreQrCode(
        payload.attendee_id,
        payload.event_id,
        queryRunner,
      );
    }

    return qrCode;
  }

  private async _processSwitchingToRejectedOrWaitingStatus(
    queryRunner: QueryRunner,
    payload: ChangeAttendEventStatusDto,
  ) {
    // check for qr code existence
    const qrCode = await this.qrCodeService.findOneBy(
      payload.event_id,
      payload.attendee_id,
      queryRunner,
    );

    // if exists, delete it
    if (qrCode) {
      await this.qrCodeService.deleteById(qrCode.id, queryRunner);
    }
  }
}
