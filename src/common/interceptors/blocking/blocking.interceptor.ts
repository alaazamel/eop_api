import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthUserType } from '../../types/auth-user.type';
import { UserRole } from '../../../api/userRole/entities/user_role.entity';
import { DataSource, Repository } from 'typeorm';
import { BlockedUser } from '../../../api/admin/entities/blocked-user.entity';
import { BlockedOrganization } from '../../../api/admin/entities/blocked-organization.entity';

@Injectable()
export class BlockingInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // extract the required payload...
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const user: AuthUserType = req.user;

    if (!user) {
      return next.handle();
    }

    // check if the user is blocked...
    const { role_id, sub } = user;

    switch (+role_id) {
      case +UserRole.ATTENDEE:
        await this.checkIfAttendeeIsBlocked(sub);
        break;
      case +UserRole.EMPLOYEE:
        await this.checkIfEmployeeIsBlocked(sub);
        break;
    }

    return next.handle();
  }

  private async checkIfAttendeeIsBlocked(userId: number) {
    const repository: Repository<BlockedUser> =
      this.dataSource.getRepository(BlockedUser);

    const isBlocked: boolean = await repository.exists({
      where: { user: { id: userId } },
    });

    if (isBlocked) {
      throw new ForbiddenException('You are blocked!');
    }
  }

  private async checkIfEmployeeIsBlocked(userId: number) {
    const repository: Repository<BlockedOrganization> =
      this.dataSource.getRepository(BlockedOrganization);

    const isBlocked: boolean = await repository
      .createQueryBuilder('bo')
      .innerJoin('bo.organization', 'organization')
      .innerJoin('organization.employees', 'employees')
      .where('employees.user_id = :userId', { userId })
      .getExists();

    if (isBlocked) {
      throw new ForbiddenException('Your organization is blocked!');
    }
  }
}
