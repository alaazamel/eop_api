import { User } from '../entities/user.entity';
import { FileUtilityService } from '../../../config/files/utility/file-utility.service';
import { UserRole } from '../../userRole/entities/user_role.entity';
import { UserRoleSerializer } from '../../userRole/serializers/user-role.serializer';

export class UserBriefSerializer {
  static serialize(fileUtilityService: FileUtilityService, user?: User) {
    if (!user) return null;

    let avatar: string | null = null;

    if (user.userRole.id == +UserRole.ATTENDEE) {
      avatar = fileUtilityService.getFileUrl(user.attendee?.profilePictureUrl);
    } else if (user.userRole.id == +UserRole.EMPLOYEE) {
      avatar = fileUtilityService.getFileUrl(user.employee?.profile_picture);
    }

    return {
      id: user.id,
      username: user.username,
      avatar: avatar,
      user_role: UserRoleSerializer.serialize(user.userRole),
    };
  }
}
