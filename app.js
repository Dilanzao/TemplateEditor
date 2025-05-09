const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply the layout middleware
require('./views/layouts/layout')(app);

// Set up session
app.use(session({
  secret: 'template-editor-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Method override for PUT and DELETE requests from forms
app.use(methodOverride('_method'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory storage for templates (would be a database in production)
let templates = [];

// Helper function to render the EJS template with layout
const renderWithLayout = (res, view, data = {}) => {
  data.body = view;
  res.render('layouts/main', data);
};

// Routes
// Home page
app.get('/', (req, res) => {
  renderWithLayout(res, 'index', { title: 'Página Inicial' });
});

// List all templates
app.get('/templates', (req, res) => {
  renderWithLayout(res, 'templates/index', { title: 'Meus Templates', templates });
});

// Show the new template form
app.get('/templates/new', (req, res) => {
  renderWithLayout(res, 'templates/new', { title: 'Novo Template' });
});

// Create a new template
app.post('/templates', (req, res) => {
  const { title, pageSize, backgroundImage, showBackgroundInOutput } = req.body;
  
  const newTemplate = {
    id: uuidv4(),
    title: title || 'Untitled Document',
    pageSize: pageSize || 'a4',
    backgroundImage: backgroundImage || null,
    showBackgroundInOutput: showBackgroundInOutput === 'on',
    variables: []
  };
  
  templates.push(newTemplate);
  
  res.redirect(`/templates/${newTemplate.id}`);
});

// Show edit template page
app.get('/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.redirect('/templates');
  }
  
  renderWithLayout(res, 'templates/edit', { 
    title: `Editando: ${template.title}`,
    template 
  });
});

// Update template
app.put('/templates/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const updatedTemplate = {
    ...templates[templateIndex],
    ...req.body
  };
  
  templates[templateIndex] = updatedTemplate;
  
  res.json(updatedTemplate);
});

// Delete template
app.delete('/templates/:id', (req, res) => {
  templates = templates.filter(t => t.id !== req.params.id);
  res.redirect('/templates');
});

// API endpoints for AJAX operations
// Get all templates
app.get('/api/templates', (req, res) => {
  res.json(templates);
});

// Get a single template
app.get('/api/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

// Create a new template via API
app.post('/api/templates', (req, res) => {
  const newTemplate = {
    id: uuidv4(),
    ...req.body
  };
  
  templates.push(newTemplate);
  
  res.status(201).json(newTemplate);
});

// Update a template via API
app.put('/api/templates/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const updatedTemplate = {
    ...templates[templateIndex],
    ...req.body
  };
  
  templates[templateIndex] = updatedTemplate;
  
  res.json(updatedTemplate);
});

// Delete a template via API
app.delete('/api/templates/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates.splice(templateIndex, 1);
  
  res.status(204).send();
});

// Handle file uploads
app.post('/api/upload', (req, res) => {
  // This is a simplified version; in a real app, you'd use multer or another library
  const { fileData, fileName, fileType } = req.body;
  
  if (!fileData || !fileName) {
    return res.status(400).json({ error: 'Missing file data or name' });
  }
  
  // Generate a unique filename
  const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName}`;
  const filePath = path.join(uploadsDir, uniqueFileName);
  
  // Extract the base64 data (remove the prefix like "data:image/jpeg;base64,")
  const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ error: 'Invalid file data format' });
  }
  
  const base64Data = matches[2];
  const fileBuffer = Buffer.from(base64Data, 'base64');
  
  // Write the file
  fs.writeFile(filePath, fileBuffer, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).json({ error: 'Failed to save file' });
    }
    
    // Return the path to the file
    res.json({ 
      url: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Log when app is ready
console.log('Aplicação Express inicializada e pronta para ser executada');

module.exports = app;