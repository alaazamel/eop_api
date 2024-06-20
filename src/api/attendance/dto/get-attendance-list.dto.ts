import { IsDefined } from 'class-validator';
import { IsExist } from '../../../common/decorators/is_exist.decorator';

export class GetAttendanceListDto {
  @IsDefined()
  @IsExist({ tableName: 'event_days', column: 'id' })
  event_day_id: number;
}
