import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuthUserType } from '../../../common/types/auth-user.type';
import { GetAttendanceListDto } from '../dto/get-attendance-list.dto';
import { EventDay } from '../../event/entities/event-day.entity';

@Injectable()
export class CheckIfEmployeeHasAccessToEventDayInterceptor
  implements NestInterceptor
{
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const user: AuthUserType = req.user;
    const body: GetAttendanceListDto = req.body;

    // check if employee has access to the event...
    const hasAccess: boolean = await this.dataSource
      .getRepository(EventDay)
      .createQueryBuilder('ed')
      .innerJoin('ed.event', 'event')
      .innerJoin('event.organization', 'organization')
      .innerJoin('organization.employees', 'employees')
      .where('employees.user_id = :userId', { userId: user.sub })
      .andWhere('ed.id = :eventDayId', { eventDayId: body.event_day_id })
      .getExists();

    if (!hasAccess) {
      throw new ForbiddenException("You don't have access to this event");
    }
    return next.handle();
  }
}
