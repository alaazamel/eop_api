import { GenericFilter } from '../../../common/interfaces/query.interface';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsDateFormat } from '../../../common/decorators/is-date-format.decorator';
import { DEFAULT_DB_DATE_FORMAT } from '../../../common/constants/constants';

export class AdminReportsQuery extends GenericFilter {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateFormat(DEFAULT_DB_DATE_FORMAT)
  start_date?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateFormat(DEFAULT_DB_DATE_FORMAT)
  end_date?: Date;
}
