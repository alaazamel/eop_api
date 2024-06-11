import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { AuthUserType } from '../../common/types/auth-user.type';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CreateOrganizationReportDto } from './dto/create-organization-report.dto';
import { CreateOrganizationReportType } from './types/create-organization-report.type';
import { OrganizationReportService } from './organization-report.service';
import { OrganizationReportSerializer } from './serializers/organization-report.serializer';
import { FileUtilityService } from '../../config/files/utility/file-utility.service';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../userRole/enums/user-role.enum';

@Controller('organization-report')
export class OrganizationReportController {
  constructor(
    private readonly service: OrganizationReportService,
    private readonly fileUtilityService: FileUtilityService,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ATTENDEE)
  async create(
    @User() user: AuthUserType,
    @Body() payload: CreateOrganizationReportDto,
  ) {
    const completePayload: CreateOrganizationReportType = {
      ...payload,
      reporter_id: user.sub,
    };
    const result = await this.service.createReport(completePayload);
    return OrganizationReportSerializer.serialize(
      result,
      this.fileUtilityService,
    );
  }
}
