import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AttendEventDto } from '../dto/attend-event.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { QrCodeService } from '../../attendance/services/qrcode.service';
import { AttendeeService } from '../../attendee/services/attendee.service';
import { AuthUserType } from '../../../common/types/auth-user.type';

@Injectable()
export class GenerateAttendanceQrCodeOnDirectRegisterInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly qrCodeService: QrCodeService,
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

    await this._processAttendanceQrCodeGeneration(body, user, queryRunner);

    return next.handle();
  }

  private async _processAttendanceQrCodeGeneration(
    payload: AttendEventDto,
    user: AuthUserType,
    queryRunner: QueryRunner,
  ) {
    // first get the event
    const eventRepo = queryRunner.manager.getRepository(Event);

    const event: Event = await eventRepo.findOneOrFail({
      where: { id: payload.event_id },
      select: { id: true, directRegister: true },
    });

    // first, check if the event has direct registration enabled...
    if (event.directRegister) {
      // generate qr code and store it...
      const attendeeId: number = await this.attendeeService
        .getAttendeeByUserId(user.sub)
        .then((attendee) => attendee.id);

      await this.qrCodeService.createAndStoreQrCode(
        attendeeId,
        event.id,
        queryRunner,
      );
    }
  }
}
