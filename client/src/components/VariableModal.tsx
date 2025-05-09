import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Variable } from '@/types/template';
import { createNewVariable } from '@/lib/storageUtils';

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variable: Variable) => void;
  editingVariable: Variable | null;
  initialPosition: { x: number; y: number };
}

const VariableModal = ({
  isOpen,
  onClose,
  onSave,
  editingVariable,
  initialPosition,
}: VariableModalProps) => {
  const [variable, setVariable] = useState<Variable>(
    createNewVariable(initialPosition.x, initialPosition.y)
  );

  useEffect(() => {
    if (editingVariable) {
      setVariable(JSON.parse(JSON.stringify(editingVariable)));
    } else {
      setVariable(createNewVariable(initialPosition.x, initialPosition.y));
    }
  }, [editingVariable, initialPosition, isOpen]);

  const handleChange = (field: keyof Variable, value: string | number) => {
    setVariable(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate fields
    if (!variable.title.trim() || !variable.value.trim()) {
      alert('Title and Value are required');
      return;
    }

    onSave(variable);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingVariable ? 'Edit Variable' : 'Add New Variable'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variable-title">Variable Title</Label>
            <Input
              id="variable-title"
              value={variable.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Customer Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variable-value">Variable Value</Label>
            <Input
              id="variable-value" 
              value={variable.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="variable-x">X Position</Label>
              <Input
                id="variable-x"
                type="number"
                value={variable.x}
                onChange={(e) => handleChange('x', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variable-y">Y Position</Label>
              <Input
                id="variable-y"
                type="number"
                value={variable.y}
                onChange={(e) => handleChange('y', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Save Variable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariableModal;
