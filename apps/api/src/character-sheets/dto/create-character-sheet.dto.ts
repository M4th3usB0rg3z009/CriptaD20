import {
  IsNotEmptyObject,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateCharacterSheetDto {
  @IsString()
  templateId: string;

  @IsObject()
  @IsNotEmptyObject()
  data: Record<string, any>;
}