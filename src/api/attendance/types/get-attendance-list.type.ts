import { GetAttendanceListDto } from '../dto/get-attendance-list.dto';
import { GenericFilter } from '../../../common/interfaces/query.interface';

export type GetAttendanceListType = GetAttendanceListDto & GenericFilter & {};
