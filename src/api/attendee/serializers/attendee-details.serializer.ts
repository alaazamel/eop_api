import { Attendee } from '../entities/attendee.entity';
import * as moment from 'moment';
import { DEFAULT_DATE_FORMAT } from '../../../common/constants/constants';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { JobSerializer } from '../../job/serializers/job.serializer';
import { AddressSerializer } from '../../address/serializers/address.serializer';
import { AttendeeContactSerializer } from './attendee-contact.serializer';
import { EventSerializer } from '../../event/serializers/event.serializer';
import { AttendeeEvent } from '../../attend-event/entities/attendee-event.entity';

export class AttendeeDetailsSerializer {
  static serialize(
    attendee: Attendee,
    fileUtilityService?: FileUtilityService,
  ) {
    return {
      id: attendee.id,
      user_id: attendee.user?.id,
      first_name: attendee.firstName,
      last_name: attendee.lastName,
      full_name: `${attendee.firstName} ${attendee.lastName}`,
      join_date: moment(attendee.createdAt).format(DEFAULT_DATE_FORMAT),
      phone_number: attendee.phoneNumber,
      birth_date: attendee.birthDate
        ? moment(attendee.birthDate).format(DEFAULT_DATE_FORMAT)
        : null,
      profile_img: fileUtilityService?.getFileUrl(attendee.profilePictureUrl),
      cover_img: fileUtilityService?.getFileUrl(attendee.coverPictureUrl),
      bio: attendee.bio,
      job: JobSerializer.serialize(attendee.job),
      address: AddressSerializer.serialize(attendee.address),
      contacts: AttendeeContactSerializer.serializeList(attendee.contacts),
      events: attendee.events
        ? attendee.events
            .filter(
              (attendeeEvent) =>
                attendeeEvent.event !== null &&
                attendeeEvent.event !== undefined,
            )
            .map((attendeeEvent: AttendeeEvent) => {
              return EventSerializer.serialize(
                fileUtilityService!,
                attendeeEvent.event,
              );
            })
        : [],
    };
  }
}
