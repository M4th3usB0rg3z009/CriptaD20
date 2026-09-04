import { Controller, Get } from '@nestjs/common';
import { prisma } from '@criptad20/database';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'grimorio',
      version: '0.1.0',
    };
  }

  @Get('health/database')
  async databaseHealth() {
    const users = await prisma.user.count();

    return {
      status: 'ok',
      database: 'connected',
      users,
    };
  }
}