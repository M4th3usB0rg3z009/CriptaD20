import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class RollDiceDto {
  @IsString()
  @Matches(
    /^(\d*)d(4|6|8|10|12|20|100)([+-]\d+)?(\s+(adv|dis))?$/i,
    {
      message: 'Expressão de dado inválida.',
    },
  )
  expression: string;

  @IsOptional()
  @IsUUID()
  characterId?: string;
}