import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from '../userRole/entities/user_role.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Permission } from '../permission/entities/permission.entity';
import { EmployeePermission } from './entities/employee_permission.entity';
import { AllEmployeesSerializer } from './seializers/all_employees.serializer';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, imageName: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const user = this.userRepo.create({
        username: createEmployeeDto.username,
        email: createEmployeeDto.email,
        password: createEmployeeDto.password,
      });

      user.userRole = { id: 2 } as UserRole;

      await queryRunner.manager.save(user);

      const employee = this.employeeRepository.create({
        first_name: createEmployeeDto.first_name,
        last_name: createEmployeeDto.last_name,
        birth_date: createEmployeeDto.birth_date,
        phone_number: createEmployeeDto.phone_number,
        user: user,
        organization: { id: createEmployeeDto.organization_id } as Organization,
        profile_picture: imageName,
      });

      await queryRunner.manager.save(employee);

      const permissions = createEmployeeDto.permissions.map((p) => {
        const employeePermission = new EmployeePermission();
        employeePermission.employee = employee;
        employeePermission.permission = { id: p } as Permission;

        return employeePermission;
      });

      await queryRunner.manager.save(permissions);

      await queryRunner.commitTransaction();

      return employee;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async findAll() {
    const employees = await this.employeeRepository.find({
      relations: { permissions: true, user: true },
    });
    return employees.map((employee) => new AllEmployeesSerializer(employee));
  }

  async findOne(id: number) {
    return await this.employeeRepository.findOneOrFail({
      where: { id },
      relations: { user: true, permissions: true, organization: true },
    });
  }

  async update(id: number, _updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findOneOrFail({
      where: { id },
      relations: { user: true },
    });

    const user = await this.userRepo.findOneOrFail({
      where: { id: employee.user.id },
    });

    Object.assign(user, _updateEmployeeDto);
    Object.assign(employee, _updateEmployeeDto);

    await this.employeeRepository.save(employee);
    await this.userRepo.save(user);

    return employee;
  }

  async remove(id: number) {
    const employee = this.employeeRepository.findOneOrFail({
      where: { id },
    });

    await this.employeeRepository.softDelete(id);

    return employee;
  }
}
