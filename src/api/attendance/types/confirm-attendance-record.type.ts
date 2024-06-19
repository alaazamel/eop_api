import { ConfirmAttendanceRecordDto } from '../dto/confirm-attendance-record.dto';

export type ConfirmAttendanceRecordType = ConfirmAttendanceRecordDto & {
  user_id: number;
};
