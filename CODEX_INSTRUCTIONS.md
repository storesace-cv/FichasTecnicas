# CODEX – INSTRUÇÕES OFICIAIS PARA IA (OPENAI CODEX / GITHUB COPILOT)

## 1. Fonte da Verdade
Toda a lógica funcional, regras de dados, modelos, cálculos e comportamento da aplicação
encontra-se em:
docs/
00_OVERVIEW.md
01_DATA_MODEL.md
02_EXCEL_IMPORT_SPEC.md
03_PRODUCT_TECH_SHEET_SPEC.md
04_INGREDIENTS_SPEC.md
05_ALLERGENS_SPEC.md
06_BUSINESS_RULES.md
07_LOGS_AUDIT.md
08_ROLES_PERMISSIONS.md
09_DATA_FLOW.md
10_ERROR_CODES.md
11_GLOSSARY.md
12_USE_CASES.md
13_NFR.md
resources/
allergens.json
O Codex deve **ler sempre estes ficheiros antes de gerar código**.

---

## 2. Convenções obrigatórias
### **2.1. Campos e tabelas em CamelCase**
- Todos os campos da BD usam CamelCase.
- Todas as tabelas usam CamelCase.
- JSON pode usar snake_case, mas deve ser mapeado para CamelCase.

---

## 3. Regras que o Codex NUNCA pode violar

### **3.1. Imutabilidade de dados importados via Excel**
Os campos importados via Excel (ver `06_BUSINESS_RULES.md`) são **read-only**.

O Codex:
- NÃO pode criar UI para editar esses campos.
- NÃO pode criar endpoints que alterem esses campos.
- Só podem ser alterados através de nova importação Excel.

### **3.2. Tipos de importação**
O **nome do ficheiro Excel é irrelevante**.  
O tipo de importação é determinado pelos 3 menus:

- Importar Produtos  
- Importar Fichas Técnicas  
- Importar Preços & Taxas  

### **3.3. Estrutura da Ficha Técnica**
O Codex deve implementar UI/API de acordo com:

- `03_PRODUCT_TECH_SHEET_SPEC.md`
- `04_INGREDIENTS_SPEC.md`
- `05_ALLERGENS_SPEC.md` (CamelCase + DB + seed json)

### **3.4. Alergénios**
- A tabela `Alergenios` é a fonte runtime.
- `docs/resources/allergens.json` serve para seeds.
- Nunca hardcodar listas.

---

## 4. Como o Codex deve trabalhar

### PASSO 1 — Antes de gerar código:
O Codex deve:
- Ler o ficheiro `.md` relevante  
- Confirmar a regra e a estrutura de dados  
- Só então transformar em código  

### PASSO 2 — Se identificar conflito entre código existente e docs:
- O que está nos **docs** prevalece  
- Exceto se o utilizador humano disser o contrário

### PASSO 3 — Se criar nova funcionalidade:
- Verificar primeiro:
  - 01_DATA_MODEL.md  
  - 06_BUSINESS_RULES.md  
  - 12_USE_CASES.md  
- Criar código consistente com essas regras

### PASSO 4 — Se alterar regras de negócio:
- O Codex deve sugerir alteração correspondente nos `.md`  
- Código **nunca** deve divergir da documentação

---

## 5. Mensagem permanente que o Codex deve seguir
> “A documentação em docs/ é a autoridade máxima.  
> Antes de gerar ou alterar qualquer função, modelo, controller ou UI,  
> lê os ficheiros relevantes e implementa exatamente o que lá está descrito.”

---

## 6. Objetivo final
Garantir que:
- A aplicação evolui corretamente  
- Nunca se destrói trabalho já feito  
- IA trabalha sempre em conformidade com a lógica original  
