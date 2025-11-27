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
