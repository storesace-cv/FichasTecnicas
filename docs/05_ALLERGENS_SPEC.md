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
