import { User } from '../entities/user.entity';
import { UserRoleSerializer } from '../../userRole/serializers/user-role.serializer';
import { Attendee } from '../../attendee/entities/attendee.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { AttendeeDetailsSerializer } from '../../attendee/serializers/attendee-details.serializer';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { EmployeeDetailsSerializer } from '../../employee/seializers/employee-details.serializer';
import { AdminSerializer } from '../../admin/serializers/admin.serializer';
import { UserRole } from '../../userRole/entities/user_role.entity';

export class UserSerializer {
  static _getAttendeeData(
    fileUtilityService: FileUtilityService,
    attendee?: Attendee,
  ) {
    if (!attendee) return undefined;
    return AttendeeDetailsSerializer.serialize(attendee, fileUtilityService);
  }

  static _getEmployeeData(
    fileUtilityService: FileUtilityService,
    employee?: Employee,
  ) {
    if (!employee) return undefined;
    return EmployeeDetailsSerializer.serialize(fileUtilityService, employee);
  }

  static _getAdminData(fileUtilityService: FileUtilityService, admin?: Admin) {
    if (!admin) return undefined;
    return AdminSerializer.serialize(fileUtilityService, admin);
  }

  static serialize(fileUtilityService: FileUtilityService, user: User | null) {
    if (!user) return null;
    return {
      user_id: user.id,
      user_role: UserRoleSerializer.serialize(user.userRole),
      username: user.username,
      user_email: user.email,
      attendee:
        user.userRole.id == UserRole.ATTENDEE
          ? this._getAttendeeData(fileUtilityService, user.attendee)
          : undefined,
      employee:
        user.userRole.id == UserRole.EMPLOYEE
          ? this._getEmployeeData(fileUtilityService, user.employee)
          : undefined,
      admin:
        user.userRole.id == UserRole.ADMIN
          ? this._getAdminData(fileUtilityService, user.admin)
          : undefined,
    };
  }
}
