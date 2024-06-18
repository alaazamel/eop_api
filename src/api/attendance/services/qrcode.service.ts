import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { AppConfigService } from '../../../config/app/config.service';

@Injectable()
export class QrCodeService {
  constructor(private readonly appConfigService: AppConfigService) {}

  private async generateQrCode(data: string): Promise<string> {
    try {
      return qrcode.toDataURL(data);
    } catch (error) {
      throw new Error('Failed to generate QR code.');
    }
  }

  public async generateAttendanceQrCode(
    attendeeId: number,
    eventId: number,
  ): Promise<string> {
    // get the base url...
    const baseUrl: string = this.appConfigService.url + '/api';
    const attendancePath: string = this.appConfigService.attendancePath;

    // Construct the full URL with query parameters
    const attendanceUrl = `${baseUrl}/${attendancePath}?attendeeId=${attendeeId}&eventId=${eventId}`;

    // Generate the QR code from the constructed URL
    return this.generateQrCode(attendanceUrl);
  }
}
