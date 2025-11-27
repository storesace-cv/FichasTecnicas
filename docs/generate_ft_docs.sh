#!/usr/bin/env bash
mkdir -p docs

cat << 'E00' > docs/00_OVERVIEW.md
# 00 – Visão Geral do Sistema de Fichas Técnicas

## Objetivo
O sistema de Fichas Técnicas gere:
- Produtos (artigos)
- Composição (linhas de ficha técnica)
- Preços & taxas por loja
- Alergénios
- Instruções de preparação

Esta documentação é a **fonte de verdade funcional e de dados**, independente da tecnologia usada (Qt, Web, Python, etc.), pensada para que qualquer implementação futura (incluindo o Codex) respeite o comportamento atual.

## Escopo
Inclui:
- Modelo de dados lógico
- Regras de importação Excel
- Estrutura da ficha técnica
- Regras de negócio (incluindo imutabilidade de campos importados)
- Fluxos de dados
- Glossário, casos de uso e NFR

Não inclui:
- Código ou APIs concretas
- Frameworks específicas
E00

cat << 'E01' > docs/01_DATA_MODEL.md
# 01 – Modelo de Dados Lógico

## 1. Produto (`Produtos`)
Representa um artigo.

Campos principais (todos de origem Excel e imutáveis na app):
- Codigo (chave lógica do produto)
- Produto
- NomeProdVenda
- Familia, SubFamilia
- InformacaoAdicional
- AfetaStk, Menu
- CodBarras
- TipoMercad, TipoVenda, TipoProducao, TipoGener
- UnStockVMPG, UnVendaVMV, UnInvVMMMPG, UnProduFtPV
- CodAuxiliar, CodAuxiliar2
- PCU, PCM
- Descontinuado, DispLojas
- TipoArtigo (ref. tabela de tipos)
- Validade (ref. tabela de validade)
- Temperatura (ref. tabela de temperaturas)
- Ativo

## 2. Linha de Ficha Técnica (`FichasTecnicas`)
Composição de um produto.

Campos principais:
- FamiliaSubfamilia (auxiliar)
- ProdutoCodigo, ProdutoNome
- ComponenteCodigo, ComponenteNome
- Qtd, Unidade
- Ppu (preço por unidade)
- Preco (custo da linha)
- Peso
- Ordem

Relação: 1 Produto → N linhas de ficha técnica.

## 3. Preços & Taxas (`PrecosTaxas`)
Preços por produto/loja.

Campos principais:
- Codigo (produto)
- Loja
- Preco1..Preco5
- Iva1, Iva2
- IsencaoIva
- NomeProdVenda
- Familia, SubFamilia
- Ativo

## 4. Alergénios (`Alergenios`)
Lista de alergénios (canónica):
- Id
- Nome (PT), NomeIngles
- Descricao, Exemplos, Notas

## 5. Preparação (`ProdutoPreparacao`)
- ProdutoCodigo
- Html (texto rico/HTML com instruções)
E01

cat << 'E02' > docs/02_EXCEL_IMPORT_SPEC.md
# 02 – Especificação da Importação Excel

## 1. Tipos de importação (3 menus)
A app tem 3 opções de menu:
1. Importar Produtos
2. Importar Fichas Técnicas
3. Importar Preços & Taxas

### Regra chave (atual):
- O **nome do ficheiro Excel NÃO interessa**.
- O tipo de importação é determinado **exclusivamente** pela opção de menu escolhida.
- Cada ficheiro:
  - Deve ter **apenas uma folha**.
  - Essa folha deve conter os **campos esperados** para esse tipo.

## 2. Regras comuns
- Ficheiro com 0 folhas → erro.
- Ficheiro com >1 folha → erro.
- Cabeçalhos são normalizados; desconhecidos são ignorados.
- Linhas com campo chave vazio (Codigo, ProdutoCodigo, etc.) são ignoradas.
- Conversão de tipos (números, booleanos) é feita de forma robusta.
- Regra de upsert: se já existe, atualiza; se não existe, cria.
- Cada importação é registada (tipo, data/hora, ficheiro, nº linhas, erros).

## 3. Ficheiro de Produtos
Mapeia para `Produtos` (ver 01_DATA_MODEL).

Campos essenciais:
- Codigo (obrigatório)
- Produto ou NomeProdVenda (obrigatório)
+ restantes campos descritos em Produto.

## 4. Ficheiro de Fichas Técnicas
Mapeia para `FichasTecnicas`.

Campos principais:
- ProdutoCodigo (obrigatório)
- ComponenteCodigo (obrigatório)
- Qtd (obrigatório)
- Unidade (obrigatório)
- Ppu, Preco, Peso, Ordem (opcionais mas recomendados)

Cada grupo de linhas com o mesmo ProdutoCodigo = composição dessa ficha técnica.

## 5. Ficheiro de Preços & Taxas
Mapeia para `PrecosTaxas`.

Campos chave:
- Codigo (produto)
- Loja

Campos de valor:
- Preco1..Preco5
- Iva1, Iva2
- IsencaoIva
- NomeProdVenda, Familia, SubFamilia, Ativo

