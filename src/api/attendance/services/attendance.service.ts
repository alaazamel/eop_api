import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceDay } from '../entities/attendance-day.entity';
import { DataSource, DeleteResult, QueryRunner, Repository } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { GetAttendanceRecordType } from '../types/get-attendance-record.type';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceDay)
    private readonly repository: Repository<AttendanceDay>,
    private readonly dataSource: DataSource,
  ) {}

  public async getAttendanceRecordBy(data: GetAttendanceRecordType) {
    return this.repository.findOne({
      where: {
        event: { id: data.eventId },
        attendee: { id: data.attendeeId },
        dayDate: new Date(),
      },
      relations: {
        event: {
          tags: true,
          address: true,
          chatGroup: false,
          attachments: true,
          approvalStatuses: true,
          targetedAgrGroups: true,
        },
        eventDay: { slots: true },
        attendee: true,
        checkedBy: true,
      },
    });
  }

  public async deleteAttendanceRecordsIfGenerated(
    attendeeId: number,
    eventId: number,
    queryRunner?: QueryRunner,
  ) {
    // get the repository
    const repo =
      queryRunner?.manager.getRepository(AttendanceDay) ?? this.repository;

    return repo
      .delete({
        event: { id: eventId },
        attendee: { id: attendeeId },
      })
      .then((result: DeleteResult) => result.affected);
  }

  public async generateAndStoreAttendanceRecords(
    attendeeId: number,
    eventId: number,
    queryRunner?: QueryRunner,
  ) {
    // get the repository
    const repo =
      queryRunner?.manager.getRepository(AttendanceDay) ?? this.repository;

    // generate the records
    const records = await this.generateAttendanceRecords(
      attendeeId,
      eventId,
      queryRunner,
    );

    if (records.length == 0) {
      return;
    }

    // create entities
    const createdDays = records.map((record) => repo.create(record));

    // save them...
    await repo.save(createdDays);
  }

  private async generateAttendanceRecords(
    attendeeId: number,
    eventId: number,
    queryRunner?: QueryRunner,
  ) {
    const doesItSupportAttendance: boolean =
      await this.doesEventSupportAttendance(eventId, queryRunner);

    if (!doesItSupportAttendance) {
      return [];
    }

    const eventDays: { id: number; date: Date }[] = await this.getDaysOfEvent(
      eventId,
      queryRunner,
    );

    return eventDays.map((dayData: { id: number; date: Date }) => ({
      attendee: { id: attendeeId },
      event: { id: eventId },
      dayDate: dayData.date,
      eventDay: { id: dayData.id },
    }));
  }

  private async doesEventSupportAttendance(
    eventId: number,
    queryRunner?: QueryRunner,
  ) {
    // get the repository
    const repo =
      queryRunner?.manager.getRepository(Event) ??
      this.dataSource.getRepository(Event);

    return repo.exists({ where: { id: eventId, supportAttendance: true } });
  }

  private async getDaysOfEvent(eventId: number, queryRunner?: QueryRunner) {
    // get the repository
    const repo =
      queryRunner?.manager.getRepository(Event) ??
      this.dataSource.getRepository(Event);

    function mapEventDays(event: Event | null) {
      return event != null
        ? event.days.map((day) => ({ id: day.id, date: day.dayDate }))
        : [];
    }

    return await repo
      .findOne({
        where: { id: eventId },
        relations: { days: true },
        select: { id: true, days: { id: true, dayDate: true } },
      })
      .then(mapEventDays);
  }
}
