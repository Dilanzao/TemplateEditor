import { Template, Variable } from '../types/template';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'template-editor-templates';
const CURRENT_TEMPLATE_KEY = 'template-editor-current-template';

export const DEFAULT_VARIABLE_FORMAT = {
  fontFamily: 'Arial',
  fontSize: 12,
  color: '#000000'
};

// Create a new template with default values
export const createNewTemplate = (): Template => {
  return {
    id: uuidv4(),
    title: 'Untitled Document',
    pageSize: 'a4',
    showBackgroundInOutput: true,
    variables: []
  };
};

// Create a new variable with default values
export const createNewVariable = (x: number, y: number): Variable => {
  return {
    id: uuidv4(),
    title: '',
    value: '',
    x,
    y,
    format: {
      fontFamily: 'Arial',
      fontSize: 12,
      color: '#000000'
    }
  };
};

// Local template storage functions
export const saveTemplateToLocal = (template: Template): void => {
  try {
    // Get existing templates
    const templatesJSON = localStorage.getItem(STORAGE_KEY);
    const templates = templatesJSON ? JSON.parse(templatesJSON) : [];
    
    // Check if template already exists
    const existingIndex = templates.findIndex((t: Template) => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing template
      templates[existingIndex] = template;
    } else {
      // Add new template
      templates.push(template);
    }
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    
    // Also save as current template
    localStorage.setItem(CURRENT_TEMPLATE_KEY, JSON.stringify(template));
  } catch (error) {
    console.error('Error saving template to localStorage:', error);
    throw new Error('Failed to save template');
  }
};

export const getTemplatesFromLocal = (): Template[] => {
  try {
    const templatesJSON = localStorage.getItem(STORAGE_KEY);
    return templatesJSON ? JSON.parse(templatesJSON) : [];
  } catch (error) {
    console.error('Error getting templates from localStorage:', error);
    return [];
  }
};

export const getCurrentTemplateFromLocal = (): Template | null => {
  try {
    const templateJSON = localStorage.getItem(CURRENT_TEMPLATE_KEY);
    return templateJSON ? JSON.parse(templateJSON) : null;
  } catch (error) {
    console.error('Error getting current template from localStorage:', error);
    return null;
  }
};

export const getTemplateFromLocal = (id: string): Template | undefined => {
  try {
    const templates = getTemplatesFromLocal();
    return templates.find(t => t.id === id);
  } catch (error) {
    console.error('Error getting template from localStorage:', error);
    return undefined;
  }
};

export const deleteTemplateFromLocal = (id: string): boolean => {
  try {
    const templates = getTemplatesFromLocal();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (templates.length === filteredTemplates.length) {
      return false; // No template was removed
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
    return true;
  } catch (error) {
    console.error('Error deleting template from localStorage:', error);
    return false;
  }
};

// Serialize template state for storage or export
export const serializeTemplate = (template: Template): string => {
  return JSON.stringify(template, null, 2); // Pretty print with 2 spaces
};

// Deserialize template data from storage or import
export const deserializeTemplate = (data: string): Template => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error deserializing template:', error);
    return createNewTemplate();
  }
};

// Load a template from JSON file
export const loadTemplateFromFile = (file: File): Promise<Template> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const template = deserializeTemplate(jsonStr);
        resolve(template);
      } catch (error) {
        reject(new Error('Failed to parse template file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read template file'));
    };
    
    reader.readAsText(file);
  });
};