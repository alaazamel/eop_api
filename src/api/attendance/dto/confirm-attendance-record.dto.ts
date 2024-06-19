import { IsDefined } from 'class-validator';
import { IsExist } from '../../../common/decorators/is_exist.decorator';

export class ConfirmAttendanceRecordDto {
  @IsDefined()
  @IsExist({ tableName: 'attendance_days', column: 'id' })
  record_id: number;
}
