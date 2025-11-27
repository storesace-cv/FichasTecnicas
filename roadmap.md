# Roadmap – Fichas Técnicas Web

## Objetivo
Orientar a entrega incremental da aplicação web que apresenta e gere fichas técnicas, respeitando o comportamento funcional descrito na documentação em `docs/`.

## Fases e estado (sequência de implementação)
1. **Base documental e modelo funcional** – concluída.
   - [x] Consolidar documentação funcional (`docs/00_...` a `docs/13_...`) como fonte de verdade para requisitos, dados de ficha técnica e fluxos de importação.

2. **Backend mínimo para importação e leitura** – em curso.
   - [x] API Flask com endpoints de importação de Excel (`/api/import`) e listagem/consulta (`/api/fichas`, `/api/fichas/:codigo`).
   - [x] Alinhar DTOs com o modelo completo (cabeçalho, alergénios, preparação, totais) e validar erros de acordo com `docs/02_...` e `docs/10_ERROR_CODES.md`.

3. **Frontend de navegação e listagem** – concluída (MVP).
   - [x] Sidebar, pesquisa e cartões de resumo funcionais.
   - [ ] Sincronizar campos exibidos com futuras expansões do backend (dependente da fase 2).

4. **Página de detalhe da ficha técnica** – em progresso (prioritária).
   - [x] Navegação sequencial entre fichas e rendering de nome, código, porções, custo total e tabela de ingredientes (quantidade, unidade, PPU e custo).
   - [x] Cabeçalho completo: família/subfamília, unidade base, validade, temperatura, indicadores (ativo, descontinuado, afeta stock, menu) e informação adicional.
   - [x] Tabela de composição: todos os campos da linha (códigos de componente, peso, ordem e preço calculado) e validação das regras de custo/imutabilidade (`docs/04_INGREDIENTS_SPEC.md`).
   - [x] Totais derivados: peso total, custo por unidade base e custo por dose além do custo total.
   - [x] Alergénios agregados com proveniência por componente (`docs/05_ALLERGENS_SPEC.md`).
   - [x] Bloco de preparação quando existir HTML de instruções.
   - [ ] Carregamento/mostra de imagem do prato quando existir ficheiro associado.

5. **Fluxos de edição (indireta) via reimportação** – por iniciar.
   - [ ] UX para reimportar Excel mantendo imutabilidade dos campos vindos do ficheiro.
   - [ ] Feedback de sucesso/erro conforme catálogo de códigos (`docs/10_ERROR_CODES.md`).

6. **Auditoria, logs e perfis** – por iniciar.
   - [ ] Histórico de importações e alterações seguindo `docs/07_LOGS_AUDIT.md`.
   - [ ] Permissões e perfis conforme `docs/08_ROLES_PERMISSIONS.md`.

## Próximos passos imediatos
- [ ] Popular alergénios e preparação a partir das fontes de dados oficiais (imports/seed) para eliminar placeholders vazios.
- [ ] Rever regras de validação de importação e códigos de erro (`docs/10_ERROR_CODES.md`) para refletir a nova estrutura de DTOs.
- [ ] Exibir imagem do prato quando existir ficheiro associado e alinhar com armazenamento/uploads.
