import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@criptad20/database';
import { CreateSheetTemplateDto } from './dto/create-sheet-template.dto';
import { UpdateSheetTemplateDto } from './dto/update-sheet-template.dto';
import { CreateCharacterSheetDto } from './dto/create-character-sheet.dto';
import { UpdateCharacterSheetDto } from './dto/update-character-sheet.dto';
import { validateSheetData } from './utils/validate-sheet-data';
import type { SheetDefinition } from './types/sheet-definition';
import { validateSheetDefinition } from './utils/validate-sheet-definition';
import { validateTemplateUpdate } from './utils/validate-template-update';

@Injectable()
export class CharacterSheetsService {
  async createTemplate(
    campaignId: string,
    userId: string,
    dto: CreateSheetTemplateDto,
  ) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        ownerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    validateSheetDefinition(dto.definition as unknown as SheetDefinition);

    return prisma.characterSheetTemplate.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        definition: dto.definition,
        campaignId,
        createdById: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        definition: true,
        campaignId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findTemplates(campaignId: string, userId: string) {
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

    return prisma.characterSheetTemplate.findMany({
      where: {
        campaignId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        definition: true,
        campaignId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findTemplate(campaignId: string, templateId: string, userId: string) {
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

    const template = await prisma.characterSheetTemplate.findFirst({
      where: {
        id: templateId,
        campaignId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        definition: true,
        campaignId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template de ficha não encontrado.');
    }

    return template;
  }

  async updateTemplate(
    campaignId: string,
    templateId: string,
    userId: string,
    dto: UpdateSheetTemplateDto,
  ) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        ownerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    const template = await prisma.characterSheetTemplate.findFirst({
      where: {
        id: templateId,
        campaignId,
      },
      select: {
        id: true,
        definition: true,
        _count: {
          select: {
            sheets: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template de ficha não encontrado.');
    }

    if (dto.definition !== undefined) {
      const newDefinition = dto.definition as unknown as SheetDefinition;

      validateSheetDefinition(newDefinition);

      if (template._count.sheets > 0) {
        validateTemplateUpdate(
          template.definition as unknown as SheetDefinition,
          newDefinition,
        );
      }
    }

    return prisma.characterSheetTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.definition !== undefined && {
          definition: dto.definition,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        definition: true,
        campaignId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async removeTemplate(campaignId: string, templateId: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        ownerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    const template = await prisma.characterSheetTemplate.findFirst({
      where: {
        id: templateId,
        campaignId,
      },
      select: {
        id: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template de ficha não encontrado.');
    }

    await prisma.characterSheetTemplate.delete({
      where: {
        id: templateId,
      },
    });

    return {
      message: 'Template de ficha removido com sucesso.',
    };
  }

  async createSheet(
    characterId: string,
    userId: string,
    dto: CreateCharacterSheetDto,
  ) {
    // 1. Procura o personagem e verifica se o usuário
    // tem acesso à campanha dele.
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
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

    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    // 2. O template precisa pertencer à mesma campanha.
    const template = await prisma.characterSheetTemplate.findFirst({
      where: {
        id: dto.templateId,
        campaignId: character.campaignId,
      },
      select: {
        id: true,
        definition: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template de ficha não encontrado.');
    }

    validateSheetData(
      template.definition as unknown as SheetDefinition,
      dto.data,
    );

    // 3. Verifica se o personagem já possui ficha.
    const existingSheet = await prisma.characterSheet.findUnique({
      where: {
        characterId,
      },
      select: {
        id: true,
      },
    });

    if (existingSheet) {
      throw new BadRequestException('Este personagem já possui uma ficha.');
    }

    // 4. Cria a ficha.
    return prisma.characterSheet.create({
      data: {
        characterId,
        templateId: dto.templateId,
        data: dto.data,
      },
      select: {
        id: true,
        data: true,
        characterId: true,
        templateId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findSheet(characterId: string, userId: string) {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
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

    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    const sheet = await prisma.characterSheet.findUnique({
      where: {
        characterId,
      },
      select: {
        id: true,
        data: true,
        characterId: true,
        templateId: true,
        createdAt: true,
        updatedAt: true,
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            definition: true,
          },
        },
      },
    });

    if (!sheet) {
      throw new NotFoundException('Ficha do personagem não encontrada.');
    }

    return sheet;
  }

  async updateSheet(
    characterId: string,
    userId: string,
    dto: UpdateCharacterSheetDto,
  ) {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
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

    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    const sheet = await prisma.characterSheet.findUnique({
      where: {
        characterId,
      },
      select: {
        id: true,
        data: true,
        template: {
          select: {
            definition: true,
          },
        },
      },
    });

    if (!sheet) {
      throw new NotFoundException('Ficha do personagem não encontrada.');
    }

    const currentData = sheet.data as Record<string, any>;

    const updatedData = {
      ...currentData,
      ...dto.data,
    };

    validateSheetData(
      sheet.template.definition as unknown as SheetDefinition,
      updatedData,
    );

    return prisma.characterSheet.update({
      where: {
        characterId,
      },
      data: {
        data: updatedData,
      },
      select: {
        id: true,
        data: true,
        characterId: true,
        templateId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async removeSheet(characterId: string, userId: string) {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
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

    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    const sheet = await prisma.characterSheet.findUnique({
      where: {
        characterId,
      },
      select: {
        id: true,
      },
    });

    if (!sheet) {
      throw new NotFoundException('Ficha do personagem não encontrada.');
    }

    await prisma.characterSheet.delete({
      where: {
        characterId,
      },
    });

    return {
      message: 'Ficha do personagem removida com sucesso.',
    };
  }
}
