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
import { CreateCharacterDto } from './dto/create-character.dto';
import { CharactersService } from './characters.service';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Controller('campaigns/:campaignId/characters')

@UseGuards(JwtAuthGuard)
export class CharactersController {
  constructor(
    private readonly charactersService: CharactersService,
  ) {}

  @Post()
  create(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateCharacterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.charactersService.create(
      campaignId,
      request.user.sub,
      dto,
    );
  }

  @Get()
findAll(
  @Param('campaignId') campaignId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.charactersService.findAll(
    campaignId,
    request.user.sub,
  );
}

@Get(':characterId')
findOne(
  @Param('campaignId') campaignId: string,
  @Param('characterId') characterId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.charactersService.findOne(
    campaignId,
    characterId,
    request.user.sub,
  );
}

@Patch(':characterId')
update(
  @Param('campaignId') campaignId: string,
  @Param('characterId') characterId: string,
  @Body() dto: UpdateCharacterDto,
  @Req() request: AuthenticatedRequest,
) {
  return this.charactersService.update(
    campaignId,
    characterId,
    request.user.sub,
    dto,
  );
}

@Delete(':characterId')
remove(
  @Param('campaignId') campaignId: string,
  @Param('characterId') characterId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.charactersService.remove(
    campaignId,
    characterId,
    request.user.sub,
  );
}
}