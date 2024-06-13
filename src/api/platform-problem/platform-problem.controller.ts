import { Controller, Get } from '@nestjs/common';
import { PlatformProblemService } from './platform-problem.service';
import { PlatformProblemSerializer } from './serializers/platform-problem.serializer';

@Controller('platform-problem')
export class PlatformProblemController {
  constructor(private readonly service: PlatformProblemService) {}

  @Get()
  async findAll() {
    const result = await this.service.findAll();
    return PlatformProblemSerializer.serializeList(result);
  }
}
