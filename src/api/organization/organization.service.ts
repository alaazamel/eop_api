import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../userRole/entities/user_role.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Permission } from '../permission/entities/permission.entity';
import { EmployeePermission } from '../employee/entities/employee_permission.entity';
import { Contact } from '../contact/entities/contact.entity';
import { ConfigureOrganizationsDto } from './dto/configure-organizations.dto';
import { ContactOrganization } from './entities/contact_organization.entity';
import { DeleteContactInfoDto } from './dto/delete-contact-info.dto';
import { AddContactInfoDto } from './dto/add-contact-info.dto';
import { AddressOrganization } from './entities/address_organization.entity';
import { Address } from '../address/entities/address.entity';
import { AddOrganizationAddressDto } from './dto/add-organization-address.dto';
import { DeleteOrganizationAddressDto } from './dto/delete-organization-address.dto';
import { hash } from 'bcrypt';
import { BlockedAttendee } from './entities/blocked-attendee.entity';
import { BlockedAttendeeSerializer } from './serializers/blocked-attendee.serializer';
import { FollowingAttendee } from './entities/following-attendee.entity';
import { FileUtilityService } from '../../config/files/utility/file-utility.service';
import { Event } from '../event/entities/event.entity';
import { OrganizationsTickets } from '../payment/entities/organizations-tickets.entity';
import { Attendee } from '../attendee/entities/attendee.entity';
import { AttendeesTickets } from '../payment/entities/attendees-tickets.entity';
import { ChatGateway } from '../chat/gateways/chat.gateway';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(ContactOrganization)
    private readonly contactOrganizationRepository: Repository<ContactOrganization>,
    @InjectRepository(AddressOrganization)
    private readonly addressOrganizationRepository: Repository<AddressOrganization>,
    private readonly dataSource: DataSource,
    private readonly fileUtilityService: FileUtilityService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async checkIfAttendeeIsBlocked(organizationId: number, attendeeId: number) {
    return await this.dataSource.manager.existsBy(BlockedAttendee, {
      attendee: { id: attendeeId },
      organization: { id: organizationId },
    });
  }

  async getOrganizationBlackList(organizationId: number) {
    const organization = await this.organizationRepository.findOne({
      where: {
        id: organizationId,
        blockedAttendees: { attendee: true },
      },
      relations: { blockedAttendees: { attendee: { job: true } } },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with ID=${organizationId} was not found`,
      );
    }

    const data = organization.blockedAttendees;
    return BlockedAttendeeSerializer.serializeList(
      data,
      this.fileUtilityService,
    );
  }

  getListOfOrganizationFollowers(organizationId: number) {
    return this.dataSource.manager.find(FollowingAttendee, {
      where: { organization: { id: organizationId } },
      relations: {
        attendee: {
          address: { city: true, state: true },
          contacts: { contact: true },
        },
      },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const organization = this.organizationRepository.create({
        name: createOrganizationDto.name,
      });

      await queryRunner.manager.save(organization);

      const hashedPassword = await hash(createOrganizationDto.password, 10);

      const user = this.userRepository.create({
        username: createOrganizationDto.username,
        email: createOrganizationDto.email,
        password: hashedPassword,
      });

      user.userRole = { id: 2 } as UserRole;

      await queryRunner.manager.save(user);

      const employee = this.employeeRepository.create({
        first_name: createOrganizationDto.first_name,
        last_name: createOrganizationDto.last_name,
        birth_date: createOrganizationDto.birth_date,
        phone_number: createOrganizationDto.phone_number,

        organization: organization,
        user: user,
      });

      await queryRunner.manager.save(employee);

      const permissions = await this.permissionRepository.find();

      const employeePermissions: EmployeePermission[] = permissions.map((p) => {
        const employeePermission = new EmployeePermission();
        employeePermission.employee = employee;
        employeePermission.permission = p;

        return employeePermission;
      });

      await queryRunner.manager.save(employeePermissions);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return organization;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw e;
    }
  }

  async findAll() {
    return this.organizationRepository
      .find({
        relations: {
          employees: { user: true },
          events: true,
          blockedOrganization: true,
        },
      })
      .then((organizations) =>
        organizations.map((org) => {
          return { ...org, is_blocked: !!org.blockedOrganization };
        }),
      );
  }

  async findOne(id: number) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
      relations: {
        addresses: { address: true },
        contacts: { contact: true },
        employees: { user: true, permissions: { permission: true } },
      },
    });

    const followingAttendeesCount = await this.dataSource.manager.count(
      FollowingAttendee,
      {
        where: { organization: { id } },
      },
    );

    return {
      organization_followers_count: followingAttendeesCount,
      ...organization,
    };
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
    });

    Object.assign(organization, updateOrganizationDto);

    await this.organizationRepository.save(organization);

    return organization;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }

  async configureOrganization(
    configureOrganizationDto: ConfigureOrganizationsDto,
    main_picture: string,
    cover_picture: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const organization = await this.organizationRepository.findOneOrFail({
        where: { id: configureOrganizationDto.organization_id },
      });

      organization.description = configureOrganizationDto.description;
      organization.bio = configureOrganizationDto.bio;
      organization.main_picture = main_picture;
      organization.cover_picture = cover_picture;

      const contacts = configureOrganizationDto.contact_info.map((c) => {
        const contactOrganization = new ContactOrganization();

        contactOrganization.organization = organization;
        contactOrganization.contact = { id: c.contact_id } as Contact;
        contactOrganization.content = c.content;

        return contactOrganization;
      });

      const addresses = configureOrganizationDto.addresses.map((a) => {
        const addressOrganization = new AddressOrganization();

        addressOrganization.organization = organization;
        addressOrganization.address = { id: a.address_id } as Address;

        return addressOrganization;
      });

      await queryRunner.manager.save(organization);
      await queryRunner.manager.save(contacts);
      await queryRunner.manager.save(addresses);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return organization;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw e;
    }
  }

  async getOrganizationEmployees(id: number) {
    return await this.employeeRepository.find({
      where: { organization: { id: id } },
      relations: {
        permissions: { permission: true },
        user: true,
      },
    });
  }

  async deleteContactInfo(
    id: number,
    deleteContactInfoDto: DeleteContactInfoDto,
  ) {
    const contact = await this.contactOrganizationRepository.findOneOrFail({
      where: {
        organization: { id: id },
        contact: { id: deleteContactInfoDto.contact_id },
      },
    });

    await this.contactOrganizationRepository.delete(contact);
  }

  async addContactInfo(id: number, addContactInfoDto: AddContactInfoDto) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
    });

    const contactOrganization = this.contactOrganizationRepository.create({
      content: addContactInfoDto.content,
      contact: { id: addContactInfoDto.contact_id } as Contact,
      organization: organization,
    });

    await this.contactOrganizationRepository.save(contactOrganization);

    return contactOrganization;
  }

  async addOrganizationAddress(
    id: number,
    addAddressDto: AddOrganizationAddressDto,
  ) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
    });

    const addressOrganization = this.addressOrganizationRepository.create({
      address: { id: addAddressDto.address_id } as Address,
      organization: organization,
    });

    await this.addressOrganizationRepository.save(addressOrganization);

    return addressOrganization;
  }

  async deleteOrganizationAddress(
    id: number,
    deleteOrganizationAddressDto: DeleteOrganizationAddressDto,
  ) {
    const address = await this.addressOrganizationRepository.findOneOrFail({
      where: {
        organization: { id: id },
        address: { id: deleteOrganizationAddressDto.address_id },
      },
    });

    await this.addressOrganizationRepository.delete(address);
  }

  async updateOrganizationCoverPicture(
    id: number,
    fileName: string | undefined,
  ) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id },
    });

    if (fileName) {
      organization.cover_picture = fileName;

      await this.organizationRepository.save(organization);

      return organization;
    } else {
      throw new HttpException(
        'could not update the cover picture',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  async updateOrganizationMainPicture(
    id: number,
    fileName: string | undefined,
  ) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id },
    });

    if (fileName) {
      organization.main_picture = fileName;

      await this.organizationRepository.save(organization);

      return organization;
    } else {
      throw new HttpException(
        'could not update the main picture',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  async removeOrganizationMainPicture(id: number) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
    });

    organization.main_picture = null;

    await this.organizationRepository.save(organization);

    return organization;
  }

  async removeOrganizationCoverPicture(id: number) {
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id: id },
    });

    organization.cover_picture = null;

    await this.organizationRepository.save(organization);

    return organization;
  }

  async getOrganizationAttendees(userID: number) {
    const employee = await this.employeeRepository.findOneOrFail({
      where: { user: { id: userID } as User },
    });

    const attendees = await this.dataSource
      .getRepository(Attendee)
      .createQueryBuilder('attendee')
      .select([
        'attendee.id',
        'attendee.firstName',
        'attendee.lastName',
        'attendee.profilePictureUrl',
      ])
      .leftJoin('attendee.events', 'attendEvent')
      .addSelect(['attendEvent.id'])
      .leftJoin('attendEvent.event', 'event')
      .addSelect(['event.id', 'event.title', 'event.description'])
      .leftJoin('event.organization', 'org')
      .addSelect(['org.id'])
      .where('org.id = :orgID', { orgID: employee.organizationId })
      .getMany();

    const attendeesWithEvents = await Promise.all(
      attendees.map(async (attendee) => {
        return {
          ...attendee,
          events: await Promise.all(
            attendee.events.map(async (event) => {
              const eventID = event.event.id;
              const payedFees = await this.dataSource
                .getRepository(AttendeesTickets)
                .createQueryBuilder('tickets')
                .where('tickets.attendee = :attendeeID', {
                  attendeeID: attendee.id,
                })
                .andWhere(`tickets.data::jsonb ->> 'event_id' = :eventId`, {
                  eventId: eventID,
                })
                .getOne()
                .then((obj) => (obj ? Number(obj.value) * -1 : 0));

              return { ...event.event, payedFees: payedFees };
            }),
          ),
        };
      }),
    );

    return attendeesWithEvents.map((attendee) => {
      const totalFees = attendee.events.reduce(
        (acc, event) => acc + Number(event.payedFees),
        0,
      );

      return { ...attendee, totalFees: totalFees };
    });
  }

  async getOrganizationEvents(userID: number) {
    const employee = await this.employeeRepository.findOneOrFail({
      where: { user: { id: userID } as User },
    });

    const orgEvents = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .select(['event.id', 'event.title', 'event.coverPictureUrl'])
      .where('event.organization = :orgID', { orgID: employee.organizationId })
      .leftJoin('event.days', 'ed')
      .groupBy('event.id')
      .addSelect('MIN(ed.dayDate)', 'start_day')
      .getRawMany();

    return await Promise.all(
      orgEvents.map(async (event) => {
        const tickets = await this.dataSource
          .getRepository(OrganizationsTickets)
          .createQueryBuilder('tickets')
          .where(`tickets.data::jsonb ->> 'event_id' = :eventId`, {
            eventId: event.event_id,
          })
          .getMany();

        const sum = tickets.reduce(
          (accumulator, ticket) => accumulator + Number(ticket.value),
          0,
        );

        return { ...event, tickets: sum };
      }),
    );
  }

  async getOrganizationFutureUnFeaturedEvents(orgID: number) {
    return await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .where('event.organization = :orgID', { orgID: orgID })
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM featured_events fe WHERE fe.event_id = event.id AND fe.end_date >= :nowDATE)',
        { nowDATE: new Date() },
      )
      .innerJoin('event.days', 'ed')
      .groupBy('event.id')
      .addSelect('MIN(ed.dayDate)', 'start_day')
      .orderBy('start_day')
      .having('MIN(ed.dayDate) >= :nowDATE', { nowDATE: new Date() })
      .getRawMany();
  }

  async blockAttendee(payload: any, employee: Employee) {
    if (!employee.organization) {
      throw new BadRequestException(
        "You don't have permissions to block a user.",
      );
    }

    // check if the attendee is already blocked, do nothing.
    const isBlocked = await this.dataSource.manager.exists(BlockedAttendee, {
      where: {
        organization: { id: employee.organization.id },
        attendee: { id: payload.attendee_id },
      },
    });

    if (isBlocked) {
      return true;
    }

    const created = this.dataSource.manager.create(BlockedAttendee, {
      organization: { id: employee.organization.id },
      attendee: { id: payload.attendee_id },
      blockedBy: { id: employee.user.id },
    });
    await this.dataSource.manager.save(BlockedAttendee, created);

    // kick user off the chat rooms.
    const eventChatGroups: { group_id: number }[] =
      await this.getListOfOrganizationEventChatGroups(employee.organization.id);

    const userId: number | undefined = await this.getAttendeeUserId(
      payload.attendee_id,
    );
    console.log('User Id = ' + userId);
    if (userId == undefined) {
      return true;
    }

    // emit kicking-off event
    eventChatGroups.forEach((item) => {
      const payload = {
        group_id: item.group_id,
        channel: `group-${item.group_id}`,
      };

      // emit the event
      this.chatGateway.emitUserKickedOffEvent(userId, payload);
    });

    return true;
  }

  async unBlockAttendee(payload: any, employee: Employee) {
    if (!employee.organization) {
      throw new BadRequestException(
        "You don't have permissions to block a user.",
      );
    }

    // check if the attendee is already blocked, do nothing.
    const isBlocked = await this.dataSource.manager.findOne(BlockedAttendee, {
      where: {
        organization: { id: employee.organization.id },
        attendee: { id: payload.attendee_id },
      },
    });

    if (!isBlocked) {
      return false;
    }

    // TODO: CHECK FOR POSSIBLE ALTERNATIVES.
    // unBlock the user
    await this.dataSource.manager.delete(BlockedAttendee, { id: isBlocked.id });

    return true;
  }

  private async getListOfOrganizationEventChatGroups(
    organizationId: number,
  ): Promise<{ group_id: number }[]> {
    return this.dataSource
      .getRepository(Event)
      .find({
        where: {
          organization: { id: organizationId },
          isChattingEnabled: true,
          chatGroup: Not(IsNull()),
        },
        loadEagerRelations: true,
        relations: { chatGroup: true },
        select: { chatGroup: { id: true } },
      })
      .then((events) => events.map((ev) => ({ group_id: ev.chatGroupId! })));
  }

  private async getAttendeeUserId(attendeeId: number) {
    return this.dataSource
      .getRepository(Attendee)
      .findOne({
        select: { user: { id: true } },
        where: { id: attendeeId },
        loadEagerRelations: false,
        loadRelationIds: true,
      })
      .then((at) => {
        if (!at) return undefined;
        return at.userId;
      });
  }
}
