import { AdminReportTypeEnum } from '../enums/admin-report-type.enum';
import { CreateAdminReportType } from '../types/create-admin-report.type';

export class CreateAdminReportTransformer {
  static transform(data: CreateAdminReportType) {
    return {
      reportType: data.type,
      event:
        data.type == AdminReportTypeEnum.event
          ? { id: data.event_id }
          : undefined,
      platformProblem: { id: data.platform_problem_id },
      reporter: { id: data.reporter_id },
      description: data.additional_description,
    };
  }
}
