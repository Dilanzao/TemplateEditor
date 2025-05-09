document.addEventListener('DOMContentLoaded', function() {
  // Constantes para tamanhos de página
  const PAGE_SIZES = {
    a4: {
      name: 'a4',
      label: 'A4 (210 × 297 mm)',
      width: 210,
      height: 297,
      unit: 'mm'
    },
    letter: {
      name: 'letter',
      label: 'Letter (8.5 × 11 in)',
      width: 8.5,
      height: 11,
      unit: 'in'
    },
    legal: {
      name: 'legal',
      label: 'Legal (8.5 × 14 in)',
      width: 8.5,
      height: 14,
      unit: 'in'
    }
  };

  // Elementos do DOM
  const editorCanvas = document.getElementById('editor-canvas');
  const variablesList = document.getElementById('variables-list');
  const addVariableBtn = document.getElementById('add-variable-btn');
  const variableModal = document.getElementById('variable-modal');
  const saveVariableBtn = document.getElementById('save-variable-btn');
  const cancelVariableBtn = document.getElementById('cancel-variable-btn');
  const clearVariablesBtn = document.getElementById('clear-variables-btn');
  const formatToolbar = document.getElementById('format-toolbar');
  const titleInput = document.getElementById('template-title');
  const pageSizeSelect = document.getElementById('page-size');
  const showBackgroundCheckbox = document.getElementById('show-background');
  const gridToggle = document.getElementById('show-grid');
  const snapToggle = document.getElementById('enable-snap');
  const mousePositionDisplay = document.getElementById('mouse-position');
  const exportPdfBtn = document.getElementById('export-pdf');
  const exportDocxBtn = document.getElementById('export-docx');
  const exportJsonBtn = document.getElementById('export-json');
  const saveTemplateBtn = document.getElementById('save-template');
  const loadTemplateBtn = document.getElementById('load-template');
  const uploadBackgroundBtn = document.getElementById('upload-background');
  const uploadBackgroundInput = document.getElementById('upload-background-input');
  const uploadWordBtn = document.getElementById('upload-word');
  const uploadWordInput = document.getElementById('upload-word-input');
  const uploadPdfBtn = document.getElementById('upload-pdf');
  const uploadPdfInput = document.getElementById('upload-pdf-input');

  // Estado do editor
  let template = {
    id: generateUUID(),
    title: 'Untitled Document',
    pageSize: 'a4',
    backgroundImage: null,
    showBackgroundInOutput: true,
    variables: []
  };

  let selectedVariableId = null;
  let isEditing = false;
  let editingVariable = null;
  let initialPosition = { x: 100, y: 100 };
  let showGrid = true;
  let enableSnap = true;
  let mousePosition = null;
  const gridSize = 25; // Tamanho da célula da grade em pixels

  // Carregar template inicial ou template salvo
  function initializeEditor() {
    if (editorCanvas) {
      // Configura o canvas com o tamanho correto
      updateCanvasSize();
      
      // Adiciona event listeners
      editorCanvas.addEventListener('click', handleCanvasClick);
      editorCanvas.addEventListener('mousemove', handleCanvasMouseMove);
      editorCanvas.addEventListener('mouseleave', handleCanvasMouseLeave);
      
      if (addVariableBtn) {
        addVariableBtn.addEventListener('click', handleAddVariable);
      }
      
      if (clearVariablesBtn) {
        clearVariablesBtn.addEventListener('click', handleClearVariables);
      }
      
      if (saveVariableBtn) {
        saveVariableBtn.addEventListener('click', handleSaveVariable);
      }
      
      if (cancelVariableBtn) {
        cancelVariableBtn.addEventListener('click', () => {
          if (variableModal) {
            variableModal.classList.add('hidden');
          }
        });
      }
      
      if (titleInput) {
        titleInput.addEventListener('change', (e) => {
          template.title = e.target.value;
        });
      }
      
      if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
          template.pageSize = e.target.value;
          updateCanvasSize();
        });
      }
      
      if (showBackgroundCheckbox) {
        showBackgroundCheckbox.addEventListener('change', (e) => {
          template.showBackgroundInOutput = e.target.checked;
        });
      }
      
      if (gridToggle) {
        gridToggle.addEventListener('change', (e) => {
          showGrid = e.target.checked;
          updateGridVisibility();
        });
      }
      
      if (snapToggle) {
        snapToggle.addEventListener('change', (e) => {
          enableSnap = e.target.checked;
        });
      }
      
      if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', handleExportPDF);
      }
      
      if (exportDocxBtn) {
        exportDocxBtn.addEventListener('click', handleExportDOCX);
      }
      
      if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', handleExportJSON);
      }
      
      if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', handleSaveTemplate);
      }
      
      if (loadTemplateBtn) {
        loadTemplateBtn.addEventListener('click', handleLoadTemplate);
      }
      
      if (uploadBackgroundBtn && uploadBackgroundInput) {
        uploadBackgroundBtn.addEventListener('click', () => {
          uploadBackgroundInput.click();
        });
        
        uploadBackgroundInput.addEventListener('change', handleBackgroundUpload);
      }
      
      if (uploadWordBtn && uploadWordInput) {
        uploadWordBtn.addEventListener('click', () => {
          uploadWordInput.click();
        });
        
        uploadWordInput.addEventListener('change', handleWordUpload);
      }
      
      if (uploadPdfBtn && uploadPdfInput) {
        uploadPdfBtn.addEventListener('click', () => {
          uploadPdfInput.click();
        });
        
        uploadPdfInput.addEventListener('change', handlePdfUpload);
      }
      
      // Inicializa os tabs se existirem
      initializeTabs();
      
      // Tentar carregar um template salvo
      loadTemplateFromStorage();
      
      // Renderiza o template inicial
      renderTemplate();
    }
  }

  // Atualizar o tamanho do canvas com base no tamanho da página
  function updateCanvasSize() {
    if (!editorCanvas) return;
    
    const canvasSize = getCanvasSize(template.pageSize);
    editorCanvas.style.width = `${canvasSize.width}px`;
    editorCanvas.style.height = `${canvasSize.height}px`;
    
    // Atualiza também a grade e réguas
    updateGridAndRulers();
  }

  // Função para inicializar os tabs
  function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');
        
        // Remove a classe active de todos os tabs e conteúdos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Adiciona a classe active ao tab clicado e seu conteúdo
        button.classList.add('active');
        document.getElementById(target).classList.add('active');
      });
    });
  }

  // Função para obter o tamanho do canvas baseado no tamanho da página
  function getCanvasSize(pageSize) {
    // Fator de escala para o tamanho de renderização
    const SCALE_FACTOR = 2.83; // Dá aproximadamente 794px de largura para A4
    
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
    
    // Padrão para A4 se não encontrado
    return {
      width: 794,
      height: 1123
    };
  }

  // Atualiza a grade e réguas
  function updateGridAndRulers() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;
    
    const canvasSize = getCanvasSize(template.pageSize);
    
    // Limpa os elementos da grade existentes
    const existingGrid = document.getElementById('grid-container');
    if (existingGrid) {
      existingGrid.remove();
    }
    
    if (!showGrid) return;
    
    // Cria um novo container para a grade
    const gridContainer = document.createElement('div');
    gridContainer.id = 'grid-container';
    gridContainer.className = 'grid-lines';
    gridContainer.style.width = `${canvasSize.width}px`;
    gridContainer.style.height = `${canvasSize.height}px`;
    
    // Cria a régua horizontal
    const rulerH = document.createElement('div');
    rulerH.className = 'ruler-h';
    gridContainer.appendChild(rulerH);
    
    // Cria a régua vertical
    const rulerV = document.createElement('div');
    rulerV.className = 'ruler-v';
    gridContainer.appendChild(rulerV);
    
    // Adiciona marcações nas réguas
    for (let i = 0; i < canvasSize.width; i += gridSize) {
      if (i % 100 === 0) {
        const marker = document.createElement('div');
        marker.className = 'ruler-marker-h';
        marker.style.position = 'absolute';
        marker.style.left = `${i}px`;
        marker.style.top = '0';
        marker.style.width = '1px';
        marker.style.height = '10px';
        marker.style.backgroundColor = '#888';
        rulerH.appendChild(marker);
        
        const label = document.createElement('span');
        label.style.position = 'absolute';
        label.style.left = `${i + 2}px`;
        label.style.top = '11px';
        label.style.fontSize = '8px';
        label.style.color = '#888';
        label.textContent = i.toString();
        rulerH.appendChild(label);
      }
    }
    
    for (let i = 0; i < canvasSize.height; i += gridSize) {
      if (i % 100 === 0) {
        const marker = document.createElement('div');
        marker.className = 'ruler-marker-v';
        marker.style.position = 'absolute';
        marker.style.left = '0';
        marker.style.top = `${i}px`;
        marker.style.width = '10px';
        marker.style.height = '1px';
        marker.style.backgroundColor = '#888';
        rulerV.appendChild(marker);
        
        const label = document.createElement('span');
        label.style.position = 'absolute';
        label.style.left = '11px';
        label.style.top = `${i + 2}px`;
        label.style.fontSize = '8px';
        label.style.color = '#888';
        label.textContent = i.toString();
        rulerV.appendChild(label);
      }
    }
    
    // Adiciona linhas de grade
    for (let i = gridSize; i < canvasSize.width; i += gridSize) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = `${i}px`;
      line.style.top = '0';
      line.style.width = '1px';
      line.style.height = '100%';
      line.style.backgroundColor = i % 100 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
      gridContainer.appendChild(line);
    }
    
    for (let i = gridSize; i < canvasSize.height; i += gridSize) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = '0';
      line.style.top = `${i}px`;
      line.style.width = '100%';
      line.style.height = '1px';
      line.style.backgroundColor = i % 100 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
      gridContainer.appendChild(line);
    }
    
    canvas.appendChild(gridContainer);
  }

  // Atualizar a visibilidade da grade
  function updateGridVisibility() {
    const gridContainer = document.getElementById('grid-container');
    
    if (showGrid) {
      if (!gridContainer) {
        updateGridAndRulers();
      } else {
        gridContainer.style.display = 'block';
      }
    } else {
      if (gridContainer) {
        gridContainer.style.display = 'none';
      }
    }
  }

  // Atualizar as guias do mouse
  function updateMouseGuides(x, y) {
    // Remove guias existentes
    const existingGuideH = document.getElementById('mouse-guide-h');
    const existingGuideV = document.getElementById('mouse-guide-v');
    const existingPosition = document.getElementById('mouse-position-display');
    
    if (existingGuideH) existingGuideH.remove();
    if (existingGuideV) existingGuideV.remove();
    if (existingPosition) existingPosition.remove();
    
    if (!mousePosition) return;
    
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;
    
    // Guia horizontal
    const guideH = document.createElement('div');
    guideH.id = 'mouse-guide-h';
    guideH.className = 'mouse-guide-h';
    guideH.style.top = `${y}px`;
    canvas.appendChild(guideH);
    
    // Guia vertical
    const guideV = document.createElement('div');
    guideV.id = 'mouse-guide-v';
    guideV.className = 'mouse-guide-v';
    guideV.style.left = `${x}px`;
    canvas.appendChild(guideV);
    
    // Exibição da posição
    const position = document.createElement('div');
    position.id = 'mouse-position-display';
    position.className = 'mouse-position';
    position.style.left = `${x + 10}px`;
    position.style.top = `${y + 10}px`;
    position.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    canvas.appendChild(position);
    
    // Atualiza o display de posição na interface
    if (mousePositionDisplay) {
      mousePositionDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    }
  }

  // Handler para o evento de click no canvas
  function handleCanvasClick(e) {
    if (e.target !== editorCanvas || isEditing) return;
    
    const rect = editorCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Snap para a grade se necessário
    if (enableSnap) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    initialPosition = { x, y };
    
    if (variableModal) {
      document.getElementById('variable-title').value = '';
      document.getElementById('variable-value').value = '';
      document.getElementById('variable-x').value = x;
      document.getElementById('variable-y').value = y;
      
      editingVariable = null;
      variableModal.classList.remove('hidden');
    }
  }

  // Handler para o movimento do mouse no canvas
  function handleCanvasMouseMove(e) {
    const rect = editorCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    mousePosition = { x, y };
    updateMouseGuides(x, y);
  }

  // Handler para quando o mouse sai do canvas
  function handleCanvasMouseLeave() {
    mousePosition = null;
    updateMouseGuides(0, 0);
  }

  // Handler para adicionar uma variável
  function handleAddVariable() {
    initialPosition = { x: 100, y: 100 };
    editingVariable = null;
    
    if (variableModal) {
      document.getElementById('variable-title').value = '';
      document.getElementById('variable-value').value = '';
      document.getElementById('variable-x').value = initialPosition.x;
      document.getElementById('variable-y').value = initialPosition.y;
      
      variableModal.classList.remove('hidden');
    }
  }

  // Handler para limpar todas as variáveis
  function handleClearVariables() {
    if (confirm('Tem certeza que deseja remover todas as variáveis? Esta ação não pode ser desfeita.')) {
      template.variables = [];
      selectedVariableId = null;
      isEditing = false;
      renderTemplate();
    }
  }

  // Handler para salvar a variável
  function handleSaveVariable() {
    const titleInput = document.getElementById('variable-title');
    const valueInput = document.getElementById('variable-value');
    const xInput = document.getElementById('variable-x');
    const yInput = document.getElementById('variable-y');
    
    if (!titleInput || !valueInput || !xInput || !yInput) return;
    
    const title = titleInput.value.trim();
    const value = valueInput.value.trim();
    const x = parseInt(xInput.value) || 0;
    const y = parseInt(yInput.value) || 0;
    
    if (!title || !value) {
      alert('Título e Valor são obrigatórios');
      return;
    }
    
    if (editingVariable) {
      // Atualiza variável existente
      const index = template.variables.findIndex(v => v.id === editingVariable.id);
      if (index !== -1) {
        template.variables[index] = {
          ...template.variables[index],
          title,
          value,
          x,
          y
        };
      }
    } else {
      // Adiciona nova variável
      const newVariable = {
        id: generateUUID(),
        title,
        value,
        x,
        y,
        format: {
          fontFamily: 'Arial',
          fontSize: 12,
          color: '#000000'
        }
      };
      
      template.variables.push(newVariable);
    }
    
    if (variableModal) {
      variableModal.classList.add('hidden');
    }
    
    renderTemplate();
  }

  // Handler para editar uma variável
  function handleEditVariable(id) {
    const variable = template.variables.find(v => v.id === id);
    if (!variable) return;
    
    editingVariable = variable;
    
    if (variableModal) {
      document.getElementById('variable-title').value = variable.title;
      document.getElementById('variable-value').value = variable.value;
      document.getElementById('variable-x').value = variable.x;
      document.getElementById('variable-y').value = variable.y;
      
      variableModal.classList.remove('hidden');
    }
  }

  // Handler para deletar uma variável
  function handleDeleteVariable(id) {
    if (confirm('Tem certeza que deseja remover esta variável?')) {
      template.variables = template.variables.filter(v => v.id !== id);
      
      if (selectedVariableId === id) {
        selectedVariableId = null;
        isEditing = false;
      }
      
      renderTemplate();
    }
  }

  // Handler para selecionar uma variável
  function handleSelectVariable(id) {
    selectedVariableId = id;
    isEditing = true;
    
    renderTemplate();
    
    // Exibe a barra de formatação
    if (formatToolbar) {
      formatToolbar.classList.remove('hidden');
      
      // Preenche os valores da barra de formatação com os valores da variável selecionada
      const variable = template.variables.find(v => v.id === id);
      if (variable) {
        const fontFamilySelect = document.getElementById('font-family');
        const fontSizeSelect = document.getElementById('font-size');
        const colorInput = document.getElementById('text-color');
        const boldButton = document.getElementById('bold-button');
        const italicButton = document.getElementById('italic-button');
        const underlineButton = document.getElementById('underline-button');
        const alignLeftButton = document.getElementById('align-left');
        const alignCenterButton = document.getElementById('align-center');
        const alignRightButton = document.getElementById('align-right');
        
        if (fontFamilySelect) fontFamilySelect.value = variable.format.fontFamily || 'Arial';
        if (fontSizeSelect) fontSizeSelect.value = variable.format.fontSize.toString() || '12';
        if (colorInput) colorInput.value = variable.format.color || '#000000';
        if (boldButton) boldButton.classList.toggle('active', variable.format.fontWeight === 'bold');
        if (italicButton) italicButton.classList.toggle('active', variable.format.fontStyle === 'italic');
        if (underlineButton) underlineButton.classList.toggle('active', variable.format.textDecoration === 'underline');
        
        // Alinhamento de texto
        const alignButtons = [alignLeftButton, alignCenterButton, alignRightButton];
        alignButtons.forEach(btn => {
          if (btn) btn.classList.remove('active');
        });
        
        if (variable.format.textAlign === 'center' && alignCenterButton) {
          alignCenterButton.classList.add('active');
        } else if (variable.format.textAlign === 'right' && alignRightButton) {
          alignRightButton.classList.add('active');
        } else if (alignLeftButton) {
          alignLeftButton.classList.add('active');
        }
      }
    }
  }

  // Handler para atualizar o formato da variável
  function handleFormatVariable(property, value) {
    if (!selectedVariableId) return;
    
    const index = template.variables.findIndex(v => v.id === selectedVariableId);
    if (index === -1) return;
    
    if (property === 'fontWeight' || property === 'fontStyle' || property === 'textDecoration') {
      // Toggle para propriedades que podem ser ativadas/desativadas
      const currentValue = template.variables[index].format[property];
      template.variables[index].format[property] = currentValue === value ? '' : value;
    } else {
      // Atribuição direta para outras propriedades
      template.variables[index].format[property] = value;
    }
    
    renderTemplate();
  }

  // Handler para arquivo de background
  function handleBackgroundUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      template.backgroundImage = event.target?.result as string;
      renderTemplate();
    };
    reader.readAsDataURL(file);
    
    // Limpa o input para que o mesmo arquivo possa ser selecionado novamente
    e.target.value = '';
  }

  // Handler para arquivo Word
  function handleWordUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Usa a biblioteca mammoth para extrair o texto
    mammoth.extractRawText({ arrayBuffer: file.arrayBuffer() })
      .then(result => {
        // Cria uma nova variável com o texto extraído
        const newVariable = {
          id: generateUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove a extensão
          value: result.value,
          x: 50,
          y: 50,
          format: {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#000000'
          }
        };
        
        template.variables.push(newVariable);
        renderTemplate();
      })
      .catch(error => {
        console.error('Erro ao importar arquivo Word:', error);
        alert('Erro ao importar arquivo Word. Por favor, tente novamente.');
      });
    
    // Limpa o input para que o mesmo arquivo possa ser selecionado novamente
    e.target.value = '';
  }

  // Handler para arquivo PDF
  function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result;
      
      // Usa a biblioteca pdf.js para renderizar a primeira página
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      try {
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        template.backgroundImage = canvas.toDataURL('image/png');
        renderTemplate();
      } catch (error) {
        console.error('Erro ao importar PDF:', error);
        alert('Erro ao importar PDF. Por favor, tente novamente.');
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Limpa o input para que o mesmo arquivo possa ser selecionado novamente
    e.target.value = '';
  }

  // Função para exportar como PDF
  function handleExportPDF() {
    try {
      // Usa a biblioteca jsPDF para gerar um PDF
      const { jsPDF } = window.jspdf;
      
      const size = PAGE_SIZES[template.pageSize] || PAGE_SIZES.a4;
      const orientation = size.width > size.height ? 'landscape' : 'portrait';
      
      // Normaliza a unidade para valores aceitos pela biblioteca
      const pdfUnit = (size.unit === 'mm' || size.unit === 'in' || size.unit === 'pt' || 
                    size.unit === 'px' || size.unit === 'cm') ? size.unit : 'mm';
      
      const pdf = new jsPDF({
        orientation,
        unit: pdfUnit,
        format: [size.width, size.height]
      });
      
      // Adiciona a imagem de fundo se houver e estiver ativada
      if (template.backgroundImage && template.showBackgroundInOutput) {
        pdf.addImage(
          template.backgroundImage,
          'JPEG',
          0,
          0,
          size.width,
          size.height
        );
      }
      
      // Adiciona as variáveis
      const canvasSize = getCanvasSize(template.pageSize);
      
      template.variables.forEach(variable => {
        // Calcula a posição baseada no tamanho da página
        const xRatio = variable.x / canvasSize.width;
        const yRatio = variable.y / canvasSize.height;
        
        const xPos = xRatio * size.width;
        const yPos = yRatio * size.height;
        
        // Configura as propriedades do texto
        pdf.setFont(variable.format.fontFamily || 'helvetica');
        pdf.setFontSize(variable.format.fontSize || 12);
        pdf.setTextColor(variable.format.color || '#000000');
        
        // Estilos do texto
        if (variable.format.fontWeight === 'bold') {
          pdf.setFont(variable.format.fontFamily || 'helvetica', 'bold');
        }
        if (variable.format.fontStyle === 'italic') {
          pdf.setFont(variable.format.fontFamily || 'helvetica', 'italic');
        }
        
        // Adiciona o texto
        pdf.text(variable.value, xPos, yPos);
      });
      
      // Salva o PDF
      pdf.save(`${template.title || 'documento'}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Por favor, tente novamente.');
    }
  }

  // Função para exportar como DOCX
  function handleExportDOCX() {
    try {
      // Usa a biblioteca docx para gerar um documento Word
      const { Document, Packer, Paragraph, TextRun } = window.docx;
      
      // Cria um novo documento
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: template.variables.map(variable => {
              // Cria um parágrafo com o alinhamento apropriado
              const alignment = getDocxAlignment(variable.format.textAlign);
              
              // Cria o parágrafo
              return new Paragraph({
                alignment,
                children: [
                  new TextRun({
                    text: variable.value,
                    font: variable.format.fontFamily,
                    size: variable.format.fontSize * 2, // DOCX usa half-points
                    color: variable.format.color?.replace('#', ''),
                    bold: variable.format.fontWeight === 'bold',
                    italics: variable.format.fontStyle === 'italic',
                    underline: variable.format.textDecoration === 'underline' ? {} : undefined,
                  })
                ],
                spacing: {
                  before: variable.y * 2,
                  after: 0
                }
              });
            })
          }
        ]
      });
      
      // Gera o blob a partir do documento
      Packer.toBlob(doc).then(blob => {
        // Usa a biblioteca FileSaver para salvar o arquivo
        saveAs(blob, `${template.title || 'documento'}.docx`);
      });
    } catch (error) {
      console.error('Erro ao exportar DOCX:', error);
      alert('Erro ao exportar DOCX. Por favor, tente novamente.');
    }
  }

  // Função auxiliar para obter o alinhamento no formato DOCX
  function getDocxAlignment(textAlign) {
    const { AlignmentType } = window.docx;
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

  // Função para exportar como JSON
  function handleExportJSON() {
    try {
      const jsonContent = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `${template.title || 'template'}.json`);
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      alert('Erro ao exportar JSON. Por favor, tente novamente.');
    }
  }

  // Função para salvar o template
  function handleSaveTemplate() {
    try {
      // Salva no localStorage
      const templates = JSON.parse(localStorage.getItem('templates') || '[]');
      
      // Verifica se o template já existe
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Atualiza o template existente
        templates[existingIndex] = template;
      } else {
        // Adiciona o novo template
        templates.push(template);
      }
      
      localStorage.setItem('templates', JSON.stringify(templates));
      
      alert('Template salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template. Por favor, tente novamente.');
    }
  }

  // Função para carregar o template
  function handleLoadTemplate() {
    try {
      // Carrega do localStorage
      const templates = JSON.parse(localStorage.getItem('templates') || '[]');
      
      if (templates.length === 0) {
        alert('Não existem templates salvos.');
        return;
      }
      
      // Para simplificar, carrega o template mais recente
      // Em uma implementação completa, mostraria um modal com uma lista para escolher
      template = templates[templates.length - 1];
      
      // Atualiza a interface
      if (titleInput) {
        titleInput.value = template.title;
      }
      
      if (pageSizeSelect) {
        pageSizeSelect.value = template.pageSize;
      }
      
      if (showBackgroundCheckbox) {
        showBackgroundCheckbox.checked = template.showBackgroundInOutput;
      }
      
      updateCanvasSize();
      renderTemplate();
      
      alert('Template carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      alert('Erro ao carregar template. Por favor, tente novamente.');
    }
  }

  // Função para carregar um template salvo ao iniciar
  function loadTemplateFromStorage() {
    // Se houver um template na URL, tenta carregar
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('id');
    
    if (templateId) {
      try {
        const templates = JSON.parse(localStorage.getItem('templates') || '[]');
        const savedTemplate = templates.find(t => t.id === templateId);
        
        if (savedTemplate) {
          template = savedTemplate;
          
          // Atualiza a interface
          if (titleInput) {
            titleInput.value = template.title;
          }
          
          if (pageSizeSelect) {
            pageSizeSelect.value = template.pageSize;
          }
          
          if (showBackgroundCheckbox) {
            showBackgroundCheckbox.checked = template.showBackgroundInOutput;
          }
          
          updateCanvasSize();
        }
      } catch (error) {
        console.error('Erro ao carregar template do localStorage:', error);
      }
    }
  }

  // Renderiza o template no canvas
  function renderTemplate() {
    // Atualiza o tamanho do canvas
    updateCanvasSize();
    
    // Aplica o background se houver
    if (template.backgroundImage) {
      editorCanvas.style.backgroundImage = `url('${template.backgroundImage}')`;
    } else {
      editorCanvas.style.backgroundImage = 'none';
    }
    
    // Remove todas as variáveis existentes do DOM
    const existingVariables = editorCanvas.querySelectorAll('.variable-element');
    existingVariables.forEach(el => el.remove());
    
    // Renderiza as variáveis
    template.variables.forEach(variable => {
      const variableElement = document.createElement('div');
      variableElement.className = `variable-element ${selectedVariableId === variable.id ? 'selected' : ''}`;
      variableElement.dataset.id = variable.id;
      variableElement.style.left = `${variable.x}px`;
      variableElement.style.top = `${variable.y}px`;
      variableElement.style.fontFamily = variable.format.fontFamily || 'Arial';
      variableElement.style.fontSize = `${variable.format.fontSize || 12}px`;
      variableElement.style.fontWeight = variable.format.fontWeight || 'normal';
      variableElement.style.fontStyle = variable.format.fontStyle || 'normal';
      variableElement.style.textDecoration = variable.format.textDecoration || 'none';
      variableElement.style.textAlign = variable.format.textAlign || 'left';
      variableElement.style.color = variable.format.color || '#000000';
      
      variableElement.textContent = variable.value;
      
      // Adiciona event listeners para a variável
      variableElement.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectVariable(variable.id);
      });
      
      // Adiciona ao canvas
      editorCanvas.appendChild(variableElement);
    });
    
    // Renderiza a lista de variáveis no sidebar
    if (variablesList) {
      variablesList.innerHTML = '';
      
      if (template.variables.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-4 text-center text-sm text-gray-500';
        emptyMessage.textContent = 'Nenhuma variável adicionada. Clique no botão + para adicionar.';
        variablesList.appendChild(emptyMessage);
      } else {
        template.variables.forEach(variable => {
          const variableItem = document.createElement('div');
          variableItem.className = `p-3 mb-2 rounded border transition-colors ${
            selectedVariableId === variable.id
              ? 'bg-blue-50 border-blue-500'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`;
          
          variableItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium text-sm text-gray-700">${variable.title}</h3>
              <div class="flex space-x-1">
                <button class="edit-btn h-6 w-6 p-0 text-gray-500 hover:text-blue-500" data-id="${variable.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="delete-btn h-6 w-6 p-0 text-gray-500 hover:text-red-500" data-id="${variable.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div 
              class="text-sm border-l-2 border-blue-500 pl-2 mb-2"
              style="
                font-family: ${variable.format.fontFamily || 'Arial'};
                font-size: ${variable.format.fontSize || 12}px;
                font-weight: ${variable.format.fontWeight || 'normal'};
                font-style: ${variable.format.fontStyle || 'normal'};
                text-decoration: ${variable.format.textDecoration || 'none'};
                text-align: ${variable.format.textAlign || 'left'};
                color: ${variable.format.color || '#000000'};
              "
            >
              ${variable.value}
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>X: ${variable.x}</span>
              <span>Y: ${variable.y}</span>
            </div>
          `;
          
          variableItem.addEventListener('click', () => handleSelectVariable(variable.id));
          
          const editBtn = variableItem.querySelector('.edit-btn');
          if (editBtn) {
            editBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              handleEditVariable(variable.id);
            });
          }
          
          const deleteBtn = variableItem.querySelector('.delete-btn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              handleDeleteVariable(variable.id);
            });
          }
          
          variablesList.appendChild(variableItem);
        });
      }
    }
  }

  // Função para gerar um UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Inicializa o editor
  initializeEditor();
});