import { BadRequestException } from '@nestjs/common';
import type {
  SheetDefinition,
  SheetFieldType,
} from '../types/sheet-definition';

const VALID_FIELD_TYPES: SheetFieldType[] = [
  'number',
  'text',
  'textarea',
  'boolean',
];

export function validateSheetDefinition(
  definition: SheetDefinition,
) {
  if (!Array.isArray(definition.sections)) {
    throw new BadRequestException(
      'O template precisa possuir uma lista de seções.',
    );
  }

  const usedKeys = new Set<string>();

  for (const section of definition.sections) {
    if (
      typeof section.title !== 'string' ||
      !section.title.trim()
    ) {
      throw new BadRequestException(
        'Toda seção precisa possuir um título válido.',
      );
    }

    if (!Array.isArray(section.fields)) {
      throw new BadRequestException(
        `A seção "${section.title}" precisa possuir uma lista de campos.`,
      );
    }

    for (const field of section.fields) {
      if (
        typeof field.key !== 'string' ||
        !field.key.trim()
      ) {
        throw new BadRequestException(
          `Existe um campo sem key válida na seção "${section.title}".`,
        );
      }

      if (usedKeys.has(field.key)) {
        throw new BadRequestException(
          `O campo "${field.key}" está duplicado no template.`,
        );
      }

      usedKeys.add(field.key);

      if (
        typeof field.label !== 'string' ||
        !field.label.trim()
      ) {
        throw new BadRequestException(
          `O campo "${field.key}" precisa possuir um label válido.`,
        );
      }

      if (!VALID_FIELD_TYPES.includes(field.type)) {
        throw new BadRequestException(
          `O campo "${field.label}" possui um tipo inválido.`,
        );
      }
    }
  }
}