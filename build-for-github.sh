#!/bin/bash

# Criar pasta para GitHub Pages
mkdir -p gh-pages

# Compilar versão estática
cd client
npx vite build --config vite.config.static.ts --outDir ../gh-pages

# Copiar outros arquivos necessários 
cp -r ../public/* ../gh-pages/ 2>/dev/null || :

# Criar arquivo .nojekyll para GitHub Pages
touch ../gh-pages/.nojekyll

echo "Build para GitHub Pages concluído em /gh-pages"
echo "Para testar localmente: npx http-server gh-pages"
echo "Para publicar no GitHub: copie o conteúdo da pasta gh-pages para a branch gh-pages"