export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'rich-text';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ContentField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[]; // For select fields
  placeholder?: string;
}

export interface ContentTypeField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  order: number;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  fields: ContentTypeField[];
  parentId?: string;
  children?: ContentType[];
  order?: number;
}

export interface ContentItem {
  id: string;
  contentTypeId: string;
  values: Record<string, any>;
  createdAt: string;
  updatedAt: string;
} 