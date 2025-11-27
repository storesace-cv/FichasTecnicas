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
