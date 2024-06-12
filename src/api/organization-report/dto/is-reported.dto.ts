import { IsExist } from '../../../common/decorators/is_exist.decorator';
import { IsDefined } from 'class-validator';

export class IsReportedDto {
  @IsDefined()
  @IsExist({ tableName: 'group_messages', column: 'id' })
  message_id: number;
}
