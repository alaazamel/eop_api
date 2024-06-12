import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { AbuseTypeCategoryEnum } from '../enums/abuse-type-category.enum';

@Entity('abuse_types')
export class AbuseType extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    name: 'category',
    nullable: false,
    enum: AbuseTypeCategoryEnum,
    default: AbuseTypeCategoryEnum.general,
  })
  category: AbuseTypeCategoryEnum;
}
