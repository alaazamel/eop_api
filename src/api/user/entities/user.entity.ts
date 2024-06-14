import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../userRole/entities/user_role.entity';
import { Exclude } from 'class-transformer';
import { Employee } from '../../employee/entities/employee.entity';
import { Attendee } from '../../attendee/entities/attendee.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { BlockedUser } from '../../admin/entities/blocked-user.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({
    name: 'username',
    type: 'varchar',
    unique: true,
  })
  username!: string;

  @Column({
    name: 'email',
    type: 'varchar',
    unique: true,
  })
  email!: string;

  @Column({
    name: 'password',
    type: 'varchar',
  })
  @Exclude()
  password!: string;

  @ManyToOne(() => UserRole, (role) => role.users, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @Column({
    name: 'user_role_id',
    type: 'bigint',
    unsigned: true,
  })
  @JoinColumn({ name: 'user_role_id' })
  userRole!: UserRole;

  @RelationId((user: User) => user.userRole, 'user_role_id')
  userRoleId: number;

  @Column({
    name: 'refresh_token',
    nullable: true,
    type: 'varchar',
  })
  refreshToken?: string | null;

  @OneToOne(() => Employee, (type) => type.user, { eager: true })
  employee?: Employee;

  @OneToOne(() => Attendee, (type) => type.user, { eager: true })
  attendee?: Attendee;

  @OneToOne(() => Admin, (type) => type.user, { eager: true })
  admin?: Admin;

  @OneToOne(() => BlockedUser, (blocked) => blocked.user)
  blockedUser?: BlockedUser;
}
