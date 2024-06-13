import { Module } from '@nestjs/common';
import { AdminReportService } from './admin-report.service';
import { AdminReportController } from './admin-report.controller';
import { FileUtilityModule } from '../../config/files/utility/file-utility.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminReport } from './entities/admin-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminReport]), FileUtilityModule],
  providers: [AdminReportService],
  controllers: [AdminReportController],
})
export class AdminReportModule {}
