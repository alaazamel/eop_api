import { Controller } from '@nestjs/common';
import { QrCodeService } from './services/qrcode.service';
import { AttendanceService } from './services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // check attendance record by qr code url...
}
