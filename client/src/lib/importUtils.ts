import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Import PDF as background image
export async function importPDFAsBackground(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Load the PDF file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Prepare a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Get page dimensions
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the PDF page to the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      console.error('Error importing PDF:', error);
      reject(error);
    }
  });
}

// Import DOCX as text content
export async function importDOCXAsText(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Load the DOCX file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert the DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Create a temporary element to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract the text content
      const text = tempDiv.textContent || '';
      
      resolve(text);
    } catch (error) {
      console.error('Error importing DOCX:', error);
      reject(error);
    }
  });
}

// Determine file type and extract content accordingly
export async function importFileContent(file: File): Promise<{type: string, content: string}> {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    const imageData = await importPDFAsBackground(file);
    return { type: 'image', content: imageData };
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             fileType === 'application/msword') {
    const textContent = await importDOCXAsText(file);
    return { type: 'text', content: textContent };
  } else if (fileType.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve({ type: 'image', content: event.target.result as string });
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}