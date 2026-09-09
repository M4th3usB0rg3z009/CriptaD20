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
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('campaigns/:campaignId/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  @Get()
findAll(
  @Param('campaignId') campaignId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.sessionsService.findAll(
    campaignId,
    request.user.sub,
  );
}

@Patch(':sessionId')
update(
  @Param('campaignId') campaignId: string,
  @Param('sessionId') sessionId: string,
  @Body() dto: UpdateSessionDto,
  @Req() request: AuthenticatedRequest,
) {
  return this.sessionsService.update(
    campaignId,
    sessionId,
    request.user.sub,
    dto,
  );
}

@Delete(':sessionId')
remove(
  @Param('campaignId') campaignId: string,
  @Param('sessionId') sessionId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.sessionsService.remove(
    campaignId,
    sessionId,
    request.user.sub,
  );
}

@Get(':sessionId')
findOne(
  @Param('campaignId') campaignId: string,
  @Param('sessionId') sessionId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.sessionsService.findOne(
    campaignId,
    sessionId,
    request.user.sub,
  );
}

  @Post()
  create(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateSessionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessionsService.create(
      campaignId,
      request.user.sub,
      dto,
    );
  }
}