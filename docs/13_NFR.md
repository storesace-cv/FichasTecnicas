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
