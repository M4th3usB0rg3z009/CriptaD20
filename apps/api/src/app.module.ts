import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { SessionsModule } from './sessions/sessions.module';
import { CharactersModule } from './characters/characters.module';
import { CharacterSheetsModule } from './character-sheets/character-sheets.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CampaignsModule,
    SessionsModule,
    CharactersModule,
    CharacterSheetsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}