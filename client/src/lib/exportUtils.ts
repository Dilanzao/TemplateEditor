import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Template, Variable, PAGE_SIZES } from '../types/template';

// Function to determine the canvas size based on the page size
export function getCanvasSize(pageSize: string): { width: number, height: number } {
  // Scale factor for rendering size
  const SCALE_FACTOR = 2.83; // This gives us roughly 794px width for A4
  
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  
  if (size.unit === 'mm') {
    return {
      width: size.width * SCALE_FACTOR,
      height: size.height * SCALE_FACTOR
    };
  } else if (size.unit === 'in') {
    return {
      width: size.width * 72 * SCALE_FACTOR / 25.4,
      height: size.height * 72 * SCALE_FACTOR / 25.4
    };
  }
  
  // Default to A4 if unknown
  return {
    width: 794,
    height: 1123
  };
}

// Function to export the template to PDF
export async function exportToPDF(template: Template): Promise<void> {
  const { width, height } = getCanvasSize(template.pageSize);
  
  // Initialize PDF with proper page size
  const orientation = width > height ? 'landscape' : 'portrait';
  const size = PAGE_SIZES[template.pageSize] || PAGE_SIZES.a4;
  
  // Create PDF with proper dimensions - normalize unit and orientation to acceptable values
  const pdfUnit = (size.unit === 'mm' || size.unit === 'in' || size.unit === 'pt' || 
               size.unit === 'px' || size.unit === 'cm' || size.unit === 'ex' || 
               size.unit === 'em' || size.unit === 'pc') ? size.unit : 'mm';
               
  const pdfOrientation = (orientation === 'landscape' || orientation === 'portrait') ? 
                      orientation as 'landscape' | 'portrait' : 'portrait';
  
  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: pdfUnit,
    format: [size.width, size.height]
  });
  
  // Add background image if required
  if (template.backgroundImage && template.showBackgroundInOutput) {
    try {
      const img = new Image();
      img.src = template.backgroundImage;
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Add image as background
            pdf.addImage(
              img, 
              'JPEG', 
              0, 
              0, 
              size.width, 
              size.height
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = (err) => reject(err);
      });
    } catch (error) {
      console.error('Error adding background image to PDF:', error);
    }
  }
  
  // Add variables
  template.variables.forEach(variable => {
    // Calculate position based on page size
    const xRatio = variable.x / width;
    const yRatio = variable.y / height;
    
    const xPos = xRatio * size.width;
    const yPos = yRatio * size.height;
    
    // Set text properties
    pdf.setFont(variable.format.fontFamily || 'helvetica');
    pdf.setFontSize(variable.format.fontSize || 12);
    pdf.setTextColor(variable.format.color || '#000000');
    
    // Handle text styles
    if (variable.format.fontWeight === 'bold') {
      pdf.setFont(variable.format.fontFamily || 'helvetica', 'bold');
    }
    if (variable.format.fontStyle === 'italic') {
      pdf.setFont(variable.format.fontFamily || 'helvetica', 'italic');
    }
    
    // Add text
    pdf.text(variable.value, xPos, yPos);
  });
  
  // Save the PDF
  pdf.save(`${template.title || 'document'}.pdf`);
}

// Function to export the template to DOCX
export async function exportToDOCX(template: Template): Promise<void> {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: template.variables.map(variable => {
          // Create paragraph with proper alignment
          const paragraph = new Paragraph({
            alignment: convertTextAlign(variable.format.textAlign),
            children: [
              new TextRun({
                text: variable.value,
                font: variable.format.fontFamily,
                size: variable.format.fontSize * 2, // DOCX uses half-points
                color: variable.format.color?.replace('#', ''),
                bold: variable.format.fontWeight === 'bold',
                italics: variable.format.fontStyle === 'italic',
                underline: variable.format.textDecoration === 'underline' ? {} : undefined,
              })
            ],
            // Use spacing to approximate the positioning
            spacing: {
              before: variable.y * 2,
              after: 0
            }
          });
          
          return paragraph;
        }),
      },
    ],
  });
  
  // Generate blob from the document
  const blob = await Packer.toBlob(doc);
  
  // Save file using FileSaver
  saveAs(blob, `${template.title || 'document'}.docx`);
}

// Helper function to convert CSS text-align to DOCX alignment
function convertTextAlign(textAlign?: string): typeof AlignmentType {
  switch (textAlign) {
    case 'left':
      return AlignmentType.LEFT;
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}
