# PREPARATION_SPEC.md  
## Especificação do Módulo de Preparação da Ficha Técnica

O módulo de **Preparação** descreve de forma estruturada o modo de preparo de um prato ou bebida, incluindo tempos, equipamentos, conservação e passos. Este módulo é exibido na Ficha Técnica logo após o bloco "Ficha Técnica" (ingredientes, custos e preços).

---

# 1. Estrutura Geral do Módulo

O módulo é composto por:

1. **Cabeçalho de Preparação** — dados gerais da receita/preparação.  
2. **Lista de Passos** — passos ordenados (step-by-step) da preparação.  
3. **Tabelas auxiliares** — Equipamentos e Dificuldades.

---

# 2. Tabela: Preparacoes

Representa a preparação do prato/bebida associada a um Produto.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | PK | Sim | Identificador |
| ProdutoCodigo | FK → Produtos.Codigo | Sim | Produto ao qual a preparação pertence |
| ResumoPreparacao | Texto | Sim | Breve descrição da preparação |
| PesoTotalGramas | INT | Sim | Peso total produzido em gramas |
| PorcoesPorReceita | INT | Sim | nº total de porções/doses produzidas |
| TempoPreparoMinutos | INT | Sim | Tempo de preparação ativa (minutos) |
| TempoCoccaoMinutos | INT | Sim | Tempo de cozedura / forno / repouso (minutos) |
| TempoTotalMinutos | INT (calculado) | Não | Preparo + cocção |
| ApresentacaoFinal | Texto | Não | Instrução de empratamento/apresentação |
| EquipamentosPrincipais | Texto | Não | Equipamentos relevantes |
| TemperaturaCodigo | FK → Temperaturas.Codigo | Não | Temperatura de conservação |
| ValidadeCodigo | FK → Validades.Codigo | Não | Validade após preparo |
| ReaquecimentoDescricao | Texto | Não | Instruções de reaquecimento |
| ReaquecimentoTemperaturaCodigo | FK → Temperaturas.Codigo | Não | Temperatura de reaquecimento |
| ReaquecimentoTempoMinutos | INT | Não | Tempo de reaquecimento |
| DificuldadeCodigo | FK → Dificuldades.Codigo | Sim | BAIXA, MEDIA ou ALTA |
| Observacoes | Texto | Não | Notas adicionais |
| CriadoPor | Texto | Sim | Auditoria |
| AtualizadoPor | Texto | Sim | Auditoria |
| DataCriacao | DateTime | Sim | Auditoria |
| DataAtualizacao | DateTime | Sim | Auditoria |

---

# 3. Tabela: PreparacaoPassos

Lista ordenada de instruções da preparação.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | PK | Sim | Identificador |
| PreparacaoId | FK → Preparacoes.Id | Sim | Preparação à qual pertence |
| OrdemPasso | INT | Sim | Ordem (1,2,3...) |
| DescricaoPasso | Texto | Sim | Instrução clara do passo |
| TempoPassoMinutos | INT | Não | Tempo aproximado daquele passo |
| TemperaturaC | DECIMAL | Não | Temperatura necessária |
| EquipamentoCodigo | FK → Equipamentos.Codigo | Não | Equipamento usado |
| EstacaoTrabalho | Texto | Não | Ex.: CozinhaQuente, Bar, Pastelaria |
| CriticoHACCP | BOOLEAN | Não | Se é ponto crítico |
| NotasCriticas | Texto | Não | Notas de HACCP |
| ImagemUrl | Texto | Não | Foto opcional do passo |

---

# 4. Tabela: Equipamentos

Tabela de referência.

| Campo | Tipo | Descrição |
|--------|------|------------|
| Codigo | PK | Identificador (ex.: FORNO, GRELHA, SHAKER) |
| Descricao | Texto | Nome legível |
| Tipo | Texto | Ex.: CozinhaQuente, CozinhaFria, Bar |

### Lista inicial recomendada:
- FORNO  
- GRELHA  
- FOGAO  
- PANELA  
- FRITADEIRA  
- SALAMANDRA  
- MICROONDAS  
- ROBOTCOZINHA  
- LIQUIDIFICADOR  
- BATEDEIRA  
- SHAKER  
- COPOGRADUADO  
- TABUA  
- FACA  
- TERMOMETRO  
- FRIGORIFICO  
- CONGELADOR  

---

# 5. Tabela: Dificuldades

Tabela simples e fixa.

| Codigo (PK) | Descricao | OrdemExibicao |
|-------------|-----------|---------------|
| BAIXA | Baixa | 1 |
| MEDIA | Média | 2 |
| ALTA | Alta | 3 |

---

# 6. Regras Obrigatórias de Validação

1. **PesoTotalGramas** → obrigatório, INT, sempre em gramas.  
2. **PorcoesPorReceita** → obrigatório, INT, nº de doses.  
3. **TempoPreparoMinutos** → obrigatório, INT, minutos.  
4. **TempoCoccaoMinutos** → obrigatório, INT, minutos.  
5. **TempoTotalMinutos** → calculado automaticamente = preparo + cocção.  
6. **PreparacaoPassos.OrdemPasso** deve ser sequencial.  
7. **Cada Produto só pode ter 0 ou 1 Preparação.**

---

# 7. Posição no UI

O módulo **Preparação** deve aparecer **logo a seguir** ao bloco “Ficha Técnica” (ingredientes e custos).  
Estrutura do UI:

1. Ficha Técnica (ingredientes, custos, preços)  
2. **Preparação (este módulo)**  
   - Cabeçalho da preparação  
   - Lista step-by-step dos passos  

---

# 8. Resumo

O módulo de Preparação adiciona à Ficha Técnica:

- Informação operacional  
- Padronização de processos  
- Controle de tempo e equipamentos  
- Gestão de conservação e validade  
- Instruções de HACCP  
- Passos estruturados

Este documento é a referência oficial para implementação no backend, frontend e modelo de dados.
