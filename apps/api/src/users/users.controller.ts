import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.findById(request.user.sub);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }
}