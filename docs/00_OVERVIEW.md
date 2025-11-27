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
