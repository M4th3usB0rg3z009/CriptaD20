import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum SessionStatusDto {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(SessionStatusDto)
  status?: SessionStatusDto;
}