# 06 – Regras de Negócio

## 1. Imutabilidade de campos importados
Princípio: qualquer campo preenchido a partir de Excel é **oficial** e
não pode ser editado manualmente na aplicação (UI ou API).

### 1.1. Produto
Todos os campos listados em 01_DATA_MODEL para `Produtos` são de origem Excel
e devem ser tratados como read-only na aplicação.

### 1.2. Fichas Técnicas
Todos os campos de `FichasTecnicas` (ProdutoCodigo, ComponenteCodigo, Qtd, etc.)
são de origem Excel e read-only.

### 1.3. Preços & Taxas
Todos os campos de `PrecosTaxas` são de origem Excel e read-only.

Qualquer alteração válida deve vir de uma nova importação Excel.

### 1.4. Tabelas imutáveis (SoT)
`Produtos`, `FichasTecnicas` e `PrecosTaxas` atuam como fonte de verdade operacional e são consideradas tabelas **imutáveis** na aplicação. Só podem ser atualizadas através dos fluxos de importação Excel; a UI e a API não devem expor mecanismos de edição direta para estes registos.

## 2. Cálculos principais

### 2.1. Linha de ficha
Quando Qtd e Ppu existem:
- PrecoLinha = Qtd × Ppu

Quando Preco vem do Excel, é o valor de referência.

### 2.2. Totais
- CustoTotalFicha = soma(PrecoLinha)
- CustoPorUnidade / CustoPorDose conforme modelo de negócio (ver 03_PRODUCT_TECH_SHEET_SPEC.md).

## 3. Importação
- Regra de upsert por chave lógica
- Dados incoerentes (ex.: referência a produto inexistente) devem ser reportados
com códigos de erro (ver 10_ERROR_CODES.md).
