import { Module } from '@nestjs/common';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './attendance.controller';
import { QrCodeService } from './services/qrcode.service';
import { AppConfigModule } from '../../config/app/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceQrCode } from './entities/attendance-qrcode.entity';
import { AttendeeModule } from '../attendee/attendee.module';

@Module({
  imports: [
    AttendeeModule,
    AppConfigModule,
    TypeOrmModule.forFeature([AttendanceQrCode]),
  ],
  providers: [AttendanceService, QrCodeService],
  controllers: [AttendanceController],
  exports: [QrCodeService],
})
export class AttendanceModule {}
