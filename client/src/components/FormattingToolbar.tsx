import { useState, useEffect } from 'react';
import { Variable } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  X
} from 'lucide-react';

interface FormattingToolbarProps {
  selectedVariable: Variable | null;
  onVariableUpdate: (variable: Variable) => void;
  onSave: () => void;
  onCancel: () => void;
}

const FormattingToolbar = ({
  selectedVariable,
  onVariableUpdate,
  onSave,
  onCancel
}: FormattingToolbarProps) => {
  // We need to clone the variable to avoid direct state mutation
  const [variable, setVariable] = useState<Variable | null>(null);

  useEffect(() => {
    if (selectedVariable) {
      setVariable(JSON.parse(JSON.stringify(selectedVariable)));
    } else {
      setVariable(null);
    }
  }, [selectedVariable]);

  if (!variable) return null;

  const updateFormat = (property: string, value: any) => {
    setVariable(prev => {
      if (!prev) return null;
      
      const newVar = { ...prev };
      newVar.format = { ...newVar.format, [property]: value };
      
      // Pass the update to parent component
      onVariableUpdate(newVar);
      
      return newVar;
    });
  };

  const updatePosition = (property: 'x' | 'y', value: number) => {
    setVariable(prev => {
      if (!prev) return null;
      
      const newVar = { ...prev };
      newVar[property] = value;
      
      // Pass the update to parent component
      onVariableUpdate(newVar);
      
      return newVar;
    });
  };

  const toggleFormat = (property: string, value1: string, value2: string = '') => {
    setVariable(prev => {
      if (!prev) return null;
      
      const newVar = { ...prev };
      const currentValue = newVar.format[property as keyof typeof newVar.format];
      newVar.format = { 
        ...newVar.format, 
        [property]: currentValue === value1 ? value2 : value1 
      };
      
      // Pass the update to parent component
      onVariableUpdate(newVar);
      
      return newVar;
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-2 flex items-center space-x-1 overflow-x-auto">
      <div className="flex items-center space-x-1 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFormat('fontWeight', 'bold', 'normal')}
          className={variable.format.fontWeight === 'bold' ? 'bg-gray-100' : ''}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFormat('fontStyle', 'italic', 'normal')}
          className={variable.format.fontStyle === 'italic' ? 'bg-gray-100' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFormat('textDecoration', 'underline', 'none')}
          className={variable.format.textDecoration === 'underline' ? 'bg-gray-100' : ''}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Select
        value={variable.format.fontFamily}
        onValueChange={(value) => updateFormat('fontFamily', value)}
      >
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue placeholder="Font Family" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Helvetica">Helvetica</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={variable.format.fontSize.toString()}
        onValueChange={(value) => updateFormat('fontSize', parseInt(value))}
      >
        <SelectTrigger className="w-[70px] h-8">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32].map(size => (
            <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateFormat('textAlign', 'left')}
          className={variable.format.textAlign === 'left' ? 'bg-gray-100' : ''}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateFormat('textAlign', 'center')}
          className={variable.format.textAlign === 'center' ? 'bg-gray-100' : ''}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateFormat('textAlign', 'right')}
          className={variable.format.textAlign === 'right' ? 'bg-gray-100' : ''}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Input
        type="color"
        value={variable.format.color}
        onChange={(e) => updateFormat('color', e.target.value)}
        className="w-8 h-8 p-0 border-0 rounded"
        title="Text Color"
      />

      <Separator orientation="vertical" className="h-6" />

      <div className="flex-1 flex items-center ml-3">
        <div className="flex items-center mr-4">
          <label className="block text-sm font-medium text-gray-700 mr-2">X:</label>
          <Input
            type="number"
            className="w-[70px] h-8"
            value={variable.x}
            onChange={(e) => updatePosition('x', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-2">Y:</label>
          <Input
            type="number"
            className="w-[70px] h-8"
            value={variable.y}
            onChange={(e) => updatePosition('y', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center ml-auto">
        <Button
          variant="default"
          className="mr-2"
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
};

export default FormattingToolbar;
