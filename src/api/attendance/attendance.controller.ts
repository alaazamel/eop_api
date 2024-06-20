import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
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
import { GetAttendanceRecordDto } from './dto/get-attendance-record.dto';
import { AttendanceDaySerializer } from './serializers/attendance-day.serializer';
import { FileUtilityService } from '../../config/files/utility/file-utility.service';
import { ConfirmAttendanceRecordDto } from './dto/confirm-attendance-record.dto';
import { GetAttendanceListDto } from './dto/get-attendance-list.dto';
import { GenericFilter } from '../../common/interfaces/query.interface';
import { AttendanceDay } from './entities/attendance-day.entity';
import { CheckIfEmployeeHasAccessToEventDayInterceptor } from './interceptors/check-if-employee-has-access-to-event-day.interceptor';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly attendeeService: AttendeeService,
    private readonly attendanceService: AttendanceService,
    private readonly fileUtilityService: FileUtilityService,
  ) {}

  @Post('attendance-list')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @UseInterceptors(CheckIfEmployeeHasAccessToEventDayInterceptor)
  @Roles(UserRoleEnum.EMPLOYEE)
  async getAttendanceListForEventDay(
    @Query() query: GenericFilter,
    @Body() body: GetAttendanceListDto,
  ) {
    const payload = { ...query, ...body };
    const result: [AttendanceDay[], number] =
      await this.attendanceService.getAttendanceRecordsForEventDay(payload);

    return {
      meta_data: {
        page: query.page,
        page_size: query.pageSize,
        total: result[1],
      },
      data: AttendanceDaySerializer.serializeList(
        result[0],
        this.fileUtilityService,
      ),
    };
  }

  @Get('check-attendance')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.EMPLOYEE)
  async checkAttendanceRecord(@Query() query: GetAttendanceRecordDto) {
    const result = await this.attendanceService.getAttendanceRecordBy(query);

    if (!result) {
      throw new NotFoundException(
        'There is no active attendance record at this moment',
      );
    }

    return AttendanceDaySerializer.serialize(result, this.fileUtilityService);
  }

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

  @Put('confirm-attendance/:record_id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.EMPLOYEE)
  async confirmAttendanceRecord(
    @User() user: AuthUserType,
    @Param() params: ConfirmAttendanceRecordDto,
  ) {
    const payload = { ...params, user_id: user.sub };
    const record =
      await this.attendanceService.confirmAttendanceRecord(payload);
    return AttendanceDaySerializer.serialize(record!, this.fileUtilityService);
  }
}
