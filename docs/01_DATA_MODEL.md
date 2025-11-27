# 01 – Modelo de Dados Lógico

## Convenção de nomes (base de dados)

- Todas as colunas das tabelas utilizam **CamelCase**, por exemplo:
  - `ProdutoCodigo`, `ComponenteCodigo`, `NomeProdVenda`, `InformacaoAdicional`
  - `NomeIngles`, `DataCriacao`, etc.
- Tabelas de referência e entidades também seguem CamelCase:
  - `Produtos`, `FichasTecnicas`, `PrecosTaxas`, `Alergenios`, `ProdutoPreparacao`, etc.
- Ficheiros JSON podem usar **snake_case** (ex.: `nome_ingles`), devendo ser mapeados para os campos CamelCase equivalentes na base de dados.

---

## 1. Entidade Produto (`Produtos`)

Representa um artigo.

Campos principais (todos de origem Excel e imutáveis na aplicação):

- `Codigo`              – identificador único do produto (chave lógica)
- `Produto`             – nome do produto
- `NomeProdVenda`       – nome comercial de venda
- `Familia`             – família do produto
- `SubFamilia`          – subfamília do produto
- `InformacaoAdicional` – informação adicional interna
- `AfetaStk`            – indica se o produto afeta stock
- `Menu`                – indica se é/pertence a menu
- `CodBarras`           – código de barras
- `TipoMercad`          – tipo de mercado
- `TipoVenda`           – tipo de venda
- `TipoProducao`        – tipo de produção
- `TipoGener`           – tipo genérico
- `UnStockVMPG`         – unidade de stock
- `UnVendaVMV`          – unidade de venda
- `UnInvVMMMPG`         – unidade de inventário
- `UnProduFtPV`         – unidade utilizada na ficha técnica (unidade base de produção)
- `CodAuxiliar`         – código auxiliar 1
- `CodAuxiliar2`        – código auxiliar 2
- `PCU`                 – peso/custo unitário
- `PCM`                 – peso/custo médio
- `Descontinuado`       – indica se o produto está descontinuado
- `DispLojas`           – disponibilidade por loja (texto)
- `TipoArtigo`          – referência à tabela de tipos de artigo
- `Validade`            – referência à tabela de validade
- `Temperatura`         – referência à tabela de temperaturas
- `Ativo`               – indica se o produto está ativo

---

## 2. Entidade Linha de Ficha Técnica (`FichasTecnicas`)

Representa uma linha da composição de um produto (componente/ingrediente).

Campos principais:

- `FamiliaSubfamilia` – informação auxiliar para agrupamento
- `ProdutoCodigo`     – código do produto (ref. `Produtos.Codigo`)
- `ProdutoNome`       – nome do produto
- `ComponenteCodigo`  – código do componente (produto ou artigo base)
- `ComponenteNome`    – nome do componente
- `Qtd`               – quantidade usada do componente
- `Unidade`           – unidade de medida (g, kg, ml, un, etc.)
- `Ppu`               – preço por unidade de medida
- `Preco`             – preço/custo total da linha
- `Peso`              – peso associado à linha
- `Ordem`             – ordem de apresentação da linha

Relação:  
- 1 `Produto` → N `FichasTecnicas` (linhas)  
- Cada linha referencia exatamente 1 `Produto` por `ProdutoCodigo`.

---

## 3. Entidade Preços & Taxas (`PrecosTaxas`)

Campos principais:

- `Codigo`        – código do produto (ref. `Produtos.Codigo`)
- `Loja`          – identificador de loja
- `Preco1`..`Preco5` – preços de venda (PVP1..PVP5)
- `Iva1`, `Iva2`  – taxas de IVA (%)
- `IsencaoIva`    – indicação de isenção/regime especial
- `NomeProdVenda` – nome comercial de venda para essa loja
- `Familia`       – família do produto
- `SubFamilia`    – subfamília do produto
- `Ativo`         – indicador ativo/inativo para essa loja

Relação:  
- 1 `Produto` → 0..N registos em `PrecosTaxas` (tipicamente 1 por loja).

---

## 4. Entidade Alergénios (`Alergenios`)

Campos:

- `Id`         – identificador único do alergénio (PK)
- `Nome`       – nome em português
- `NomeIngles` – nome em inglês
- `Descricao`  – descrição / notas adicionais
- `Exemplos`   – exemplos de ocorrência (pode ser texto ou JSON)
- `Notas`      – observações adicionais

Os dados desta tabela podem ser inicializados a partir de `docs/resources/allergens.json`,
onde as chaves do JSON usam snake_case (por exemplo `nome_ingles`) e são
mapeadas para os campos CamelCase (`NomeIngles`) na base de dados.

---

## 5. Entidade Preparação (`ProdutoPreparacao`)

Campos:

- `ProdutoCodigo` – referência a `Produtos.Codigo`
- `Html`          – instruções de preparação em HTML ou rich text

---

## 6. Tabelas auxiliares

Exemplos de tabelas de referência (também em CamelCase):

- `TiposArtigos`   – (`Codigo`, `Descricao`, …)
- `Validades`      – (`Codigo`, `Descricao`, `Unidade`, `Valor`, …)
- `Temperaturas`   – (`Codigo`, `Descricao`, `Intervalo`, …)

Os nomes exatos das tabelas auxiliares podem variar na implementação,
mas os campos referenciados em `Produtos` (`TipoArtigo`, `Validade`, `Temperatura`)
devem apontar para estas tabelas de referência ou equivalentes.
