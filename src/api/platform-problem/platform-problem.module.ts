import { Module } from '@nestjs/common';
import { PlatformProblemService } from './platform-problem.service';
import { PlatformProblemController } from './platform-problem.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformProblem } from './entities/platform-problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformProblem])],
  controllers: [PlatformProblemController],
  providers: [PlatformProblemService],
})
export class PlatformProblemModule {}
