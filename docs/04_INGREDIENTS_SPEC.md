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
