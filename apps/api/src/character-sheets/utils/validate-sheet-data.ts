import { BadRequestException } from '@nestjs/common';
import type { SheetDefinition } from '../types/sheet-definition';

export function validateSheetData(
  definition: SheetDefinition,
  data: Record<string, any>,
) {
  const fields = definition.sections.flatMap((section) => section.fields);

  for (const [key, value] of Object.entries(data)) {
    const field = fields.find((field) => field.key === key);

    if (!field) {
      throw new BadRequestException(
        `Campo "${key}" não existe neste template.`,
      );
    }

    switch (field.type) {
      case 'number':
        if (typeof value !== 'number' || Number.isNaN(value)) {
          throw new BadRequestException(
            `O campo "${field.label}" deve ser um número.`,
          );
        }
        break;

      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          throw new BadRequestException(
            `O campo "${field.label}" deve ser um texto.`,
          );
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new BadRequestException(
            `O campo "${field.label}" deve ser verdadeiro ou falso.`,
          );
        }
        break;
    }
  }
}