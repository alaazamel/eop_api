import { Event } from '../entities/event.entity';
import { OrganizationSerializer } from '../../organization/serializers/organization.serializer';
import { AddressSerializer } from '../../address/serializers/address.serializer';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import * as moment from 'moment';
import { DEFAULT_DB_DATETIME_FORMAT } from '../../../common/constants/constants';
import { EventAgeGroupSerializer } from './event-age-group.serializer';
import { EventTagSerializer } from './event-tag.serializer';
import { EventDaySerializer } from './event-day.serializer';
import { EventPhotoSerializer } from './event-photo.serializer';
import { EventAttachmentSerializer } from './event-attachment.serializer';
import { EventApprovalStatusSerializer } from './event-approval-status.serializer';
import { ChatGroupSerializer } from '../../chat/serializers/chat-group.serializer';

export class EventSerializer {
  static serialize(
    fileUtilityService: FileUtilityService,
    data?: Event | null,
  ) {
    if (!data) return null;
    return {
      id: data.id,
      organization: OrganizationSerializer.serialize(
        data.organization,
        fileUtilityService,
      ),
      location: data.location ?? null,
      address: data.address ? AddressSerializer.serialize(data.address) : null,
      address_notes: data.addressNotes ?? null,
      title: data.title,
      cover_picture_url: fileUtilityService.getFileUrl(data.coverPictureUrl),
      description: data.description,
      capacity: data.capacity,
      event_type: data.eventType,
      registration_start_date: data.registrationStartDate
        ? moment(data.registrationStartDate).format(DEFAULT_DB_DATETIME_FORMAT)
        : null,
      registration_end_date: data.registrationEndDate
        ? moment(data.registrationEndDate).format(DEFAULT_DB_DATETIME_FORMAT)
        : null,
      age_groups: EventAgeGroupSerializer.serializeList(data.targetedAgrGroups),
      tags: EventTagSerializer.serializeList(data.tags),
      days: EventDaySerializer.serializeList(data.days),
      photos: EventPhotoSerializer.serializeList(
        fileUtilityService,
        data.photos,
      ),
      attachments: EventAttachmentSerializer.serializeList(
        data.attachments,
        fileUtilityService,
      ),
      approval_statuses: EventApprovalStatusSerializer.serializeList(
        data.approvalStatuses,
      ),
      is_chatting_enabled: data.isChattingEnabled,
      chat_group: ChatGroupSerializer.serialize(data.chatGroup),
      fees: data.fees,
      form: data.form,
      support_attendance: data.supportAttendance,
    };
  }

  static serializeList(fileUtilityService: FileUtilityService, data?: Event[]) {
    if (!data) return null;
    return data.map((item) => this.serialize(fileUtilityService, item));
  }
}
