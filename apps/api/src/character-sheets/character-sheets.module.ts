import { Module } from '@nestjs/common';
import { CharacterSheetsController } from './character-sheets.controller';
import { CharacterSheetsService } from './character-sheets.service';
import { CharacterSheetDataController } from './character-sheet-data.controller';

@Module({
  controllers: [CharacterSheetsController, CharacterSheetDataController],
  providers: [CharacterSheetsService]
})
export class CharacterSheetsModule {}
