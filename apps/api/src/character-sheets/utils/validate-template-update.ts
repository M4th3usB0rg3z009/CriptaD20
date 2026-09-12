import { BadRequestException } from '@nestjs/common';
import type { SheetDefinition } from '../types/sheet-definition';

export function validateTemplateUpdate(
  currentDefinition: SheetDefinition,
  newDefinition: SheetDefinition,
) {
  const currentFields = currentDefinition.sections.flatMap(
    (section) => section.fields,
  );

  const newFields = newDefinition.sections.flatMap(
    (section) => section.fields,
  );

  for (const currentField of currentFields) {
    const newField = newFields.find(
      (field) => field.key === currentField.key,
    );

    // Não permite remover um campo existente.
    if (!newField) {
      throw new BadRequestException(
        `O campo "${currentField.label}" não pode ser removido enquanto o template estiver em uso.`,
      );
    }

    // Não permite alterar o tipo de um campo existente.
    if (newField.type !== currentField.type) {
      throw new BadRequestException(
        `O tipo do campo "${currentField.label}" não pode ser alterado enquanto o template estiver em uso.`,
      );
    }
  }
}