import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@criptad20/database';

export interface DiceRollResult {
  expression: string;
  quantity: number;
  sides: number;
  dice: number[];
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  mode: 'normal' | 'advantage' | 'disadvantage';
}

@Injectable()
export class DiceService {
  roll(expression: string): DiceRollResult {
    const normalized = expression.toLowerCase().trim().replace(/\s+/g, ' ');

    let mode: 'normal' | 'advantage' | 'disadvantage' = 'normal';

    let diceExpression = normalized;

    if (normalized.endsWith(' adv')) {
      mode = 'advantage';
      diceExpression = normalized.slice(0, -4);
    } else if (normalized.endsWith(' dis')) {
      mode = 'disadvantage';
      diceExpression = normalized.slice(0, -4);
    }

    diceExpression = diceExpression.replace(/\s/g, '');

    const match = diceExpression.match(
      /^(\d*)d(4|6|8|10|12|20|100)([+-]\d+)?$/,
    );

    if (!match) {
      throw new BadRequestException('Expressão de dado inválida.');
    }

    const quantity = match[1] ? Number(match[1]) : 1;

    const sides = Number(match[2]);

    const modifier = match[3] ? Number(match[3]) : 0;

    if (quantity < 1 || quantity > 100) {
      throw new BadRequestException(
        'A quantidade de dados deve estar entre 1 e 100.',
      );
    }

    if (mode !== 'normal' && (quantity !== 1 || sides !== 20)) {
      throw new BadRequestException(
        'Vantagem e desvantagem só podem ser usadas com 1d20.',
      );
    }

    let dice: number[];
    let diceTotal: number;

    if (mode === 'advantage' || mode === 'disadvantage') {
      dice = [
        Math.floor(Math.random() * 20) + 1,
        Math.floor(Math.random() * 20) + 1,
      ];

      diceTotal = mode === 'advantage' ? Math.max(...dice) : Math.min(...dice);
    } else {
      dice = Array.from(
        { length: quantity },
        () => Math.floor(Math.random() * sides) + 1,
      );

      diceTotal = dice.reduce((sum, value) => sum + value, 0);
    }

    const total = diceTotal + modifier;

    const naturalResult =
      mode === 'advantage'
        ? Math.max(...dice)
        : mode === 'disadvantage'
          ? Math.min(...dice)
          : dice[0];

    const isCritical = quantity === 1 && sides === 20 && naturalResult === 20;

    const isFumble = quantity === 1 && sides === 20 && naturalResult === 1;

    return {
      expression: normalized,
      quantity,
      sides,
      dice,
      modifier,
      total,
      isCritical,
      isFumble,
      mode,
    };
  }

  async findSessionRolls(sessionId: string, userId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        campaign: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId },
              },
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    return prisma.diceRoll.findMany({
      where: {
        sessionId,
      },
      select: {
        id: true,
        expression: true,
        dice: true,
        modifier: true,
        total: true,
 
        mode: true,
        isCritical: true,
        isFumble: true,
        
        characterId: true,
        sessionId: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async rollInSession(
  sessionId: string,
  userId: string,
  expression: string,
  characterId?: string,
) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        campaign: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId },
              },
            },
          ],
        },
      },
      select: {
        id: true,
        campaignId: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (characterId) {
  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId: session.campaignId,
    },
    select: {
      id: true,
    },
  });

  if (!character) {
    throw new BadRequestException(
      'Personagem não encontrado nesta campanha.',
    );
  }
}

    const result = this.roll(expression);

    const diceRoll = await prisma.diceRoll.create({
      data: {
        expression: result.expression,
        dice: result.dice,
        modifier: result.modifier,
        total: result.total,
        mode: result.mode,
        isCritical: result.isCritical,
        isFumble: result.isFumble,
        sessionId,
        userId,
        characterId,
      },
      select: {
        id: true,
        expression: true,
        dice: true,
        modifier: true,
        total: true,
        mode: true,
        isCritical: true,
        isFumble: true,
        sessionId: true,
        userId: true,
        characterId: true,
        createdAt: true,
      },
    });

    return diceRoll;
  }
}
