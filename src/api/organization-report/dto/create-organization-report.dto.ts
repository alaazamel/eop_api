import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { OrganizationReportTypeEnum } from '../enums/organization-report-type.enum';
import { IsExist } from '../../../common/decorators/is_exist.decorator';

export class CreateOrganizationReportDto {
  @IsEnum(OrganizationReportTypeEnum)
  type: OrganizationReportTypeEnum;

  @IsDefined()
  @IsExist({ tableName: 'organizations', column: 'id' })
  organization_id: number;

  @ValidateIf((o) => o.type === OrganizationReportTypeEnum.message)
  @IsNotEmpty() // Ensure it's not empty when required
  @IsExist({ tableName: 'group_messages', column: 'id' })
  message_id?: number;

  @ValidateIf((o) => o.type === OrganizationReportTypeEnum.message)
  @IsNotEmpty() // Ensure it's not empty when required
  @IsExist({ tableName: 'abuse_types', column: 'id' })
  abuse_type_id?: number;

  @ValidateIf((o) => o.type === OrganizationReportTypeEnum.message)
  @IsNotEmpty() // Ensure it's not empty when required
  @IsExist({ tableName: 'events', column: 'id' })
  event_id?: number;

  @IsOptional()
  @IsString()
  additional_description?: string;
}
