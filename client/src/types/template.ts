// Type definitions for the template editor

export interface VariableFormat {
  fontFamily: string;
  fontSize: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  color: string;
}

export interface Variable {
  id: string;
  title: string;
  value: string;
  x: number;
  y: number;
  format: VariableFormat;
}

export interface Template {
  id: string;
  title: string;
  pageSize: string;
  backgroundImage?: string;
  showBackgroundInOutput: boolean;
  variables: Variable[];
}

export interface PageSize {
  name: string;
  label: string;
  width: number;
  height: number;
  unit: string;
}

export const PAGE_SIZES: Record<string, PageSize> = {
  a4: {
    name: 'a4',
    label: 'A4 (210 × 297 mm)',
    width: 210,
    height: 297,
    unit: 'mm'
  },
  letter: {
    name: 'letter',
    label: 'Letter (8.5 × 11 in)',
    width: 8.5,
    height: 11,
    unit: 'in'
  },
  legal: {
    name: 'legal',
    label: 'Legal (8.5 × 14 in)',
    width: 8.5,
    height: 14,
    unit: 'in'
  }
};

export const DEFAULT_VARIABLE_FORMAT: VariableFormat = {
  fontFamily: 'Arial',
  fontSize: 12,
  color: '#000000'
};
