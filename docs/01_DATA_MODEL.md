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
