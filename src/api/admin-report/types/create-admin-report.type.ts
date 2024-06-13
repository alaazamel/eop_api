import { CreateAdminReportDto } from '../dto/create-admin-report.dto';

export type CreateAdminReportType = CreateAdminReportDto & {
  reporter_id: number;
};
