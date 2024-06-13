import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { PlatformProblemCategoryEnum } from '../enums/platform-problem-category.enum';

@Entity('platform_problems')
export class PlatformProblem extends BaseEntity {
  @Column({
    name: 'content',
    type: 'text',
  })
  content: string;

  @Column({
    type: 'enum',
    name: 'category',
    enum: PlatformProblemCategoryEnum,
    default: PlatformProblemCategoryEnum.general,
  })
  category: PlatformProblemCategoryEnum;
}
