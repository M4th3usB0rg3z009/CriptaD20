import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCampaignInviteDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  username: string;
}