import { useState } from 'react';
import { Template } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  FolderOpen, 
  FileText, 
  FileType, 
  Settings,
  Menu
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface AppHeaderProps {
  template: Template;
  onTitleChange: (title: string) => void;
  onSaveTemplate: () => void;
  onLoadTemplate: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

const AppHeader = ({
  template,
  onTitleChange,
  onSaveTemplate,
  onLoadTemplate,
  onExportPDF,
  onExportDOCX
}: AppHeaderProps) => {
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);

  const handleLoadClick = () => {
    // In a real implementation, we would load templates from localStorage or API
    // For now, we'll just show a dialog explaining this is not implemented
    setSavedTemplates([]);
    setIsLoadDialogOpen(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white mr-3">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <Input
            type="text"
            value={template.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-semibold border-0 focus:ring-2 focus:ring-primary px-2 py-1 rounded"
            placeholder="Document Title"
          />
        </div>
      </div>
      
      {/* Desktop buttons */}
      <div className="hidden md:flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveTemplate}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadClick}
          className="flex items-center"
        >
          <FolderOpen className="h-4 w-4 mr-1.5" /> Load
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPDF}
          className="flex items-center"
        >
          <FileText className="h-4 w-4 mr-1.5" /> Export PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportDOCX}
          className="flex items-center"
        >
          <FileType className="h-4 w-4 mr-1.5" /> Export DOCX
        </Button>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSaveTemplate}>
              <Save className="h-4 w-4 mr-2" /> Save Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLoadClick}>
              <FolderOpen className="h-4 w-4 mr-2" /> Load Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText className="h-4 w-4 mr-2" /> Export to PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDOCX}>
              <FileType className="h-4 w-4 mr-2" /> Export to DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Load Template Dialog */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Select a template to load from your saved templates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {savedTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Templates are saved in your browser's local storage.</p>
                <p className="mt-2">You haven't saved any templates yet.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {savedTemplates.map(template => (
                  <div key={template.id} className="p-3 border rounded flex justify-between items-center">
                    <span>{template.title}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        onLoadTemplate();
                        setIsLoadDialogOpen(false);
                      }}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsLoadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default AppHeader;
