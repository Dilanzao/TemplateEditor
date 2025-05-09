import { Variable, Template, PAGE_SIZES } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash, Plus, Image, FileUp } from 'lucide-react';

interface SidebarProps {
  template: Template;
  selectedVariableId: string | null;
  onSelectVariable: (id: string) => void;
  onAddVariable: () => void;
  onEditVariable: (variable: Variable) => void;
  onDeleteVariable: (id: string) => void;
  onClearVariables: () => void;
  onBackgroundToggle: (show: boolean) => void;
  onPageSizeChange: (size: string) => void;
  onUploadBackground: () => void;
}

const Sidebar = ({
  template,
  selectedVariableId,
  onSelectVariable,
  onAddVariable,
  onEditVariable,
  onDeleteVariable,
  onClearVariables,
  onBackgroundToggle,
  onPageSizeChange,
  onUploadBackground
}: SidebarProps) => {
  const { variables, showBackgroundInOutput, pageSize } = template;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-medium text-gray-700">Variables</h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddVariable}
            title="Add Variable"
            className="text-gray-500 hover:text-primary hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearVariables}
            title="Clear All Variables"
            className="text-gray-500 hover:text-destructive hover:bg-red-50"
            disabled={variables.length === 0}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {variables.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No variables yet. Click the + button to add one.
          </div>
        ) : (
          variables.map((variable) => (
            <div
              key={variable.id}
              className={`p-3 mb-2 rounded border transition-colors ${
                selectedVariableId === variable.id
                  ? 'bg-blue-50 border-primary'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectVariable(variable.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm text-gray-700">{variable.title}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVariable(variable);
                    }}
                    title="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVariable(variable.id);
                    }}
                    title="Delete"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div 
                className="text-sm border-l-2 border-primary pl-2 mb-2"
                style={{
                  fontFamily: variable.format.fontFamily,
                  fontSize: `${variable.format.fontSize}px`,
                  fontWeight: variable.format.fontWeight || 'normal',
                  fontStyle: variable.format.fontStyle || 'normal',
                  textDecoration: variable.format.textDecoration || 'none',
                  textAlign: variable.format.textAlign || 'left',
                  color: variable.format.color
                }}
              >
                {variable.value}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>X: {variable.x}</span>
                <span>Y: {variable.y}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Background Image</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Show in output</span>
            <Switch
              checked={showBackgroundInOutput}
              onCheckedChange={onBackgroundToggle}
            />
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full flex items-center"
          onClick={onUploadBackground}
        >
          <Image className="mr-2 h-4 w-4" /> Upload Background
        </Button>
      </div>

      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Page Size</Label>
        <Select 
          defaultValue={pageSize} 
          value={pageSize}
          onValueChange={onPageSizeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAGE_SIZES).map(([key, size]) => (
              <SelectItem key={key} value={key}>{size.label}</SelectItem>
            ))}
            <SelectItem value="custom">Custom Size</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
};

export default Sidebar;
