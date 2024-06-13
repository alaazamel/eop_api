import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsExist } from '../../../common/decorators/is_exist.decorator';
import { AdminReportTypeEnum } from '../enums/admin-report-type.enum';

export class CreateAdminReportDto {
  @IsEnum(AdminReportTypeEnum)
  type: AdminReportTypeEnum;

  @IsDefined()
  @IsExist({ tableName: 'platform_problems', column: 'id' })
  platform_problem_id?: number;

  @ValidateIf((o) => o.type === AdminReportTypeEnum.event)
  @IsNotEmpty() // Ensure it's not empty when required
  @IsExist({ tableName: 'events', column: 'id' })
  event_id?: number;

  @IsOptional()
  @IsString()
  additional_description?: string;
}
