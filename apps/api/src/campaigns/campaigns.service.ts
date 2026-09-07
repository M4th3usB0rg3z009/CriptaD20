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

async findMembers(campaignId: string, userId: string) {
  await this.findAccessibleCampaign(campaignId, userId);

  return prisma.campaignMember.findMany({
    where: {
      campaignId,
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
    orderBy: {
      joinedAt: 'asc',
    },
  });
}

async removeMember(
  campaignId: string,
  ownerId: string,
  memberUserId: string,
) {
  await this.findOneByUser(campaignId, ownerId);

  if (memberUserId === ownerId) {
    throw new ConflictException(
      'O dono da campanha não pode ser removido.',
    );
  }

  const member = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId: memberUserId,
      },
    },
  });

  if (!member) {
    throw new NotFoundException(
      'Membro não encontrado nesta campanha.',
    );
  }

  await prisma.campaignMember.delete({
    where: {
      id: member.id,
    },
  });

  return {
    message: 'Membro removido da campanha com sucesso.',
  };
}

async inviteMember(
  campaignId: string,
  ownerId: string,
  username: string,
) {
  await this.findOneByUser(campaignId, ownerId);

  const normalizedUsername = username.trim();

  const user = await this.usersService.findByUsername(
    normalizedUsername,
  );

  if (!user) {
    throw new NotFoundException('Usuário não encontrado.');
  }

  if (user.id === ownerId) {
    throw new ConflictException(
      'O dono da campanha não pode convidar a si mesmo.',
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
      'Este usuário já faz parte da campanha.',
    );
  }

  const existingInvite = await prisma.campaignInvite.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId: user.id,
      },
    },
  });

  if (existingInvite) {
    throw new ConflictException(
      'Este usuário já possui um convite para esta campanha.',
    );
  }

  return prisma.campaignInvite.create({
    data: {
      campaignId,
      userId: user.id,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
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

findInvitesByUser(userId: string) {
  return prisma.campaignInvite.findMany({
    where: {
      userId,
      status: 'PENDING',
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      campaign: {
        select: {
          id: true,
          name: true,
          description: true,
          owner: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async acceptInvite(inviteId: string, userId: string) {
  const invite = await prisma.campaignInvite.findFirst({
    where: {
      id: inviteId,
      userId,
      status: 'PENDING',
    },
  });

  if (!invite) {
    throw new NotFoundException(
      'Convite não encontrado ou não está mais disponível.',
    );
  }

  const existingMember = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId: invite.campaignId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new ConflictException(
      'Você já faz parte desta campanha.',
    );
  }

  await prisma.$transaction([
    prisma.campaignMember.create({
      data: {
        campaignId: invite.campaignId,
        userId,
        role: 'PLAYER',
      },
    }),

    prisma.campaignInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        status: 'ACCEPTED',
      },
    }),
  ]);

  return {
    message: 'Convite aceito com sucesso.',
    campaignId: invite.campaignId,
  };
}

async declineInvite(inviteId: string, userId: string) {
  const invite = await prisma.campaignInvite.findFirst({
    where: {
      id: inviteId,
      userId,
      status: 'PENDING',
    },
  });

  if (!invite) {
    throw new NotFoundException(
      'Convite não encontrado ou não está mais disponível.',
    );
  }

  await prisma.campaignInvite.update({
    where: {
      id: invite.id,
    },
    data: {
      status: 'DECLINED',
    },
  });

  return {
    message: 'Convite recusado com sucesso.',
  };
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

