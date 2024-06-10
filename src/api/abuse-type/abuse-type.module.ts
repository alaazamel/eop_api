import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbuseType } from './entities/abuse-type.entity';
import { AbuseTypeService } from './abuse-type.service';
import { AbuseTypeController } from './abuse-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AbuseType])],
  providers: [AbuseTypeService],
  controllers: [AbuseTypeController],
})
export class AbuseTypeModule {}
