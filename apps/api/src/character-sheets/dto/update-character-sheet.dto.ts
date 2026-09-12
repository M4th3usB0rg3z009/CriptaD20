import {
  IsNotEmptyObject,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateCharacterSheetDto {
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  data?: Record<string, any>;
}