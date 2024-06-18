import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { AppConfigService } from '../../../config/app/config.service';
import { AttendanceQrCode } from '../entities/attendance-qrcode.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(AttendanceQrCode)
    private readonly repository: Repository<AttendanceQrCode>,
    private readonly appConfigService: AppConfigService,
  ) {}

  private async generateQrCode(data: string): Promise<string> {
    try {
      return qrcode.toDataURL(data);
    } catch (error) {
      throw new Error('Failed to generate QR code.');
    }
  }

  public findOneById(id: number, queryRunner?: QueryRunner) {
    const repository =
      queryRunner?.manager.getRepository(AttendanceQrCode) ?? this.repository;
    return repository.findOne({
      where: { id },
    });
  }

  public findOneBy(
    eventId: number,
    attendeeId: number,
    queryRunner?: QueryRunner,
  ) {
    const repository =
      queryRunner?.manager.getRepository(AttendanceQrCode) ?? this.repository;
    return repository.findOne({
      where: { event: { id: eventId }, attendee: { id: attendeeId } },
      relations: { event: true, attendee: true },
    });
  }

  public async deleteById(id: number, queryRunner?: QueryRunner) {
    const repository =
      queryRunner?.manager.getRepository(AttendanceQrCode) ?? this.repository;

    const deletionResult = (await repository.delete(id)).affected;
    return deletionResult && deletionResult > 0;
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

  public async createAndStoreQrCode(
    attendeeId: number,
    eventId: number,
    queryRunner?: QueryRunner,
  ): Promise<AttendanceQrCode> {
    const repository =
      queryRunner?.manager.getRepository(AttendanceQrCode) ?? this.repository;

    // generate qr code...
    const generatedQrCode: string = await this.generateAttendanceQrCode(
      attendeeId,
      eventId,
    );

    // create the entity...
    const created = repository.create({
      event: { id: eventId },
      attendee: { id: attendeeId },
      code: generatedQrCode,
    });

    // save it...
    return repository.save(created);
  }
}
