import { Controller, Get } from '@nestjs/common';
import { AbuseTypeService } from './abuse-type.service';
import { AbuseTypeSerializer } from './serializers/abuse-type.serializer';

@Controller('abuse-type')
export class AbuseTypeController {
  constructor(private readonly abuseTypeService: AbuseTypeService) {}

  @Get()
  async findAll() {
    const data = await this.abuseTypeService.findAll();
    return AbuseTypeSerializer.serializeList(data);
  }
}
