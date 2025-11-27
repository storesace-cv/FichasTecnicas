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
