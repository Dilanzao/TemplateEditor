import { useRef, useEffect } from 'react';
import { Template, Variable, PAGE_SIZES } from '@/types/template';
import { getCanvasSize } from '@/lib/exportUtils';
import FormattingToolbar from './FormattingToolbar';

interface MainEditorProps {
  template: Template;
  selectedVariableId: string | null;
  isEditing: boolean;
  onSelectVariable: (id: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onVariableUpdate: (variable: Variable) => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
}

const MainEditor = ({
  template,
  selectedVariableId,
  isEditing,
  onSelectVariable,
  onCanvasClick,
  onVariableUpdate,
  onSaveEditing,
  onCancelEditing
}: MainEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const selectedVariable = template.variables.find(v => v.id === selectedVariableId) || null;
  const canvasSize = getCanvasSize(template.pageSize);
  const pageSize = PAGE_SIZES[template.pageSize] || PAGE_SIZES.a4;
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks directly on the canvas, not on variables
    if (e.target === canvasRef.current && !isEditing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCanvasClick(x, y);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
      {/* Formatting Toolbar (visible only when editing) */}
      {isEditing && selectedVariable && (
        <FormattingToolbar
          selectedVariable={selectedVariable}
          onVariableUpdate={onVariableUpdate}
          onSave={onSaveEditing}
          onCancel={onCancelEditing}
        />
      )}

      {/* Editor Canvas */}
      <div className="flex-1 flex justify-center items-start overflow-auto p-8 bg-gray-300">
        <div
          ref={canvasRef}
          className="editor-canvas relative bg-white shadow-lg mx-auto"
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
          onClick={handleCanvasClick}
        >
          {/* Variable elements positioned absolutely */}
          {template.variables.map((variable) => (
            <div
              key={variable.id}
              className={`variable-element ${
                selectedVariableId === variable.id ? 'selected' : ''
              }`}
              style={{
                left: `${variable.x}px`,
                top: `${variable.y}px`,
                fontFamily: variable.format.fontFamily,
                fontSize: `${variable.format.fontSize}px`,
                fontWeight: variable.format.fontWeight || 'normal',
                fontStyle: variable.format.fontStyle || 'normal',
                textDecoration: variable.format.textDecoration || 'none',
                textAlign: variable.format.textAlign || 'left',
                color: variable.format.color,
                position: 'absolute',
                cursor: 'pointer',
                minWidth: '30px',
                minHeight: '20px',
                outline: selectedVariableId === variable.id ? '2px solid #3b82f6' : 'none',
                zIndex: selectedVariableId === variable.id ? 10 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectVariable(variable.id);
              }}
            >
              {variable.value}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-1.5 text-sm text-gray-600 flex justify-between items-center">
        <span>
          Canvas Size: {pageSize.name.toUpperCase()} ({pageSize.width}{pageSize.unit} × {pageSize.height}{pageSize.unit})
        </span>
        <span>{template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}</span>
      </div>
    </main>
  );
};

export default MainEditor;
