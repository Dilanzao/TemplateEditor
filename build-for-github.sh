#!/bin/bash

# Criar pasta para GitHub Pages
mkdir -p gh-pages

# Preparação para a build estática
if [ -f "client/index.html" ]; then
  cp client/index.html client/index.html.bak
fi

if [ -f "client/index.static.html" ]; then
  cp client/index.static.html client/index.html
fi

# Copiar também o arquivo favicon.svg para a pasta client se existir
if [ -f "client/public/favicon.svg" ]; then
  cp client/public/favicon.svg client/
fi

# Compilar versão estática
cd client
npx vite build --config vite.config.static.ts
BUILD_RESULT=$?

# Restaurar o arquivo index.html original se existir backup
if [ -f "index.html.bak" ]; then
  mv index.html.bak index.html
fi

# Remover favicon.svg temporário se foi copiado
if [ -f "favicon.svg" ] && [ -f "public/favicon.svg" ]; then
  rm favicon.svg
fi

cd ..

# Verificar se o build falhou e criar uma página estática alternativa
if [ $BUILD_RESULT -ne 0 ]; then
  echo "O build falhou. Criando página estática alternativa..."
  
  # O conteúdo estático foi criado manualmente e está disponível em gh-pages/index.html
  if [ ! -f "gh-pages/index.html" ]; then
    echo "<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Template Editor</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #3490dc; }
  </style>
</head>
<body>
  <h1>Template Editor</h1>
  <p>Versão estática do Template Editor para GitHub Pages</p>
  <p>O build completo falhou. Por favor, verifique o repositório principal.</p>
</body>
</html>" > gh-pages/index.html
  fi
fi

# Copiar outros arquivos necessários 
# Se houver uma pasta public, copie seu conteúdo
if [ -d "public" ]; then
  cp -r public/* gh-pages/ 2>/dev/null || :
fi

# Criar arquivo .nojekyll para GitHub Pages (necessário para evitar processamento Jekyll)
touch gh-pages/.nojekyll

# Criar um arquivo README.md na pasta gh-pages
cat > gh-pages/README.md << 'EOF'
# Template Editor - Versão GitHub Pages

Esta é a versão estática do Template Editor, otimizada para GitHub Pages.

Principais recursos:
- Criação e posicionamento de variáveis em documentos
- Formatação de texto (fonte, tamanho, cor, estilo)
- Grid e linhas guias para posicionamento preciso
- Recurso de arrasta e solta para as variáveis
- Exportação para PDF e DOCX
- Importação de documentos Word e PDF como fundo
- Salvamento de templates em JSON

Projeto implementado com React, TypeScript e Tailwind CSS.
EOF

echo "Build para GitHub Pages concluído em /gh-pages"
echo "Para testar localmente: npx http-server gh-pages"
echo "Para publicar no GitHub: copie o conteúdo da pasta gh-pages para a branch gh-pages"