import { useEffect, useState } from 'react';
import TemplateEditor from './pages/TemplateEditor';

function Router() {
  const [path] = useState('/');
  
  if (path === '/') {
    return <TemplateEditor />;
  }
  
  return <div>Página não encontrada</div>;
}

function App() {
  useEffect(() => {
    document.title = 'Template Editor';
  }, []);

  return (
    <div className="app">
      <Router />
    </div>
  );
}

export default App;