import { Injectable } from '@nestjs/common';
import { AdminReport } from './entities/admin-report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminReportTransformer } from './transformers/create-admin-report.transformer';
import { CreateAdminReportType } from './types/create-admin-report.type';
import { AdminReportsQuery } from './filters/admin-reports.query';
import { AdminReportTypeEnum } from './enums/admin-report-type.enum';
import { AdminReportStatusEnum } from './enums/admin-report-status.enum';

@Injectable()
export class AdminReportService {
  constructor(
    @InjectRepository(AdminReport)
    private readonly repository: Repository<AdminReport>,
  ) {}

  async findAll(query: AdminReportsQuery) {
    return this.repository.findAndCount({
      relations: {
        event: true,
        reporter: true,
        platformProblem: true,
      },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
  }

  async findOne(id: number) {
    return this.repository.findOneOrFail({
      where: { id },
      relations: {
        event: true,
        reporter: true,
        platformProblem: true,
      },
    });
  }

  async createReport(payload: CreateAdminReportType) {
    // transform the result
    const transformedPayload = CreateAdminReportTransformer.transform(payload);

    // create the report...
    const created = this.repository.create(transformedPayload);

    // save it...
    const saved = await this.repository.save(created);

    return this.findOne(saved.id);
  }

  async isReported(userId: number, eventId: number) {
    return this.repository.exists({
      where: {
        event: { id: eventId },
        reporter: { id: userId },
        reportType: AdminReportTypeEnum.event,
      },
    });
  }

  async updateStatus(id: number, newStatus: AdminReportStatusEnum) {
    // update
    await this.repository.update(id, {
      status: newStatus,
      resolvedAt: new Date(),
    });

    // return the updated entity
    return this.findOne(id);
  }
}
