// Express EJS Layout support
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  // Override the render method to support layouts
  const originalRender = app.response.render;
  app.response.render = function(view, options, fn) {
    // Set default options
    options = options || {};
    
    // If layout is explicitly set to false, use the original render
    if (options.layout === false) {
      return originalRender.call(this, view, options, fn);
    }

    // Default layout
    const layout = options.layout || 'main';
    const layoutPath = path.join(app.get('views'), 'layouts', layout + '.ejs');

    // Check if layout exists
    if (!fs.existsSync(layoutPath)) {
      console.error(`Layout ${layout} not found at ${layoutPath}`);
      return originalRender.call(this, view, options, fn);
    }
    
    // Render the content view
    originalRender.call(this, view, options, (err, content) => {
      if (err) {
        if (fn) {
          return fn(err);
        }
        throw err;
      }
      
      // Add the content to the layout options
      options.body = content;
      
      // Render the layout
      originalRender.call(this, `layouts/${layout}`, options, fn);
    });
  };
};