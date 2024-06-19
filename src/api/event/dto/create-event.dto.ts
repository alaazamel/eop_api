import { IsExist } from '../../../common/decorators/is_exist.decorator';
import { EventType } from '../enums/event-type.enum';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateEventDayDto } from './create-event-day.dto';
import { Transform, Type } from 'class-transformer';
import { EventTagDto } from './event-tag.dto';
import { EventAgeGroupDto } from './event-age-group.dto';
import { CreateLocationDto } from './create-location.dto';
import { CreateEventChatGroupDto } from './create-event-chat-group.dto';

export class CreateEventDto {
  organization_id?: number;

  @IsOptional()
  @IsExist({ tableName: 'addresses', column: 'id' })
  address_id?: number;

  @IsOptional()
  @Type(() => CreateLocationDto)
  @ValidateNested()
  location?: CreateLocationDto;

  @IsString()
  @IsOptional()
  address_notes?: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsDefined()
  description!: string;

  @IsOptional()
  @IsNumberString({ locale: 'en-US' })
  capacity?: number;

  @IsEnum(EventType)
  event_type!: EventType;

  @IsDefined()
  @Type(() => Date)
  @IsDate()
  registration_start_date!: Date;

  @IsDefined()
  @Type(() => Date)
  @IsDate()
  registration_end_date?: Date;

  // Days
  @ArrayNotEmpty()
  @Type(() => CreateEventDayDto)
  @ValidateNested({ each: true })
  days: CreateEventDayDto[];

  // Tags
  @ArrayNotEmpty()
  @Type(() => EventTagDto)
  @ValidateNested({ each: true })
  tags: EventTagDto[];

  // Age Groups
  @ArrayNotEmpty()
  @Type(() => EventAgeGroupDto)
  @ValidateNested({ each: true })
  age_groups: EventAgeGroupDto[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  direct_register: boolean = true;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  fees: number;

  @IsOptional()
  @IsExist({ tableName: 'forms', column: 'id' })
  form_id: number;

  // This parameter specify whether the chatting room available or not.
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_chatting_enabled: boolean = false;

  // Custom validation function for chat_group based on is_chatting_enabled
  @ValidateIf((dto: CreateEventDto) => dto.is_chatting_enabled)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateEventChatGroupDto)
  chat_group?: CreateEventChatGroupDto;

  @IsOptional()
  @IsBoolean()
  support_attendance: boolean = true;
}
