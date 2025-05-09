import { useState, useRef, useCallback } from 'react';
import { Template, Variable, DEFAULT_VARIABLE_FORMAT } from '@/types/template';
import AppHeader from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import MainEditor from '@/components/MainEditor';
import VariableModal from '@/components/VariableModal';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { createNewTemplate, saveTemplateToLocal, getTemplatesFromLocal, serializeTemplate } from '@/lib/storageUtils';
import { exportToPDF, exportToDOCX } from '@/lib/exportUtils';
import { importFileContent } from '@/lib/importUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { saveAs } from 'file-saver';

const TemplateEditor = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template>(createNewTemplate());
  const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [initialPosition, setInitialPosition] = useState({ x: 100, y: 100 });
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Variable handling functions
  const handleSelectVariable = (id: string) => {
    setSelectedVariableId(id);
    setIsEditing(true);
  };

  const handleUpdateVariable = (updatedVariable: Variable) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.map(v => 
        v.id === updatedVariable.id ? updatedVariable : v
      )
    }));
  };

  const handleSaveEditing = () => {
    setIsEditing(false);
    toast({
      title: "Variable updated",
      description: "Your changes have been saved.",
    });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSelectedVariableId(null);
  };

  const handleAddVariable = () => {
    setEditingVariable(null);
    setInitialPosition({ x: 100, y: 100 });
    setIsModalOpen(true);
  };

  const handleCanvasClick = (x: number, y: number) => {
    setEditingVariable(null);
    setInitialPosition({ x, y });
    setIsModalOpen(true);
  };

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable(variable);
    setIsModalOpen(true);
  };

  const handleDeleteVariable = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.id !== id)
    }));
    
    if (selectedVariableId === id) {
      setSelectedVariableId(null);
      setIsEditing(false);
    }
    
    toast({
      title: "Variable deleted",
      description: "The variable has been removed from the template.",
    });
  };

  const handleClearVariables = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearVariables = () => {
    setTemplate(prev => ({
      ...prev,
      variables: []
    }));
    setSelectedVariableId(null);
    setIsEditing(false);
    setIsClearConfirmOpen(false);
    
    toast({
      title: "Variables cleared",
      description: "All variables have been removed from the template.",
    });
  };

  const handleSaveVariable = (variable: Variable) => {
    if (editingVariable) {
      // Update existing variable
      setTemplate(prev => ({
        ...prev,
        variables: prev.variables.map(v => 
          v.id === variable.id ? variable : v
        )
      }));
      
      toast({
        title: "Variable updated",
        description: `"${variable.title}" has been updated.`,
      });
    } else {
      // Add new variable
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, { ...variable, id: uuidv4(), format: { ...DEFAULT_VARIABLE_FORMAT, ...variable.format } }]
      }));
      
      toast({
        title: "Variable added",
        description: `"${variable.title}" has been added to the template.`,
      });
    }
  };

  // Template handling functions
  const handleTitleChange = (title: string) => {
    setTemplate(prev => ({ ...prev, title }));
  };

  const handleBackgroundToggle = (show: boolean) => {
    setTemplate(prev => ({ ...prev, showBackgroundInOutput: show }));
  };

  const handlePageSizeChange = (pageSize: string) => {
    setTemplate(prev => ({ ...prev, pageSize }));
  };

  const handleUploadBackground = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUploadWordDocument = () => {
    if (wordInputRef.current) {
      wordInputRef.current.click();
    }
  };

  const handleUploadPdfDocument = () => {
    if (pdfInputRef.current) {
      pdfInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const backgroundImage = event.target?.result as string;
      setTemplate(prev => ({ ...prev, backgroundImage }));
      
      toast({
        title: "Background uploaded",
        description: "Background image has been added to the template.",
      });
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleWordFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importFileContent(file);
      
      if (result.type === 'text') {
        // Create a variable with the imported text
        const newVariable = {
          id: uuidv4(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          value: result.content,
          x: 50,
          y: 50,
          format: { ...DEFAULT_VARIABLE_FORMAT }
        };
        
        setTemplate(prev => ({
          ...prev,
          variables: [...prev.variables, newVariable]
        }));
        
        toast({
          title: "Word document imported",
          description: "Content has been imported as a new variable.",
        });
      } else if (result.type === 'image') {
        setTemplate(prev => ({ ...prev, backgroundImage: result.content }));
        
        toast({
          title: "Word document imported",
          description: "Document has been imported as a background image.",
        });
      }
    } catch (error) {
      console.error("Word import error:", error);
      toast({
        title: "Import failed",
        description: "Failed to import Word document. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the input
    if (wordInputRef.current) {
      wordInputRef.current.value = '';
    }
  };
  
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importFileContent(file);
      
      if (result.type === 'image') {
        setTemplate(prev => ({ ...prev, backgroundImage: result.content }));
        
        toast({
          title: "PDF imported",
          description: "The first page of the PDF has been imported as a background image.",
        });
      }
    } catch (error) {
      console.error("PDF import error:", error);
      toast({
        title: "Import failed",
        description: "Failed to import PDF. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the input
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  // Save and load functions
  const handleSaveTemplate = () => {
    saveTemplateToLocal(template);
    toast({
      title: "Template saved",
      description: "Your template has been saved to local storage.",
    });
  };

  const handleLoadTemplate = () => {
    const templates = getTemplatesFromLocal();
    if (templates.length > 0) {
      // For now, just load the most recent template
      setTemplate(templates[templates.length - 1]);
      toast({
        title: "Template loaded",
        description: "Your template has been loaded from local storage.",
      });
    } else {
      toast({
        title: "No templates found",
        description: "There are no saved templates in local storage.",
        variant: "destructive",
      });
    }
  };

  // Export functions
  const handleExportPDF = async () => {
    try {
      await exportToPDF(template);
      toast({
        title: "PDF exported",
        description: "Your template has been exported as a PDF file.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX(template);
      toast({
        title: "DOCX exported",
        description: "Your template has been exported as a DOCX file.",
      });
    } catch (error) {
      console.error("DOCX export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export DOCX. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportJSON = () => {
    try {
      const jsonContent = serializeTemplate(template);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `${template.title || 'template'}.json`);
      
      toast({
        title: "JSON exported",
        description: "Your template has been exported as a JSON file.",
      });
    } catch (error) {
      console.error("JSON export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export JSON. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 text-gray-800">
      {/* App Header */}
      <AppHeader
        template={template}
        onTitleChange={handleTitleChange}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          template={template}
          selectedVariableId={selectedVariableId}
          onSelectVariable={handleSelectVariable}
          onAddVariable={handleAddVariable}
          onEditVariable={handleEditVariable}
          onDeleteVariable={handleDeleteVariable}
          onClearVariables={handleClearVariables}
          onBackgroundToggle={handleBackgroundToggle}
          onPageSizeChange={handlePageSizeChange}
          onUploadBackground={handleUploadBackground}
          onUploadWordDocument={handleUploadWordDocument}
          onUploadPdfDocument={handleUploadPdfDocument}
          onExportJSON={handleExportJSON}
        />

        {/* Main Editor */}
        <MainEditor
          template={template}
          selectedVariableId={selectedVariableId}
          isEditing={isEditing}
          onSelectVariable={handleSelectVariable}
          onCanvasClick={handleCanvasClick}
          onVariableUpdate={handleUpdateVariable}
          onSaveEditing={handleSaveEditing}
          onCancelEditing={handleCancelEditing}
        />
      </div>

      {/* Variable Modal */}
      <VariableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVariable}
        editingVariable={editingVariable}
        initialPosition={initialPosition}
      />

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
      
      <input
        type="file"
        ref={wordInputRef}
        style={{ display: 'none' }}
        onChange={handleWordFileChange}
        accept=".docx,.doc"
      />
      
      <input
        type="file"
        ref={pdfInputRef}
        style={{ display: 'none' }}
        onChange={handlePdfFileChange}
        accept=".pdf"
      />

      {/* Clear Variables Confirmation */}
      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all variables?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all variables from your template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearVariables}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateEditor;
