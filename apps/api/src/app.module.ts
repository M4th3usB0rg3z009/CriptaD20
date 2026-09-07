import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}