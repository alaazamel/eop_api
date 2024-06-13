import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminReportService } from './admin-report.service';
import { FileUtilityService } from '../../config/files/utility/file-utility.service';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../userRole/enums/user-role.enum';
import { User } from '../../common/decorators/user.decorator';
import { AuthUserType } from '../../common/types/auth-user.type';
import { CreateAdminReportDto } from './dto/create-admin-report.dto';
import { AdminReportSerializer } from './serializers/admin-report.serializer';
import { AdminReportsQuery } from './filters/admin-reports.query';
import { AdminReportStatusEnum } from './enums/admin-report-status.enum';

@Controller('admin-report')
export class AdminReportController {
  constructor(
    private readonly service: AdminReportService,
    private readonly fileUtilityService: FileUtilityService,
  ) {}

  @Get()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async findAll(@Query() query: AdminReportsQuery) {
    // get the result.
    const result = await this.service.findAll(query);

    // prepare the response
    const metadata = { ...query, total: result[1] };
    const data = AdminReportSerializer.serializeList(
      result[0],
      this.fileUtilityService,
    );
    return { data, metadata };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ATTENDEE)
  async create(
    @User() user: AuthUserType,
    @Body() payload: CreateAdminReportDto,
  ) {
    const completePayload = { ...payload, reporter_id: user.sub };
    const result = await this.service.createReport(completePayload);
    return AdminReportSerializer.serialize(result, this.fileUtilityService);
  }

  @Get('/is-reported/:event_id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ATTENDEE)
  async isReported(
    @User() user: AuthUserType,
    @Param('event_id') eventId: number,
  ) {
    return this.service.isReported(user.sub, eventId);
  }

  @Put('/ignore/:report_id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async markAsIgnored(@Param('report_id') reportId: number) {
    const updated = await this.service.updateStatus(
      reportId,
      AdminReportStatusEnum.ignored,
    );
    return AdminReportSerializer.serialize(updated, this.fileUtilityService);
  }

  @Put('/resolve/:report_id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async markAsResolved(@Param('report_id') reportId: number) {
    const updated = await this.service.updateStatus(
      reportId,
      AdminReportStatusEnum.resolved,
    );
    return AdminReportSerializer.serialize(updated, this.fileUtilityService);
  }
}
