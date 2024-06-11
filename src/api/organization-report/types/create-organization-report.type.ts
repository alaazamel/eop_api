import { CreateOrganizationReportDto } from '../dto/create-organization-report.dto';

export type CreateOrganizationReportType = CreateOrganizationReportDto & {
  reporter_id: number;
};