## 6. Erros
Ver 10_ERROR_CODES.md para códigos e mensagens sugeridas.
E02

cat << 'E03' > docs/03_PRODUCT_TECH_SHEET_SPEC.md
# 03 – Estrutura da Ficha Técnica do Artigo

## 1. Componentes da Ficha Técnica
1. Cabeçalho do produto  
2. Tabela de composição  
3. Totais e cálculos  
4. Alergénios  
5. Instruções de preparação (quando existirem)

## 2. Cabeçalho do produto
Campos sugeridos:
- Codigo
- Produto / NomeProdVenda
- Familia / SubFamilia
- UnProduFtPV (unidade base)
- Validade (texto a partir da tabela de referência)
- Temperatura (texto a partir da tabela de referência)
- Indicadores: Ativo, Descontinuado, AfetaStk, Menu
- InformacaoAdicional

Opcional: preços e IVA a partir de `PrecosTaxas`.

## 3. Tabela de composição
Por cada linha de `FichasTecnicas` do produto:
- ComponenteCodigo
- ComponenteNome
- Qtd
- Unidade
- Ppu
- Preco
- Peso
- Ordem (para ordenar visualmente)

## 4. Totais e cálculos
- CustoTotalFicha = soma(Preco das linhas)
- PesoTotal = soma(Peso das linhas)
- CustoPorUnidade = CustoTotalFicha / Unidade base de produção  
- CustoPorDose = CustoTotalFicha / NumeroDeDoses (se existir campo de doses)

## 5. Alergénios
Apresentar a lista final de alergénios do produto:

AlergeniosDoProduto = união de todos os alergénios dos componentes  
(ver 05_ALLERGENS_SPEC.md).

## 6. Preparação
Se existir entrada em `ProdutoPreparacao`:
- Mostrar o campo Html como bloco de instruções.
E03

cat << 'E04' > docs/04_INGREDIENTS_SPEC.md
# 04 – Especificação de Componentes / Ingredientes

## 1. Definição
Componentes/ingredientes são as linhas da ficha técnica:

- FichasTecnicas.ComponenteCodigo
- FichasTecnicas.ComponenteNome

Podem, ou não, corresponder a registos de Produtos.

## 2. Campos relevantes por linha
- ComponenteCodigo
- ComponenteNome
- Qtd
- Unidade
- Ppu
- Preco
- Peso

## 3. Regras de custo
Se Qtd e Ppu existirem:
- Preco ≈ Qtd × Ppu

Se Preco vier diretamente do Excel, pode ser considerado valor oficial,
desde que coerente com Qtd e Ppu.

## 4. Imutabilidade
Linhas de ficha técnica vindas do Excel são **read-only** na aplicação.
Alterações à composição fazem-se alterando o Excel e reimportando
(ver 06_BUSINESS_RULES.md).
E04

cat << 'E05' > docs/05_ALLERGENS_SPEC.md
# 05 – Especificação de Alergénios

## 1. Tabela de Alergénios (`Alergenios`)
Deve conter, no mínimo, os alergénios obrigatórios na UE, por ex.:
Glúten, Crustáceos, Ovos, Peixe, Amendoins, Soja, Leite, Frutos de casca rija,
Aipo, Mostarda, Sésamo, Sulfitos, Tremoço, Moluscos.

Campos:
- Id
- Nome
- NomeIngles
- Descricao, Exemplos, Notas

## 2. Associação a componentes
Cada componente pode ter 0..N alergénios associados
(por tabela relacional ou equivalente).

## 3. Propagação para produtos
AlergeniosDoProduto = união dos alergénios de todos os componentes
(diretos e, se existirem, sub-produtos compostos).

O resultado final é uma lista única por produto.
E05

cat << 'E06' > docs/06_BUSINESS_RULES.md
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
E06

cat << 'E07' > docs/07_LOGS_AUDIT.md
# 07 – Logs e Auditoria

## 1. Histórico de importações
Cada importação (Produtos, Fichas Técnicas, Preços & Taxas) deve registar:
- ID
- Tipo
- Data/hora
- Utilizador (se aplicável)
- Ficheiro
- Nº linhas lidas
- Nº linhas importadas
- Nº erros
- Resumo de erros

## 2. Erros
Erros detalhados podem ser registados numa tabela específica,
associados ao ID da importação, com:
- Linha
- Código de erro
- Mensagem

Ver 10_ERROR_CODES.md.

## 3. Auditoria futura
Se forem criados campos editáveis (não Excel), recomenda-se log de:
- Entidade, ID, utilizador, data/hora, valor antes/depois.
E07

cat << 'E08' > docs/08_ROLES_PERMISSIONS.md
# 08 – Perfis e Permissões

## Perfis sugeridos
- Admin
- Editor
- Viewer

## Matriz de permissões (exemplo)

