import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@criptad20/database';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UsersService } from '../users/users.service';
import { AddCampaignMemberDto } from './dto/add-campaign-member.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly usersService: UsersService) {}
  create(ownerId: string, dto: CreateCampaignDto) {
    return prisma.campaign.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        ownerId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

async remove(campaignId: string, userId: string) {
  await this.findOneByUser(campaignId, userId);

  await prisma.campaign.delete({
    where: {
      id: campaignId,
    },
  });

  return {
    message: 'Campanha excluída com sucesso.',
  };
}

async addMember(
  campaignId: string,
  ownerId: string,
  dto: AddCampaignMemberDto,
) {
  await this.findOneByUser(campaignId, ownerId);

  const username = dto.username.trim();

  const user = await this.usersService.findByUsername(username);

  if (!user) {
    throw new NotFoundException('Usuário não encontrado.');
  }

  if (user.id === ownerId) {
    throw new ConflictException(
      'O dono da campanha já faz parte da campanha.',
    );
  }

  const existingMember = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    throw new ConflictException(
      'Este usuário já participa da campanha.',
    );
  }

  return prisma.campaignMember.create({
    data: {
      campaignId,
      userId: user.id,
      role: 'PLAYER',
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
}

  async update(
  campaignId: string,
  userId: string,
  dto: UpdateCampaignDto,
) {
  await this.findOneByUser(campaignId, userId);

  return prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      ...(dto.name !== undefined && {
        name: dto.name.trim(),
      }),
      ...(dto.description !== undefined && {
        description: dto.description.trim(),
      }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async findAccessibleCampaign(
  campaignId: string,
  userId: string,
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
      name: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,

      owner: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },

      members: {
        select: {
          id: true,
          role: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      },
    },
  });

  if (!campaign) {
    throw new NotFoundException(
      'Campanha não encontrada.',
    );
  }

  return campaign;
}

  async findOneByUser(campaignId: string, userId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  return campaign;
}

  findAllByUser(userId: string) {
  return prisma.campaign.findMany({
    where: {
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
      name: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,

      owner: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },

      members: {
        where: {
          userId,
        },
        select: {
          role: true,
          joinedAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

}


}

