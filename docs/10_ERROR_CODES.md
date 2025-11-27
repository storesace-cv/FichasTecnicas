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
