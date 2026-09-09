import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@criptad20/database';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  async create(
    campaignId: string,
    ownerId: string,
    dto: CreateSessionDto,
  ) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        ownerId,
      },
      select: {
        id: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    return prisma.session.create({
      data: {
        campaignId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        scheduledAt: dto.scheduledAt
          ? new Date(dto.scheduledAt)
          : null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        scheduledAt: true,
        status: true,
        campaignId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(
  campaignId: string,
  sessionId: string,
  ownerId: string,
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      campaignId,
    },
    select: {
      id: true,
    },
  });

  if (!session) {
    throw new NotFoundException('Sessão não encontrada.');
  }

  await prisma.session.delete({
    where: {
      id: sessionId,
    },
  });

  return {
    message: 'Sessão excluída com sucesso.',
  };
}

  async update(
  campaignId: string,
  sessionId: string,
  ownerId: string,
  dto: UpdateSessionDto,
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new NotFoundException('Campanha não encontrada.');
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      campaignId,
    },
    select: {
      id: true,
    },
  });

  if (!session) {
    throw new NotFoundException('Sessão não encontrada.');
  }

  return prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      ...(dto.name !== undefined && {
        name: dto.name.trim(),
      }),
      ...(dto.description !== undefined && {
        description: dto.description.trim(),
      }),
      ...(dto.scheduledAt !== undefined && {
        scheduledAt: new Date(dto.scheduledAt),
      }),
      ...(dto.status !== undefined && {
        status: dto.status,
      }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      scheduledAt: true,
      status: true,
      campaignId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async findOne(
  campaignId: string,
  sessionId: string,
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

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      campaignId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      scheduledAt: true,
      status: true,
      campaignId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!session) {
    throw new NotFoundException('Sessão não encontrada.');
  }

  return session;
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

  return prisma.session.findMany({
    where: {
      campaignId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      scheduledAt: true,
      status: true,
      campaignId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        scheduledAt: 'asc',
      },
      {
        createdAt: 'asc',
      },
    ],
  });
}
}