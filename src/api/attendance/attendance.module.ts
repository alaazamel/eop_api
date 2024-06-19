import { Module } from '@nestjs/common';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './attendance.controller';
import { QrCodeService } from './services/qrcode.service';
import { AppConfigModule } from '../../config/app/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceQrCode } from './entities/attendance-qrcode.entity';
import { AttendeeModule } from '../attendee/attendee.module';
import { AttendanceDay } from './entities/attendance-day.entity';

@Module({
  imports: [
    AttendeeModule,
    AppConfigModule,
    TypeOrmModule.forFeature([AttendanceQrCode, AttendanceDay]),
  ],
  providers: [AttendanceService, QrCodeService],
  controllers: [AttendanceController],
  exports: [QrCodeService, AttendanceService],
})
export class AttendanceModule {}
