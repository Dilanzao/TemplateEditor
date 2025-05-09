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

# Restaurar o arquivo index.html original se existir backup
if [ -f "index.html.bak" ]; then
  mv index.html.bak index.html
fi

# Remover favicon.svg temporário se foi copiado
if [ -f "favicon.svg" ] && [ -f "public/favicon.svg" ]; then
  rm favicon.svg
fi

cd ..

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