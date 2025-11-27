# Roadmap – Fichas Técnicas Web

## Objetivo
Orientar a entrega incremental da aplicação web que apresenta e gere fichas técnicas, respeitando o comportamento funcional descrito na documentação em `docs/`.

## Fases e estado
1. **Base documental e modelo funcional** – Concluída.
   - Documentação funcional extensa disponível (`docs/00_...` a `docs/13_...`) e usada como fonte de verdade para requisitos de ficha técnica, ingredientes e fluxos de importação.
2. **Backend mínimo para importação e leitura** – Em curso.
   - API Flask expõe importação de Excel (`/api/import`) e leitura de fichas (`/api/fichas`, `/api/fichas/:codigo`).
   - Próximo: alinhar DTOs com o modelo completo (cabeçalho, alergénios, preparação, totais) e cobrir validações/erros definidos em `docs/02_...` e `docs/10_ERROR_CODES.md`.
3. **Frontend de navegação e listagem** – Concluída (MVP).
   - Sidebar, listagem com pesquisa e cartões de resumo funcionais.
   - Dependência: dados hoje limitados ao que a API envia; evolui em paralelo com fase 2.
4. **Página de detalhe da ficha técnica** – Em progresso (prioritária).
   - Implementado: navegação sequencial entre fichas e rendering de nome, código, porções, custo total e tabela de ingredientes com quantidade, unidade, PPU e custo.
   - Em falta para cumprir a especificação da ficha técnica (`docs/03_PRODUCT_TECH_SHEET_SPEC.md`):
     - Cabeçalho completo com família/subfamília, unidade base, validade, temperatura, indicadores (ativo, descontinuado, afeta stock, menu) e informação adicional.
     - Tabela de composição com todos os campos da linha (códigos de componente, peso, ordem e preço calculado) e validação das regras de custo/imutabilidade (`docs/04_INGREDIENTS_SPEC.md`).
     - Totais derivados (peso total, custo por unidade base, custo por dose) além do custo total.
     - Bloco de alergénios agregados e respetiva proveniência por componente (`docs/05_ALLERGENS_SPEC.md`).
     - Bloco de preparação quando existir HTML de instruções.
     - Carregamento/mostra de imagem do prato se existir ficheiro associado.
5. **Fluxos de edição (indireta) via reimportação** – Por iniciar.
   - Garantir UX para reimportar Excel mantendo imutabilidade dos campos vindos do ficheiro.
   - Feedback de sucesso/erro conforme catálogo de códigos (`docs/10_ERROR_CODES.md`).
6. **Auditoria, logs e perfis** – Por iniciar.
   - Guardar histórico de importações e alterações, seguir sugestões de `docs/07_LOGS_AUDIT.md` e aplicar permissões de `docs/08_ROLES_PERMISSIONS.md`.

## Próximos passos imediatos
- Expandir o endpoint `/api/fichas/:codigo` para devolver os campos de cabeçalho, alergénios, peso e preparação exigidos na especificação.
- Atualizar a página de detalhe para apresentar todos os blocos (cabeçalho completo, composição conforme ordem e unidades base, totais, alergénios e preparação) e validar consistência de custos.
- Adicionar testes básicos de contrato entre frontend e backend para garantir que a UI consome os campos definidos na documentação.
