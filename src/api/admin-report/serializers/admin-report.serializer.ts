import { AdminReport } from '../entities/admin-report.entity';
import { UserSerializer } from '../../user/serializers/user.serializer';
import * as moment from 'moment/moment';
import { DEFAULT_DB_DATETIME_FORMAT } from '../../../common/constants/constants';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { AdminReportTypeEnum } from '../enums/admin-report-type.enum';
import { PlatformProblemSerializer } from '../../platform-problem/serializers/platform-problem.serializer';

export class AdminReportSerializer {
  static serialize(data: AdminReport, fileUtilityService?: FileUtilityService) {
    return {
      id: data.id,
      type: data.reportType,
      description: data.description ?? null,
      reporter: UserSerializer.serialize(fileUtilityService!, data.reporter),
      event:
        data.reportType == AdminReportTypeEnum.event && data.event
          ? { id: data.event.id, title: data.event.title }
          : null,
      platform_problem: PlatformProblemSerializer.serialize(
        data.platformProblem,
      ),
      date: moment(data.createdAt).format(DEFAULT_DB_DATETIME_FORMAT),
      status: data.status,
      resolved_at: data.resolvedAt
        ? moment(data.resolvedAt).format(DEFAULT_DB_DATETIME_FORMAT)
        : null,
      resolved_by: data.resolvedBy
        ? UserSerializer.serialize(fileUtilityService!, data.resolvedBy)
        : null,
    };
  }

  static serializeList(
    data: AdminReport[],
    fileUtilityService?: FileUtilityService,
  ) {
    return data.map((item) => this.serialize(item, fileUtilityService));
  }
}
