import { Injectable } from '@nestjs/common';
import { AwardStrategy } from './award-strategies/award.strategy.interface';
import { RewardTypesEnum } from '../constants/reward-types.constant';
import { AwardPointsStrategy } from './award-strategies/award-points.strategy';
import { AwardBadgeStrategy } from './award-strategies/award-badge.strategy';
import { DataSource } from 'typeorm';
import { AwardRedeemablePointsStrategy } from './award-strategies/award-redeemable-points.strategy';

@Injectable()
export class AwardService {
  private readonly strategies: { [key: number]: AwardStrategy };

  constructor(private readonly dataSource: DataSource) {
    this.strategies = {
      [RewardTypesEnum.POINTS]: new AwardPointsStrategy(this.dataSource),
      [RewardTypesEnum.BADGE]: new AwardBadgeStrategy(this.dataSource),
      [RewardTypesEnum.REDEEMABLE_POINTS]: new AwardRedeemablePointsStrategy(
        this.dataSource,
      ),
    };
  }

  getStrategy(reward_type: RewardTypesEnum) {
    return this.strategies[reward_type];
  }
}
