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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AddCampaignMemberDto } from './dto/add-campaign-member.dto';
import { CreateCampaignInviteDto } from './dto/create-campaign-invite.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
  ) {}

  @Patch(':id')
update(
  @Param('id') id: string,
  @Req() request: AuthenticatedRequest,
  @Body() dto: UpdateCampaignDto,
) {
  return this.campaignsService.update(
    id,
    request.user.sub,
    dto,
  );
}

  @Post(':id/invites')
inviteMember(
  @Param('id') id: string,
  @Body() dto: CreateCampaignInviteDto,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.inviteMember(
    id,
    request.user.sub,
    dto.username,
  );
}

@Get('invites/me')
findMyInvites(
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.findInvitesByUser(
    request.user.sub,
  );
}

@Post('invites/:inviteId/accept')
acceptInvite(
  @Param('inviteId') inviteId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.acceptInvite(
    inviteId,
    request.user.sub,
  );
}

@Post('invites/:inviteId/decline')
declineInvite(
  @Param('inviteId') inviteId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.declineInvite(
    inviteId,
    request.user.sub,
  );
}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(
      request.user.sub,
      dto,
    );
  }

  @Delete(':id')
remove(
  @Param('id') id: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.remove(
    id,
    request.user.sub,
  );
}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.campaignsService.findAllByUser(
      request.user.sub,
    );
  }

  @Get(':id')
findOne(
  @Param('id') id: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.findAccessibleCampaign(
    id,
    request.user.sub,
  );
}

@Get(':id/members')
findMembers(
  @Param('id') id: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.findMembers(
    id,
    request.user.sub,
  );
}

@Delete(':id/members/:userId')
removeMember(
  @Param('id') id: string,
  @Param('userId') userId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.campaignsService.removeMember(
    id,
    request.user.sub,
    userId,
  );
}

@Post(':id/members')
addMember(
  @Param('id') id: string,
  @Req() request: AuthenticatedRequest,
  @Body() dto: AddCampaignMemberDto,
) {
  return this.campaignsService.addMember(
    id,
    request.user.sub,
    dto,
  );
}

}