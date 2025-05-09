# Template Editor - Versão GitHub Pages

Esta é a versão estática do Template Editor, otimizada para GitHub Pages.

## Principais recursos:
- Criação e posicionamento de variáveis em documentos
- Formatação de texto (fonte, tamanho, cor, estilo)
- Grid e linhas guias para posicionamento preciso
- Recurso de arrastar e soltar para as variáveis
- Exportação para PDF e DOCX
- Importação de documentos Word e PDF como fundo
- Salvamento de templates em JSON

## Instruções para publicação:

1. Esta pasta contém os arquivos estáticos para serem publicados no GitHub Pages.
2. Para publicar, crie uma branch gh-pages no seu repositório GitHub.
3. Copie todo o conteúdo desta pasta para a branch gh-pages.
4. Configure o GitHub Pages nas configurações do repositório para usar a branch gh-pages.
5. Seu site será publicado em `https://seuusuario.github.io/seurepo/`.

## Notas técnicas:

- O build completo está enfrentando problemas com a configuração do Tailwind CSS.
- A página index.html atual é uma página estática temporária.
- Para o aplicativo completo, é necessário executar o build usando o script `build-for-github.sh` (requer ajustes na configuração do Tailwind).

Projeto implementado com React, TypeScript e Tailwind CSS.