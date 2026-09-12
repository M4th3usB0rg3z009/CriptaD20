export type SheetFieldType =
  | 'number'
  | 'text'
  | 'textarea'
  | 'boolean';

export interface SheetFieldDefinition {
  key: string;
  label: string;
  type: SheetFieldType;
}

export interface SheetSectionDefinition {
  title: string;
  fields: SheetFieldDefinition[];
}

export interface SheetDefinition {
  sections: SheetSectionDefinition[];
}