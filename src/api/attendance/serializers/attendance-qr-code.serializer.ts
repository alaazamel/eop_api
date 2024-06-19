import { AttendanceQrCode } from '../entities/attendance-qrcode.entity';
import * as moment from 'moment';
import { DEFAULT_DB_DATETIME_FORMAT } from '../../../common/constants/constants';

export class AttendanceQrCodeSerializer {
  static serialize(data: AttendanceQrCode) {
    return {
      id: data.id,
      code: data.code,
      generated_at: moment(data.createdAt).format(DEFAULT_DB_DATETIME_FORMAT),
      attendee: {
        name: `${data.attendee.firstName} ${data.attendee.lastName}`,
        email: `${data.attendee.user.email}`,
        ticket_id: `TK-${data.id}`,
      },
    };
  }
}
