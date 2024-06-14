import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationReport } from './entities/organization-report.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateOrganizationReportType } from './types/create-organization-report.type';
import { CreateOrganizationReportTransformer } from './transformers/create-organization-report.transformer';
import { OrganizationReportsQuery } from './filters/organization-reports.query';
import { OrganizationReportTypeEnum } from './enums/organization-report-type.enum';
import { OrganizationReportStatusEnum } from './enums/organization-report-status.enum';
import { ChatApiService } from '../chat/services/chat-api.service';
import { ChatGateway } from '../chat/gateways/chat.gateway';

@Injectable()
export class OrganizationReportService {
  constructor(
    @InjectRepository(OrganizationReport)
    private readonly repository: Repository<OrganizationReport>,
    private readonly chatApiService: ChatApiService,
    private readonly chatGateway: ChatGateway,
  ) {}

  isReported(userId: number, messageId: number): Promise<boolean> {
    return this.repository.exists({
      where: {
        message: { id: messageId },
        reporter: { id: userId },
        reportType: OrganizationReportTypeEnum.message,
      },
    });
  }

  async resolveMessageReport(reportId: number, resolverId: number) {
    const report = await this.repository.findOne({
      relations: { message: true },
      where: {
        reportType: OrganizationReportTypeEnum.message,
        message: { id: Not(IsNull()) },
        status: Not(OrganizationReportStatusEnum.resolved),
        id: reportId,
      },
    });

    if (!report) {
      // throw an error...
      throw new NotFoundException('The required report is not exist...');
    }

    // delete the message first.
    const { isDeleted, groupId } = await this.chatApiService.deleteMessage(
      report.message!.id,
    );

    if (isDeleted) {
      // notify users...
      this.chatGateway.emitMessageDeletedEvent(groupId!, report.message!.id);

      // mark the report as resolved...
      return this.updateStatus(
        reportId,
        OrganizationReportStatusEnum.resolved,
        resolverId,
      );
    }

    throw new BadRequestException('Error while deleting the message!');
  }

  async updateStatus(
    id: number,
    newStatus: OrganizationReportStatusEnum,
    resolverId: number,
  ) {
    // update
    await this.repository.update(id, {
      status: newStatus,
      resolvedAt: new Date(),
      resolvedBy: { id: resolverId },
    });

    // return the updated entity
    return this.findOne(id);
  }

  findOne(id: number) {
    return this.repository.findOneOrFail({
      where: { id },
      relations: {
        event: true,
        message: { reactions: true, sender: true },
        reporter: true,
        abuseType: true,
        resolvedBy: true,
      },
      withDeleted: true,
    });
  }

  findAll(query: OrganizationReportsQuery, organizationId: number) {
    return this.repository.findAndCount({
      where: { organization: { id: organizationId } },
      relations: {
        event: true,
        message: { reactions: true, sender: true },
        reporter: true,
        abuseType: true,
        resolvedBy: true,
      },
      withDeleted: true,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
  }

  async createReport(data: CreateOrganizationReportType) {
    // transform the result
    const transformedPayload =
      CreateOrganizationReportTransformer.transform(data);

    // create the report...
    const created = this.repository.create(transformedPayload!);

    // save it
    const saved = await this.repository.save(created);
    return this.findOne(saved.id);
  }
}
