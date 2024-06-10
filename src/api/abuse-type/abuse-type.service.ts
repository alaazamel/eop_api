import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AbuseType } from './entities/abuse-type.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AbuseTypeService {
  constructor(
    @InjectRepository(AbuseType)
    private readonly repository: Repository<AbuseType>,
  ) {}

  findAll() {
    return this.repository.find();
  }
}
