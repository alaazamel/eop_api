import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { AdminReportTypeEnum } from '../enums/admin-report-type.enum';
import { Event } from '../../event/entities/event.entity';
import { User } from '../../user/entities/user.entity';
import { AdminReportStatusEnum } from '../enums/admin-report-status.enum';
import { PlatformProblem } from '../../platform-problem/entities/platform-problem.entity';

@Entity('admin_reports')
export class AdminReport extends BaseEntity {
  @Column({
    type: 'enum',
    name: 'type',
    enum: AdminReportTypeEnum,
    default: AdminReportTypeEnum.general,
  })
  reportType: AdminReportTypeEnum;

  @Column({
    type: 'enum',
    name: 'status',
    enum: AdminReportStatusEnum,
    default: AdminReportStatusEnum.pending,
  })
  status: AdminReportStatusEnum;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event?: Event;

  @RelationId((report: AdminReport) => report.event, 'event_id')
  eventId?: number;

  @ManyToOne(() => PlatformProblem)
  @JoinColumn({ name: 'platform_problem_id' })
  platformProblem: PlatformProblem;

  @RelationId(
    (report: AdminReport) => report.platformProblem,
    'platform_problem_id',
  )
  platformProblemId?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @RelationId((report: AdminReport) => report.reporter, 'reporter_id')
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
