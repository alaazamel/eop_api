import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QrCodeService } from './services/qrcode.service';
import { AttendanceService } from './services/attendance.service';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../userRole/enums/user-role.enum';
import { User } from '../../common/decorators/user.decorator';
import { AuthUserType } from '../../common/types/auth-user.type';
import { AttendeeService } from '../attendee/services/attendee.service';
import { AttendanceQrCode } from './entities/attendance-qrcode.entity';
import { AttendanceQrCodeSerializer } from './serializers/attendance-qr-code.serializer';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly attendeeService: AttendeeService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // check attendance record by qr code url...

  @Get('get-attendance-code/:event_id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ATTENDEE)
  async getAttendanceQrCode(
    @User() user: AuthUserType,
    @Param('event_id') eventId: number,
  ) {
    const attendeeId: number = await this.attendeeService
      .getAttendeeByUserId(user.sub)
      .then((attendee) => attendee.id);

    const qrCode: AttendanceQrCode | null = await this.qrCodeService.findOneBy(
      eventId,
      attendeeId,
    );

    if (!qrCode) {
      throw new BadRequestException(
        'the attendee is not registered in this event',
      );
    }

    return AttendanceQrCodeSerializer.serialize(qrCode);
  }
}
