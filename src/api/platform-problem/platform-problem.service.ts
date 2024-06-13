import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlatformProblem } from './entities/platform-problem.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlatformProblemService {
  constructor(
    @InjectRepository(PlatformProblem)
    private readonly repository: Repository<PlatformProblem>,
  ) {}

  findAll() {
    return this.repository.find();
  }
}
