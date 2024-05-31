import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CreateRuleConditionDto } from './create-rule-condition.dto';
import { Type } from 'class-transformer';
import { AssignRewardToRuleDto } from './assign-reward-to-rule.dto';
import { MultipleConditionsOnTheSameDefinedDataInOneRuleConstraint } from '../validators/multiple_conditions_on_the_same_defined_data_in_one_rule_constraint';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateRuleConditionDto)
  @ValidateNested({ each: true })
  @Validate(MultipleConditionsOnTheSameDefinedDataInOneRuleConstraint)
  conditions: CreateRuleConditionDto[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AssignRewardToRuleDto)
  @ValidateNested({ each: true })
  rewards: AssignRewardToRuleDto[];
}