| Operação                           | Admin | Editor | Viewer |
|------------------------------------|:-----:|:------:|:------:|
| Ver produtos e fichas técnicas     |  ✔   |   ✔   |   ✔   |
| Ver preços & taxas                 |  ✔   |   ✔   |   ✔   |
| Importar Produtos                  |  ✔   |   ✔   |   ✖   |
| Importar Fichas Técnicas           |  ✔   |   ✔   |   ✖   |
| Importar Preços & Taxas            |  ✔   |   ✔   |   ✖   |
| Ver logs e histórico               |  ✔   |   ✔   |   ✖   |
| Gerir tabelas de referência        |  ✔   |   ✖   |   ✖   |

Implementações concretas podem ajustar esta matriz.
E08

cat << 'E09' > docs/09_DATA_FLOW.md
# 09 – Fluxos de Dados

## 1. Produtos
1. Menu: Importar Produtos.
2. Utilizador escolhe Excel (1 folha).
3. Sistema valida cabeçalhos e tipos.
4. Para cada linha com Codigo:
   - se existe Produto: atualiza campos com valores do Excel
   - se não existe: cria Produto
5. Registo em histórico.

## 2. Fichas Técnicas
1. Menu: Importar Fichas Técnicas.
2. Excel com linhas de composição.
3. Validação de ProdutoCodigo/ComponenteCodigo.
4. Para cada ProdutoCodigo:
   - substitui/atualiza composição existente
5. UI passa a mostrar nova ficha.

## 3. Preços & Taxas
1. Menu: Importar Preços & Taxas.
2. Excel com (Codigo, Loja, Precos, IVA, etc.).
3. Upsert em `PrecosTaxas`.
4. UI mostra novos PVP/IVA.

## 4. Apresentação
- Ecrãs de produtos: `Produtos`
- Fichas técnicas: `Produtos` + `FichasTecnicas` + `Alergenios` + `ProdutoPreparacao`
- Preços: `Produtos` + `PrecosTaxas`
E09

cat << 'E10' > docs/10_ERROR_CODES.md
# 10 – Catálogo de Erros de Importação

## Erros de ficheiro
- E001 – Ficheiro sem folhas
- E002 – Ficheiro com mais de uma folha
- E003 – Ficheiro não é Excel válido

## Erros de cabeçalho
- E010 – Cabeçalho obrigatório em falta (ex.: Codigo)
- E011 – Conjunto de cabeçalhos não reconhecido

## Erros de dados
- E020 – Linha sem código principal
- E021 – Tipo de dado inválido
- E022 – Produto referenciado não existe
- E023 – Loja referenciada não existe
- E024 – Valor fora de intervalo aceitável (ex.: IVA negativo)

## Registo
Cada erro deve guardar:
- Código
- Linha
- Texto descritivo para o utilizador.
E10

cat << 'E11' > docs/11_GLOSSARY.md
# 11 – Glossário

- Produto – Artigo identificado por um código único.
- Ficha Técnica – Documento com composição, custos, alergénios e preparação.
- Componente / Ingrediente – Item que compõe um produto.
- PVP – Preço de Venda ao Público.
- Alergénio – Substância que pode causar alergias.
- Importação Excel – Carregamento de dados a partir de ficheiros Excel.
- Campo imutável – Campo que só pode ser alterado via Excel.
- Loja – Unidade de venda.
E11

cat << 'E12' > docs/12_USE_CASES.md
# 12 – Casos de Utilização

## UC01 – Importar Produtos
1. Utilizador escolhe “Importar Produtos”.
2. Seleciona ficheiro Excel.
3. Sistema valida estrutura e cabeçalhos.
4. Sistema importa e apresenta resumo (sucessos/erros).

## UC02 – Importar Fichas Técnicas
1. Menu “Importar Fichas Técnicas”.
2. Seleciona Excel de composição.
3. Sistema valida e atualiza fichas técnicas.
4. Utilizador consulta ficha atualizada.

## UC03 – Importar Preços & Taxas
1. Menu “Importar Preços & Taxas”.
2. Seleciona Excel com preços por loja.
3. Sistema valida e atualiza `PrecosTaxas`.

## UC04 – Consultar Ficha Técnica
1. Utilizador procura um produto.
2. Sistema mostra cabeçalho, composição, totais, alergénios e preparação.

## UC05 – Consultar Preços por Loja
1. Utilizador seleciona produto e loja.
2. Sistema apresenta PVPs e IVA dessa loja.
E12

cat << 'E13' > docs/13_NFR.md
# 13 – Requisitos Não Funcionais (NFR)

## Integridade de dados
- Importações não devem deixar dados inconsistentes.
- Em erros graves, a importação deve ser marcada como falhada.

## Desempenho
- Importações de dimensão normal devem ser razoavelmente rápidas.
- Consulta de uma ficha técnica deve ser praticamente imediata em uso normal.

## Usabilidade
- Mensagens de erro claras e úteis.
- Campos read-only (Excel) claramente distintos de eventuais campos editáveis.

## Segurança e auditoria
- Idealmente registar quem fez cada importação.
- Logs não devem expor informação sensível desnecessária.

## Evolução
- Qualquer alteração ao modelo ou regras deve ser refletida primeiro nesta documentação.
E13

