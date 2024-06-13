import { BaseEntity } from '../../../common/entities/base.entity';
import { OrganizationReportTypeEnum } from '../enums/organization-report-type.enum';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { OrganizationReportStatusEnum } from '../enums/organization-report-status.enum';
import { GroupMessage } from '../../chat/entities/group-message.entity';
import { AbuseType } from '../../abuse-type/entities/abuse-type.entity';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('organization_reports')
export class OrganizationReport extends BaseEntity {
  @Column({
    type: 'enum',
    name: 'type',
    enum: OrganizationReportTypeEnum,
    default: OrganizationReportTypeEnum.problem,
  })
  reportType: OrganizationReportTypeEnum;

  @Column({
    type: 'enum',
    name: 'status',
    enum: OrganizationReportStatusEnum,
    default: OrganizationReportStatusEnum.pending,
  })
  status: OrganizationReportStatusEnum;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @RelationId(
    (report: OrganizationReport) => report.organization,
    'organization_id',
  )
  organizationId?: number;

  @ManyToOne(() => GroupMessage, { nullable: true })
  @JoinColumn({ name: 'message_id' })
  message?: GroupMessage;

  @RelationId((report: OrganizationReport) => report.message, 'message_id')
  messageId?: number;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event?: Event;

  @RelationId((report: OrganizationReport) => report.event, 'event_id')
  eventId?: number;

  @ManyToOne(() => AbuseType, { nullable: true })
  @JoinColumn({ name: 'abuse_type_id' })
  abuseType?: AbuseType;

  @RelationId((report: OrganizationReport) => report.abuseType, 'abuse_type_id')
  abuseTypeId?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @RelationId((report: OrganizationReport) => report.reporter, 'reporter_id')
  reporterId: number;

  @Column({
    name: 'description',
    nullable: true,
    type: 'text',
  })
  description?: string;

  @Column({
    name: 'resolved_at',
    type: 'timestamp',
    nullable: true,
  })
  resolvedAt!: Date | null;
}
