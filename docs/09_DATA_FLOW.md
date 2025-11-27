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
