import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@criptad20/database';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
  async create(
    campaignId: string,
    userId: string,
    dto: CreateCharacterDto,
  ) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        OR: [
          {
            ownerId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    return prisma.character.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        avatarUrl: dto.avatarUrl,
        sheetData: dto.sheetData,
        campaignId,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatarUrl: true,
        sheetData: true,
        campaignId: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(campaignId: string, userId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  return prisma.character.findMany({
    where: {
      campaignId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      sheetData: true,
      campaignId: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
async findOne(
  campaignId: string,
  characterId: string,
  userId: string,
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      sheetData: true,
      campaignId: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!character) {
    throw new NotFoundException('Personagem não encontrado.');
  }

  return character;
}

async update(
  campaignId: string,
  characterId: string,
  userId: string,
  dto: UpdateCharacterDto,
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!character) {
    throw new NotFoundException('Personagem não encontrado.');
  }

  const canEdit =
    character.ownerId === userId ||
    campaign.ownerId === userId;

  if (!canEdit) {
    throw new NotFoundException('Personagem não encontrado.');
  }

  return prisma.character.update({
    where: {
      id: characterId,
    },
    data: {
      ...(dto.name !== undefined && {
        name: dto.name.trim(),
      }),
      ...(dto.description !== undefined && {
        description: dto.description.trim(),
      }),
      ...(dto.avatarUrl !== undefined && {
        avatarUrl: dto.avatarUrl,
      }),
      ...(dto.sheetData !== undefined && {
        sheetData: dto.sheetData,
      }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      sheetData: true,
      campaignId: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async remove(
  campaignId: string,
  characterId: string,
  userId: string,
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!character) {
    throw new NotFoundException('Personagem não encontrado.');
  }

  const canDelete =
    character.ownerId === userId ||
    campaign.ownerId === userId;

  if (!canDelete) {
    throw new NotFoundException('Personagem não encontrado.');
  }

  await prisma.character.delete({
    where: {
      id: characterId,
    },
  });

  return {
    message: 'Personagem excluído com sucesso.',
  };
}

}