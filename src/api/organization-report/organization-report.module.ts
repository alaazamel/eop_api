import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationReport } from './entities/organization-report.entity';
import { OrganizationReportController } from './organization-report.controller';
import { OrganizationReportService } from './organization-report.service';
import { FileUtilityModule } from '../../config/files/utility/file-utility.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationReport]),
    FileUtilityModule,
    EmployeeModule,
  ],
  controllers: [OrganizationReportController],
  providers: [OrganizationReportService],
})
export class OrganizationReportModule {}
