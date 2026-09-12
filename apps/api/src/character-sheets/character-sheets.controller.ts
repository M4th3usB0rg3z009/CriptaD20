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
import { CreateSheetTemplateDto } from './dto/create-sheet-template.dto';
import { UpdateSheetTemplateDto } from './dto/update-sheet-template.dto';
import { CreateCharacterSheetDto } from './dto/create-character-sheet.dto';

@Controller('campaigns/:campaignId/sheet-templates')
@UseGuards(JwtAuthGuard)
export class CharacterSheetsController {
  constructor(
    private readonly characterSheetsService: CharacterSheetsService,
  ) {}

  @Post()
  createTemplate(
    @Param('campaignId') campaignId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateSheetTemplateDto,
  ) {
    return this.characterSheetsService.createTemplate(
      campaignId,
      request.user.sub,
      dto,
    );
  }

  @Get()
findTemplates(
  @Param('campaignId') campaignId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.findTemplates(
    campaignId,
    request.user.sub,
  );
}

@Get(':templateId')
findTemplate(
  @Param('campaignId') campaignId: string,
  @Param('templateId') templateId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.findTemplate(
    campaignId,
    templateId,
    request.user.sub,
  );
}

@Patch(':templateId')
updateTemplate(
  @Param('campaignId') campaignId: string,
  @Param('templateId') templateId: string,
  @Body() dto: UpdateSheetTemplateDto,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.updateTemplate(
    campaignId,
    templateId,
    request.user.sub,
    dto,
  );
}

@Delete(':templateId')
removeTemplate(
  @Param('campaignId') campaignId: string,
  @Param('templateId') templateId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.characterSheetsService.removeTemplate(
    campaignId,
    templateId,
    request.user.sub,
  );
}
}