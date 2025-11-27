# README_FOR_CODEX.md

> **Destinatário:** Codex / GitHub Copilot / outras IAs que gerem ou alterem código neste repositório.  
> **Objetivo:** Explicar como usar a documentação funcional em `docs/` sem destruir comportamento já existente.

---

## 1. O que está em `docs/`

A pasta `docs/` contém a **fonte de verdade funcional e de dados** da aplicação de Fichas Técnicas.

Os ficheiros principais são:

- `00_OVERVIEW.md` – visão geral do sistema  
- `01_DATA_MODEL.md` – modelo de dados lógico (entidades, campos, relações)  
- `02_EXCEL_IMPORT_SPEC.md` – regras de importação Excel (3 menus, 3 tipos de ficheiro)  
- `03_PRODUCT_TECH_SHEET_SPEC.md` – estrutura da ficha técnica a apresentar ao utilizador  
- `04_INGREDIENTS_SPEC.md` – definição de componentes / ingredientes  
- `05_ALLERGENS_SPEC.md` – tabela e regras de propagação de alergénios  
- `06_BUSINESS_RULES.md` – regras de negócio (inclui imutabilidade de campos)  
- `07_LOGS_AUDIT.md` – recomendações para histórico e auditoria  
- `08_ROLES_PERMISSIONS.md` – perfis de utilizador e permissões sugeridas  
- `09_DATA_FLOW.md` – fluxos de dados Excel → Base de Dados → UI  
- `10_ERROR_CODES.md` – catálogo funcional de erros de importação  
- `11_GLOSSARY.md` – glossário funcional  
- `12_USE_CASES.md` – casos de utilização principais  
- `13_NFR.md` – requisitos não funcionais  

---

## 2. Princípios que **NÃO podem ser violados**

Ao propor alterações ou gerar novo código, o Codex deve **respeitar SEMPRE**:

1. **Imutabilidade de campos vindos de Excel**  
   - Todos os campos indicados em `06_BUSINESS_RULES.md` como “de origem Excel” são **read-only** na aplicação.  
   - NÃO criar UI, API ou funções que alterem estes campos diretamente.  
   - A única forma de atualizar esses campos é através de **nova importação Excel**.

2. **Tipologia de importação Excel baseada em 3 menus, não no nome do ficheiro**  
   - O tipo de importação é determinado por:
     - “Importar Produtos”
     - “Importar Fichas Técnicas”
     - “Importar Preços & Taxas”
   - O **nome do ficheiro Excel é irrelevante**.  
   - Os ficheiros:
     - devem ter **apenas uma folha**  
     - devem conter os **campos esperados** para esse tipo (ver `02_EXCEL_IMPORT_SPEC.md`).

3. **Modelo de dados lógico**  
   - A semântica das entidades e campos descrita em `01_DATA_MODEL.md` é a referência.  
   - Alterações estruturais (remover campos, mudar significados, etc.) **não devem ser feitas** sem atualização explícita da documentação.

4. **Comportamento funcional da Ficha Técnica**  
   - A apresentação da ficha técnica (cabeçalho, linhas, totais, alergénios, preparação) deve seguir `03_PRODUCT_TECH_SHEET_SPEC.md`.  
   - Cálculos de custo, peso e alergénios devem seguir as fórmulas e regras especificadas.

---

## 3. Como o Codex deve usar esta documentação

Sempre que for gerar, refatorar ou estender código:

1. **Ler primeiro:**
   - `00_OVERVIEW.md` – para entender o contexto geral.  
   - `01_DATA_MODEL.md` – para saber que entidades e campos existem e o que significam.  
   - `02_EXCEL_IMPORT_SPEC.md` – antes de mexer em qualquer lógica de importação Excel.  
   - `06_BUSINESS_RULES.md` – antes de alterar qualquer regra de negócio.

2. **Para UI / API de Fichas Técnicas:**
   - Usar `03_PRODUCT_TECH_SHEET_SPEC.md` para saber:
     - que campos devem aparecer no cabeçalho
     - que colunas devem existir na tabela de composição
     - que totais e cálculos devem ser exibidos.

3. **Para alergénios:**
   - Usar `05_ALLERGENS_SPEC.md`:
     - para saber de onde vem a lista base
     - como se calcula a lista final de alergénios do produto.

4. **Para validação de importação e erros:**
   - Usar `10_ERROR_CODES.md` para alinhar mensagens e categorias de erro.

5. **Para impacto funcional de mudanças:**
   - Ver `12_USE_CASES.md` (casos de utilização) e `09_DATA_FLOW.md` (fluxos)
   - Ver `13_NFR.md` para considerar requisitos não funcionais (performance, integridade, etc.).

---

## 4. Workflow recomendado para alterações (para IA/Codex)

Quando o Codex for gerar uma alteração significativa:

1. **Identificar** qual documento `.md` é relevante.
2. **Confirmar** se a alteração é compatível com:
   - modelo de dados
   - regras de negócio
   - fluxos de importação
3. **Se a alteração implica mudar regras de negócio ou estrutura de dados**, deve:
   - assumir que **a documentação deve ser atualizada primeiro** (ou em paralelo)  
   - propor também a alteração correspondente em `docs/` (ex.: mudar `01_DATA_MODEL.md` e `06_BUSINESS_RULES.md`), para manter a consistência.

4. **Nunca assumir comportamento baseado apenas no código existente** se este divergir dos `.md`.  
   - Em caso de conflito entre código e docs, os `.md` são a referência preferencial, salvo indicação explícita em contrário do utilizador humano.

---

## 5. Coisas que o Codex NÃO deve fazer

- Não remover campos que estejam documentados em `01_DATA_MODEL.md` sem atualização expressa da documentação.  
- Não tornar editáveis, em UI ou API, campos marcados como imutáveis em `06_BUSINESS_RULES.md`.  
- Não reintroduzir lógica antiga dependente do **nome do ficheiro Excel** (já não é assim que o sistema funciona).  
- Não alterar regras de cálculo de custos, pesos ou alergénios sem alinhar com os documentos `03_PRODUCT_TECH_SHEET_SPEC.md`, `04_INGREDIENTS_SPEC.md` e `05_ALLERGENS_SPEC.md`.  

---

## 6. Nota para futuros mantenedores humanos

Se fizeres alterações funcionais à aplicação (novos campos, novas regras, novos fluxos):

1. Atualiza **primeiro** (ou imediatamente depois) os `.md` relevantes em `docs/`.  
2. Só depois ajusta o código.  
3. Indica no commit message algo como:
   - “Atualizar docs + implementação para nova regra X”.

Assim, qualquer IA (Codex, Copilot, etc.) terá sempre uma **fonte de verdade fiável** para se guiar, e o comportamento da aplicação será previsível e controlado.
