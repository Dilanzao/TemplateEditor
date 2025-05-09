# Template Editor

Um editor de templates com posicionamento de variáveis, formatação e exportação de documentos.

## Funcionalidades

- Criação e posicionamento de variáveis em templates
- Formatação de texto (fonte, tamanho, cor, estilo)
- Grid e linhas guias para posicionamento preciso
- Recurso de arrastar e soltar (drag & drop) para variáveis
- Exportação para PDF e DOCX
- Importação de documentos Word e PDF como fundo
- Salvamento de templates em JSON

## Estrutura do Projeto

O projeto utiliza React com TypeScript para o frontend e Express para o backend. Ele inclui:

- Frontend: React/TypeScript, TailwindCSS, shadcn/ui
- Armazenamento: localStorage para persistência no navegador
- Exportação: PDF (jsPDF) e DOCX (docx-js)
- Manipulação de Arquivos: Importação de PDF/Word

## Publicação no GitHub Pages

Para publicar este projeto no GitHub Pages:

1. Execute o script de build para o GitHub Pages:
   ```bash
   ./build-for-github.sh
   ```

2. Isso criará uma pasta `gh-pages` com a versão estática do aplicativo.

3. Crie uma branch gh-pages no seu repositório GitHub, ou utilize a interface do GitHub para configurar o GitHub Pages.

4. Faça upload do conteúdo da pasta `gh-pages` para a branch gh-pages.

5. Seu site será publicado em `https://seuusuario.github.io/seurepo/`.

## Desenvolvimento Local

Para executar o projeto localmente:

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Construir versão para produção
npm run build

# Visualizar a versão do GitHub Pages localmente
cd gh-pages && npx http-server
```

## Licença

MIT