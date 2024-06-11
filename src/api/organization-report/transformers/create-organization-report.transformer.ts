import { CreateOrganizationReportType } from '../types/create-organization-report.type';
import { OrganizationReportTypeEnum } from '../enums/organization-report-type.enum';
import { GroupMessage } from '../../chat/entities/group-message.entity';

export class CreateOrganizationReportTransformer {
  static transform(data: CreateOrganizationReportType) {
    return {
      reportType: data.type,
      organization: { id: data.organization_id },
      message:
        data.type == OrganizationReportTypeEnum.message
          ? ({ id: data.message_id } as GroupMessage)
          : undefined,
      event:
        data.type == OrganizationReportTypeEnum.message
          ? { id: data.event_id }
          : undefined,
      abuseType:
        data.type == OrganizationReportTypeEnum.message
          ? { id: data.abuse_type_id }
          : undefined,
      reporter: { id: data.reporter_id },
      description: data.additional_description,
    };
  }
}
