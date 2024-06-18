import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app/config.module';
import { DBConfigModule } from './config/database/postgresql/config.module';
import { PostgresSQLServerDatabaseProviderModule } from './providers/database/postgresql/provider.module';
import { LoggerConfigModule } from './config/logger/sentryio/config.module';
import { SwaggerConfigModule } from './config/openapi/swagger/config.module';
import { HealthController } from './api/health/health.controller';
import { OrganizationModule } from './api/organization/organization.module';
import { EmployeeModule } from './api/employee/employee.module';
import { ContactModule } from './api/contact/contact.module';
import { PermissionsModule } from './api/permission/permissions.module';
import { IsUniqueConstraint } from './common/validators/is_unique_constraint';
import { IsExistConstraint } from './common/validators/is_exist_constraint';
import { AuthModule } from './auth/auth.module';
import {
  AddressModule,
  AdminModule,
  AttendeeModule,
  CityModule,
  JobModule,
  StateModule,
  UserModule,
  UserRoleModule,
} from './api';
import { JwtConfigModule } from './config/secrets/jwt/config.module';
import { MulterConfigModule } from './config/files/multer/config.module';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './config/files/multer/config.service';
import {
  ServeStaticModule,
  ServeStaticModuleOptions,
} from '@nestjs/serve-static';
import { join } from 'path';
import { FileUtilityModule } from './config/files/utility/file-utility.module';
import { ConfigurationListsModule } from './api/configurationLists/configuration-lists.module';
import { TagModule } from './api/tag/tag.module';
import { ApprovalStatusModule } from './api/approval-status/approval-status.module';
import { EventModule } from './api/event/event.module';
import { AgeGroupModule } from './api/age-group/age-group.module';
import { SlotStatusModule } from './api/slot-status/slot-status.module';
import { AttendEventModule } from './api/attend-event/attend-event.module';
import { DynamicFormsModule } from './api/dynamic-forms/dynamic-forms.module';
import { StripeModule } from './api/stripe/stripe.module';
import * as process from 'process';
import { PaymentModule } from './api/payment/payment.module';
import { FeedModule } from './api/feed/feed.module';
import { ChatModule } from './api/chat/chat.module';
import { IsNotExistConstraint } from './common/validators/is_not_exist_constraint';
import { FeaturedEventsModule } from './api/featured-events/featured-events.module';
import { SeedingModule } from './api/seeding/seeding.module';
import { GamificationModule } from './api/gamification/gamification.module';
import { AbuseTypeModule } from './api/abuse-type/abuse-type.module';
import { OrganizationReportModule } from './api/organization-report/organization-report.module';
import { AdminReportModule } from './api/admin-report/admin-report.module';
import { PlatformProblemModule } from './api/platform-problem/platform-problem.module';
import { GiftCardsModule } from './api/gift-cards/gift-cards.module';
import { AttendanceModule } from './api/attendance/attendance.module';

@Module({
  imports: [
    AppConfigModule,
    DBConfigModule,
    JwtConfigModule,
    PostgresSQLServerDatabaseProviderModule,
    LoggerConfigModule,
    SwaggerConfigModule,
    UserRoleModule,
    UserModule,
    AddressModule,
    AdminModule,
    AttendeeModule,
    CityModule,
    JobModule,
    StateModule,
    OrganizationModule,
    EmployeeModule,
    ContactModule,
    PermissionsModule,
    AuthModule,
    MulterConfigModule,
    ServeStaticModule.forRootAsync({
      imports: [MulterConfigModule],
      useFactory: async (multerConfigService: MulterConfigService) =>
        [
          {
            rootPath: join(__dirname, '..', multerConfigService.dest),
          },
        ] as ServeStaticModuleOptions[],
      inject: [MulterConfigService],
    }),
    MulterModule.registerAsync({
      imports: [MulterConfigModule],
      useFactory: async (multerConfigService: MulterConfigService) => ({
        dest: multerConfigService.dest,
        limits: { fileSize: multerConfigService.fileSizeLimit },
        fileFilter: (_req, file, cb) => {
          if (multerConfigService.allowedMimeTypes) {
            if (!multerConfigService.allowedMimeTypes.includes(file.mimetype)) {
              return cb(new Error('Invalid file type'), false);
            }
          }
          cb(null, true);
        },
      }),
      inject: [MulterConfigService],
    }),
    FileUtilityModule,
    ConfigurationListsModule,
    TagModule,
    ApprovalStatusModule,
    EventModule,
    AgeGroupModule,
    SlotStatusModule,
    AttendEventModule,
    DynamicFormsModule,
    FeedModule,
    ChatModule,
    StripeModule.forRoot(process.env.STRIPE_KEY ? process.env.STRIPE_KEY : '', {
      apiVersion: '2024-04-10',
    }),
    PaymentModule,
    FeaturedEventsModule,
    SeedingModule,
    AbuseTypeModule,
    GamificationModule,
    OrganizationReportModule,
    GiftCardsModule,
    AdminReportModule,
    PlatformProblemModule,
    AttendanceModule,
  ],
  providers: [IsUniqueConstraint, IsExistConstraint, IsNotExistConstraint],
  controllers: [HealthController],
})
export class AppModule {}
