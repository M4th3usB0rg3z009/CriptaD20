import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiceService } from './dice.service';
import { RollDiceDto } from './dto/roll-dice.dto';

@Controller('dice')
@UseGuards(JwtAuthGuard)
export class DiceController {
  constructor(private readonly diceService: DiceService) {}

  @Post('roll')
  roll(@Body() dto: RollDiceDto) {
    return this.diceService.roll(dto.expression);
  }

  @Post('sessions/:sessionId/rolls')
rollInSession(
  @Param('sessionId') sessionId: string,
  @Body() dto: RollDiceDto,
  @Req() request: any,
) {
  return this.diceService.rollInSession(
    sessionId,
    request.user.sub,
    dto.expression,
    dto.characterId,
  );  
}

  @Get('sessions/:sessionId/rolls')
  findSessionRolls(
    @Param('sessionId') sessionId: string, 
    @Req() request: any
    ) {
    return this.diceService.findSessionRolls(
        sessionId, 
        request.user.sub
    );
  }
}
