import { IsDefined } from 'class-validator';
import { IsExist } from '../../../common/decorators/is_exist.decorator';

export class GetAttendanceRecordDto {
  @IsDefined()
  @IsExist({ tableName: 'events', column: 'id' })
  eventId: number;

  @IsDefined()
  @IsExist({ tableName: 'attendees', column: 'id' })
  attendeeId: number;
}
