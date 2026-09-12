import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CharacterSheetsService } from './character-sheets.service';
import { CreateCharacterSheetDto } from './dto/create-character-sheet.dto';
import { UpdateCharacterSheetDto } from './dto/update-character-sheet.dto';

@Controller('characters/:characterId/sheet')
@UseGuards(JwtAuthGuard)
export class CharacterSheetDataController {
  constructor(
    private readonly characterSheetsService: CharacterSheetsService,
  ) {}

  @Post()
  createSheet(
    @Param('characterId') characterId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCharacterSheetDto,
  ) {
    return this.characterSheetsService.createSheet(
      characterId,
      request.user.sub,
      dto,
    );
  }

  @Get()
findSheet(
  @Param('characterId') characterId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.findSheet(
    characterId,
    request.user.sub,
  );
}

@Patch()
updateSheet(
  @Param('characterId') characterId: string,
  @Req() request: AuthenticatedRequest,
  @Body() dto: UpdateCharacterSheetDto,
) {
  return this.characterSheetsService.updateSheet(
    characterId,
    request.user.sub,
    dto,
  );
}

@Delete()
removeSheet(
  @Param('characterId') characterId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.removeSheet(
    characterId,
    request.user.sub,
  );
}
}