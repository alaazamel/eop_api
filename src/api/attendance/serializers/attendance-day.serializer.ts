import { AttendanceDay } from '../entities/attendance-day.entity';
import { EventSerializer } from '../../event/serializers/event.serializer';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { AttendeeDetailsSerializer } from '../../attendee/serializers/attendee-details.serializer';
import {
  DEFAULT_DB_DATE_FORMAT,
  DEFAULT_DB_DATETIME_FORMAT,
} from '../../../common/constants/constants';
import * as moment from 'moment';
import { EventDaySerializer } from '../../event/serializers/event-day.serializer';
import { UserSerializer } from '../../user/serializers/user.serializer';

export class AttendanceDaySerializer {
  static serialize(
    data: AttendanceDay,
    fileUtilityService: FileUtilityService,
  ) {
    return {
      id: data.id,
      date: moment(data.dayDate).format(DEFAULT_DB_DATE_FORMAT),
      attendee: AttendeeDetailsSerializer.serialize(
        data.attendee,
        fileUtilityService,
      ),
      event: EventSerializer.serialize(fileUtilityService, data.event),
      event_day: EventDaySerializer.serialize(data.eventDay),
      attendance_status: data.status,
      last_review: data.checkedBy
        ? moment(data.updatedAt).format(DEFAULT_DB_DATETIME_FORMAT)
        : null,
      checked_by: UserSerializer.serialize(
        fileUtilityService,
        data.checkedBy ?? null,
      ),
    };
  }
}
