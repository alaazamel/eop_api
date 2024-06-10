import { Controller, Get } from '@nestjs/common';
import { SeedingService } from './seeding.service';

@Controller('seed')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Get()
  async seed() {
    await this.seedingService.seedAgeGroups();
    await this.seedingService.seedApprovalStatus();
    await this.seedingService.seedJobs();
    await this.seedingService.seedCities();
    await this.seedingService.seedStates();
    await this.seedingService.seedAddresses();
    await this.seedingService.seedFieldsTypes();
    await this.seedingService.seedQueryOperators();
    await this.seedingService.seedFieldsTypesOperators();
    await this.seedingService.seedPermissions();
    await this.seedingService.seedTicketsEventsTypes();
    await this.seedingService.seedSlotStatuses();
    await this.seedingService.seedTags();
    await this.seedingService.seedContacts();
    await this.seedingService.seedUserRoles();
    await this.seedingService.seedChatReactions();
    await this.seedingService.seedFeaturedEventsTypes();
    await this.seedingService.seedAbuseTypes();
    await this.seedingService.seedGamificationDefinedData();
    await this.seedingService.seedGamificationOperators();
    await this.seedingService.seedGamificationDefinedDataOperators();
    await this.seedingService.seedGamificationRewardTypes();
    await this.seedingService.seedGamificationPrizesTypes();
  }

  @Get('admin')
  async seedAdmin() {
    await this.seedingService.seedAdmin();
  }
}
