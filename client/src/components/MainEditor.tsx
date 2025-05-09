import { useRef, useState, useEffect } from 'react';
import { Template, Variable, PAGE_SIZES } from '@/types/template';
import { getCanvasSize } from '@/lib/exportUtils';
import FormattingToolbar from './FormattingToolbar';
import Draggable from 'react-draggable';
import GridAndGuides from './GridAndGuides';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [enableSnap, setEnableSnap] = useState<boolean>(true);
  
  const selectedVariable = template.variables.find(v => v.id === selectedVariableId) || null;
  const canvasSize = getCanvasSize(template.pageSize);
  const pageSize = PAGE_SIZES[template.pageSize] || PAGE_SIZES.a4;
  const gridSize = 25; // Size of grid cells in pixels for snapping
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks directly on the canvas, not on variables
    if (e.target === canvasRef.current && !isEditing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCanvasClick(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  const handleCanvasMouseLeave = () => {
    setMousePosition(null);
  };

  const handleDragStop = (id: string, e: any, data: { x: number, y: number }) => {
    // Update the variable position when drag ends
    const variable = template.variables.find(v => v.id === id);
    if (variable) {
      const newVar = { ...variable };
      
      // Apply snapping if enabled
      if (enableSnap) {
        newVar.x = Math.round(data.x / gridSize) * gridSize;
        newVar.y = Math.round(data.y / gridSize) * gridSize;
      } else {
        newVar.x = data.x;
        newVar.y = data.y;
      }
      
      onVariableUpdate(newVar);
    }
  };

  // Reset drag positions after a variable is updated to prevent accumulating position offsets
  const variablesWithResetPosition = template.variables.map(variable => ({
    ...variable,
    _resetPosition: { x: variable.x, y: variable.y },
    _key: `${variable.id}-${variable.x}-${variable.y}` // Key to force remount after position update
  }));

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

      {/* Grid and Snap Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
          <Label htmlFor="show-grid">Show Grid</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="enable-snap"
            checked={enableSnap}
            onCheckedChange={setEnableSnap}
          />
          <Label htmlFor="enable-snap">Snap to Grid</Label>
        </div>
        {mousePosition && (
          <div className="ml-auto text-sm text-gray-500">
            X: {Math.round(mousePosition.x)}, Y: {Math.round(mousePosition.y)}
          </div>
        )}
      </div>

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
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
        >
          {/* Grid and Guidelines */}
          {showGrid && (
            <GridAndGuides
              width={canvasSize.width}
              height={canvasSize.height}
              showGrid={showGrid}
              mousePosition={mousePosition}
            />
          )}

          {/* Variable elements with Draggable wrapper */}
          {variablesWithResetPosition.map((variable) => (
            <Draggable
              key={variable._key}
              position={{ x: variable.x, y: variable.y }}
              onStop={(e, data) => handleDragStop(variable.id, e, data)}
              disabled={isEditing || selectedVariableId !== variable.id}
              grid={enableSnap ? [gridSize, gridSize] : undefined}
              bounds="parent"
            >
              <div
                className={`variable-element ${
                  selectedVariableId === variable.id ? 'selected' : ''
                }`}
                style={{
                  fontFamily: variable.format.fontFamily,
                  fontSize: `${variable.format.fontSize}px`,
                  fontWeight: variable.format.fontWeight || 'normal',
                  fontStyle: variable.format.fontStyle || 'normal',
                  textDecoration: variable.format.textDecoration || 'none',
                  textAlign: (variable.format.textAlign || 'left') as any,
                  color: variable.format.color,
                  position: 'absolute',
                  cursor: selectedVariableId === variable.id && !isEditing ? 'move' : 'pointer',
                  padding: '4px',
                  minWidth: '30px',
                  minHeight: '20px',
                  outline: selectedVariableId === variable.id ? '2px solid #3b82f6' : 'none',
                  backgroundColor: selectedVariableId === variable.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  zIndex: selectedVariableId === variable.id ? 10 : 1,
                  borderRadius: '2px',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVariable(variable.id);
                }}
              >
                {variable.value}
              </div>
            </Draggable>
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
