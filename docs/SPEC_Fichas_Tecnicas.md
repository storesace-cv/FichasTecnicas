# Fichas Técnicas – Fonte da Verdade Funcional e de Dados
Versão: 1.0  
Data: 2025-11-27
Responsável: Equipa Fichas Técnicas

> Este documento descreve **o comportamento funcional e os dados** da aplicação de Fichas Técnicas.
> É independente de linguagem de programação, frameworks ou estrutura de código.
> O objetivo é servir de **fonte de verdade** para qualquer implementação futura
> (por exemplo, outra linguagem, outro repositório ou outra AI como o Codex),
> garantindo que **o comportamento existente é respeitado**.

---

## 1. Objetivo e âmbito

A aplicação de Fichas Técnicas tem como objetivo gerir, de forma consistente, os dados de:

- **Produtos** (artigos)
- **Componentes/ingredientes das fichas técnicas**
- **Preços de venda ao público e taxas (IVA, isenções)**
- **Alergénios**
- **Instruções de preparação**

A origem principal dos dados é **ficheiros Excel** fornecidos por sistemas externos (ERP, ferramentas internas, etc.).  
A aplicação:

1. **Importa** os dados a partir de três tipos de ficheiros Excel.
2. **Armazena-os** numa base de dados relacional.
3. **Apresenta-os** numa interface (GUI ou Web).
4. Permite **editar apenas alguns campos internos**, mantendo outros campos
   **bloqueados** por serem dados oficiais vindos de Excel.

Este documento foca-se em:
- Modelo de dados lógico (tabelas, campos, relações).
- Especificação dos ficheiros Excel (campos, regras, validações).
- Estrutura e campos da Ficha Técnica do artigo.
- Regras de negócio e cálculos.
- Regras de imutabilidade dos dados importados.
- Regras de apresentação dos dados.

Não aborda:
- Arquitetura técnica do código.
- Frameworks específicas.
- Detalhes de UI tecnológica (Qt, React, etc.).

---

## 2. Visão geral funcional

### 2.1. Fluxo de informação

1. O utilizador obtém ficheiros Excel a partir do sistema de origem.
2. Na aplicação de Fichas Técnicas, escolhe uma das opções de importação:
   - Importar **Produtos**.
   - Importar **Fichas Técnicas**.
   - Importar **Preços & Taxas**.
3. Em seguida, escolhe o ficheiro Excel correspondente (ver regras mais abaixo).
4. A aplicação:
   - Valida estrutura e cabeçalhos.
   - Converte tipos de dados.
   - Atualiza/insere registos na base de dados.
5. Após a importação, a aplicação permite:
   - Consultar fichas técnicas por produto.
   - Visualizar composição, custos e alergénios.
   - Consultar e cruzar preços de venda e taxas.

### 2.2. Tipos principais de dados

- **Produto** – representação de um artigo (mercadoria ou produto final).
- **Linha de Ficha Técnica** – ligação entre um produto e um componente
  (ingrediente, subproduto, etc.), com quantidade, unidade e custos.
- **Preço & Taxas** – PVPs por loja e respetivas taxas de IVA.
- **Alergénios** – tabela de referência com a lista de alergénios.
- **Preparação** – instruções textuais (HTML ou texto rico) para confecção.

---

## 3. Modelo de dados lógico

> Nota: os nomes de campos seguem a nomenclatura dos ficheiros originais
> (`DATA.md`, `SCHEMA.md`) e da base de dados atual.  
> Uma implementação noutro sistema pode mapear estes nomes para outros,
> mas **a semântica deve ser preservada**.

### 3.1. Entidade Produto (`Produtos`)

Representa um artigo. Campos relevantes:

| Campo           | Tipo lógico | Descrição                                                         |
|----------------|------------|-------------------------------------------------------------------|
| Codigo         | string     | Identificador único do produto (chave primária lógica).           |
| Produto        | string     | Nome do produto para identificação interna.                       |
| NomeProdVenda  | string     | Nome comercial para venda (quando diferente de `Produto`).        |
| Familia        | string     | Família do produto.                                               |
| SubFamilia     | string     | Subfamília do produto.                                            |
| InformacaoAdicional | string | Informação adicional sobre o produto.                             |
| AfetaStk       | boolean    | Indica se o produto afeta stock.                                  |
| Menu           | boolean/flag | Indica se o produto é ou pertence a um menu.                    |
| CodBarras      | string     | Código de barras.                                                 |
| TipoMercad     | string     | Tipo de mercado.                                                  |
| TipoVenda      | string     | Tipo de venda.                                                    |
| TipoProducao   | string     | Tipo de produção.                                                 |
| TipoGener      | string     | Tipo genérico.                                                    |
| UnStockVMPG    | string     | Unidade de stock.                                                 |
| UnVendaVMV     | string     | Unidade de venda.                                                 |
| UnInvVMMMPG    | string     | Unidade de inventário.                                            |
| UnProduFtPV    | string     | Unidade utilizada na ficha técnica (unidade base de produção).    |
| CodAuxiliar    | string     | Código auxiliar 1.                                                 |
| CodAuxiliar2   | string     | Código auxiliar 2.                                                 |
| PCU            | numérico   | Peso/custo unitário (conforme origem).                            |
| PCM            | numérico   | Peso/custo médio.                                                 |
| Descontinuado  | boolean    | Indica se o produto está descontinuado.                           |
| DispLojas      | string     | Informação de disponibilidade por loja.                           |
| TipoArtigo     | referência | Chave que referencia a tabela `TiposArtigos`.                     |
| Validade       | referência | Chave que referencia a tabela `Validade`.                         |
| Temperatura    | referência | Chave que referencia a tabela `Temperaturas`.                     |
| Ativo          | boolean    | Indicador de que o produto está ativo.                            |

**Observações:**

- Nem todos estes campos precisam de ser apresentados na UI final, mas
  **não podem ser eliminados do modelo lógico**, pois podem ser necessários
  para integrações futuras.
- Os campos que vêm dos Excel de origem constituem dados oficiais e são
  tratados como **read-only** na aplicação (ver secção 6).

---

### 3.2. Entidade Linha de Ficha Técnica (`FichasTecnicas`)

Representa uma linha de composição de um produto (ingrediente, subproduto,
componente).

| Campo            | Tipo lógico | Descrição                                                           |
|-----------------|------------|---------------------------------------------------------------------|
| FamiliaSubfamilia | string   | Família > Subfamília (campo auxiliar/derivado para agrupamento).    |
| ProdutoCodigo   | string     | Código do produto (ref. `Produtos.Codigo`).                         |
| ProdutoNome     | string     | Nome do produto.                                                    |
| ComponenteCodigo| string     | Código do componente. Pode referenciar outro produto ou artigo base.|
| ComponenteNome  | string     | Nome do componente.                                                 |
| Qtd             | numérico   | Quantidade usada do componente.                                     |
| Unidade         | string     | Unidade de medida da quantidade (`g`, `kg`, `ml`, `un`, etc.).      |
| Ppu             | numérico   | Preço por unidade de medida (preço unitário).                       |
| Preco           | numérico   | Preço total da linha (ver cálculos).                                |
| Peso            | numérico   | Peso da linha (pode ser igual à quantidade, dependendo da unidade). |
| Ordem           | inteiro    | Ordem da linha na ficha técnica.                                    |

**Cardinalidade:**  
Um **Produto** pode ter **0..N linhas de Ficha Técnica**.  
Cada linha está associada a exatamente um produto (via `ProdutoCodigo`).

---

### 3.3. Entidade Preço & Taxas (`PrecosTaxas`)

Representa preços e taxas por produto e por loja.

| Campo          | Tipo lógico | Descrição                                          |
|----------------|------------|----------------------------------------------------|
| Codigo         | string     | Código do produto (ref. `Produtos.Codigo`).        |
| Loja           | string     | Identificador da loja (faz parte da chave).        |
| Preco1         | numérico   | PVP1 (preço de venda 1).                            |
| Preco2         | numérico   | PVP2.                                              |
| Preco3         | numérico   | PVP3.                                              |
| Preco4         | numérico   | PVP4.                                              |
| Preco5         | numérico   | PVP5.                                              |
| Iva1           | numérico   | Taxa de IVA principal (percentual).                |
| Iva2           | numérico   | Segunda taxa de IVA (quando aplicável).            |
| IsencaoIva     | string/flag| Indicação de isenção ou regime especial de IVA.    |
| NomeProdVenda  | string     | Nome do produto na venda para essa loja/contexto. |
| Familia        | string     | Família (redundante para conveniência).           |
| SubFamilia     | string     | Subfamília (redundante para conveniência).        |
| Ativo          | boolean    | Indicador de ativo para essa combinação produto/loja.|

**Cardinalidade:**  
Um **Produto** pode ter **0..N registos de PrecosTaxas**, tipicamente um por loja.

---

### 3.4. Entidade Alergénios (`Alergenios`)

Tabela de referência com alergénios alimentares.

| Campo       | Tipo lógico | Descrição                                   |
|-------------|------------|---------------------------------------------|
| Id          | inteiro    | Identificador único do alergénio.           |
| Nome        | string     | Nome do alergénio em português.             |
| NomeIngles  | string     | Nome do alergénio em inglês.                |
| Descricao   | string     | Descrição detalhada.                        |
| Exemplos    | string     | Exemplos típicos de ocorrência.             |
| Notas       | string     | Observações adicionais.                     |

**Regra:**  
A aplicação deve expor esta tabela como **lista canónica de alergénios** a utilizar
nas fichas técnicas e na comunicação ao consumidor.

---

### 3.5. Entidade Preparação (`ProdutoPreparacao`)

Guarda instruções de preparação por produto.

| Campo         | Tipo lógico | Descrição                                    |
|---------------|------------|----------------------------------------------|
| ProdutoCodigo | string     | Referência a `Produtos.Codigo`.             |
| Html          | texto      | Instruções de preparação em HTML ou rich text.|

---

### 3.6. Entidades auxiliares

- `TiposArtigos` – lista de tipos de artigo (código + descrição).
- `Validade` – tipos de validade (ex.: dias, meses, etc.).
- `Temperaturas` – faixas de temperatura de conservação/preparação.

Estas tabelas são utilizadas por `Produtos` como tabelas de referência e podem
ser apresentadas como listas dropdown na UI.

---

## 4. Especificação dos ficheiros Excel de importação

### 4.1. Visão geral da importação

Existem **três fluxos de importação Excel**, acessíveis através de **três itens de menu distintos** na aplicação:

1. **Importar Produtos**  
2. **Importar Fichas Técnicas**  
3. **Importar Preços & Taxas**  

> **Regra atual importante (sobrepõe qualquer documentação antiga):**
> - O **nome do ficheiro Excel é irrelevante** para o comportamento da importação.
> - O que determina o tipo de importação é **a opção de menu escolhida**.
> - Para cada opção, o utilizador escolhe um ficheiro arbitrário, com as seguintes
>   características obrigatórias:
>   - Deve conter **apenas uma folha** (uma única worksheet).
>   - Essa folha deve conter **os cabeçalhos e campos esperados** para o tipo
>     selecionado (Produtos, Fichas Técnicas ou Preços & Taxas).

Historicamente, a documentação mencionava nomes como:
- `Produtos_Base.xlsx`
- `FichasTecnicas_base.xlsx`
- `PreçosTaxas_base.xlsx`

Esses nomes passam a ser meramente **convencionais**. A lógica efetiva de importação
**já não depende do nome do ficheiro**, apenas do **tipo de importação escolhido**.

---

### 4.2. Regras comuns aos três tipos de ficheiro

1. **Número de folhas**
   - Cada ficheiro deve conter **exatamente uma folha**.
   - Se houver mais de uma folha, a importação deve **falhar com erro claro**.

2. **Cabeçalhos canónicos**
   - Os cabeçalhos são normalizados (remoção de acentos/pontuação, camel case, etc.).
   - Apenas cabeçalhos que correspondem a campos conhecidos (mapa canónico) são usados.
   - Cabeçalhos desconhecidos são **ignorados**.
   - Os campos canónicos aceitáveis são os definidos pelas tabelas lógicas:
     - `Produtos` para importação de produtos.
     - `FichasTecnicas` para importação de fichas técnicas.
     - `PrecosTaxas` para importação de preços & taxas.

3. **Linhas vazias**
   - Linhas sem valor no campo chave (`Codigo` ou equivalente) devem ser ignoradas.
   - Linhas com todos os campos vazios devem ser descartadas.

4. **Conversão de tipos**
   - Campos numéricos (quantidades, preços, impostos) devem ser convertidos para tipos
     numéricos estáveis (decimal/numérico), evitando erros de arredondamento excessivos.
   - Campos booleanos podem ser derivados de:
     - 0/1
     - "sim"/"não"
     - "true"/"false"

5. **Upsert**
   - A regra base é **upsert**:
     - Se o registo (ex.: `Produtos.Codigo`) já existir, é atualizado.
     - Se não existir, é criado.

6. **Registo de importações**
   - Cada importação deve ser registada numa tabela de histórico (`Uploads` ou similar),
     incluindo:
     - Data/hora.
     - Tipo de importação.
     - Nome do ficheiro original.
     - Resultado (sucesso, falha, nº de linhas importadas).

---

### 4.3. Especificação – Ficheiro de Produtos (Importar Produtos)

A folha do Excel usada na opção **Importar Produtos** deve conter colunas que
mapeiam para a tabela lógica `Produtos`.  
Os cabeçalhos principais são:

| Cabeçalho Excel (normalizado) | Campo lógico | Obrigatório | Descrição                                      |
|-------------------------------|-------------|-------------|------------------------------------------------|
| Codigo                        | Codigo      | Sim         | Código único do produto.                       |
| Produto / Nome                | Produto     | Sim         | Nome do produto.                               |
| Familia                       | Familia     | Sim         | Família do produto.                            |
| SubFamilia                    | SubFamilia  | Sim         | Subfamília do produto.                         |
| InformacaoAdicional           | InformacaoAdicional | Não | Informação adicional interna.                  |
| AfetaStk                      | AfetaStk    | Não         | Indicador se afeta stock.                      |
| Menu                          | Menu        | Não         | Indicador de menu.                             |
| CodBarras                     | CodBarras   | Não         | Código de barras.                              |
| TipoMercad                    | TipoMercad  | Não         | Tipo de mercado.                               |
| TipoVenda                     | TipoVenda   | Não         | Tipo de venda.                                 |
| TipoProducao                  | TipoProducao| Não         | Tipo de produção.                              |
| TipoGener                     | TipoGener   | Não         | Tipo genérico.                                 |
| UnStockVMPG                   | UnStockVMPG | Não         | Unidade de stock.                              |
| UnVendaVMV                    | UnVendaVMV  | Não         | Unidade de venda.                              |
| UnInvVMMMPG                   | UnInvVMMMPG | Não         | Unidade de inventário.                         |
| UnProduFtPV                   | UnProduFtPV | Não         | Unidade usada na ficha técnica.                |
| CodAuxiliar                   | CodAuxiliar | Não         | Código auxiliar.                               |
| CodAuxiliar2                  | CodAuxiliar2| Não         | Código auxiliar 2.                              |
| PCU                           | PCU         | Não         | Peso/custo unitário.                           |
| PCM                           | PCM         | Não         | Peso/custo médio.                              |
| Descontinuado                 | Descontinuado | Não      | Indicador de descontinuação.                   |
| DispLojas                     | DispLojas   | Não         | Disponibilidade nas lojas.                     |
| TipoArtigo                    | TipoArtigo  | Não         | Referência a tipo de artigo.                   |
| Validade                      | Validade    | Não         | Referência a validade.                         |
| Temperatura                   | Temperatura | Não         | Referência a temperatura.                      |
| Ativo                         | Ativo       | Não         | Indicador de ativo.                            |

> Qualquer outro cabeçalho que não corresponda a um campo conhecido
> deve ser ignorado na importação, sem causar erro.

---

### 4.4. Especificação – Ficheiro de Fichas Técnicas (Importar Fichas Técnicas)

A folha do Excel usada na opção **Importar Fichas Técnicas** mapeia para a
tabela lógica `FichasTecnicas`.  

| Cabeçalho Excel (normalizado) | Campo lógico       | Obrigatório | Descrição                                        |
|-------------------------------|--------------------|-------------|--------------------------------------------------|
| FamiliaSubfamilia             | FamiliaSubfamilia  | Não         | Família > Subfamília (campo auxiliar).          |
| ProdutoCodigo                 | ProdutoCodigo      | Sim         | Código do produto.                               |
| ProdutoNome                   | ProdutoNome        | Não         | Nome do produto (redundante).                    |
| ComponenteCodigo              | ComponenteCodigo   | Sim         | Código do componente.                            |
| ComponenteNome                | ComponenteNome     | Não         | Nome do componente.                              |
| Qtd                           | Qtd                | Sim         | Quantidade de componente por ficha/dose base.    |
| Unidade                       | Unidade            | Sim         | Unidade de medida (g, ml, un, etc.).             |
| Ppu / PPU                     | Ppu (PPU)          | Não         | Preço por unidade de medida.                     |
| Preco                         | Preco              | Não         | Preço total da linha (pode ser recalculado).     |
| Peso                          | Peso               | Não         | Peso da linha.                                   |
| Ordem                         | Ordem              | Não         | Ordem de apresentação da linha.                  |

**Regra de consistência:**  
Todas as linhas com o mesmo `ProdutoCodigo` formam a composição da ficha técnica
desse produto.

---

### 4.5. Especificação – Ficheiro de Preços & Taxas (Importar Preços & Taxas)

A folha do Excel usada na opção **Importar Preços & Taxas** mapeia para
a tabela lógica `PrecosTaxas`.

| Cabeçalho Excel (normalizado) | Campo lógico  | Obrigatório | Descrição                                |
|-------------------------------|--------------|-------------|------------------------------------------|
| Codigo                        | Codigo       | Sim         | Código do produto.                       |
| Loja                          | Loja         | Sim         | Identificador da loja.                   |
| Preco1                        | Preco1       | Não         | PVP1.                                    |
| Preco2                        | Preco2       | Não         | PVP2.                                    |
| Preco3                        | Preco3       | Não         | PVP3.                                    |
| Preco4                        | Preco4       | Não         | PVP4.                                    |
| Preco5                        | Preco5       | Não         | PVP5.                                    |
| Iva1                          | Iva1         | Não         | Taxa de IVA principal (percentagem).     |
| Iva2                          | Iva2         | Não         | Segunda taxa de IVA.                     |
| IsencaoIva                    | IsencaoIva   | Não         | Indicação de isenção de IVA.            |
| NomeProdVenda                 | NomeProdVenda| Não         | Nome comercial na venda.                 |
| Familia                       | Familia      | Não         | Família do produto.                      |
| SubFamilia                    | SubFamilia   | Não         | Subfamília do produto.                   |
| Ativo                         | Ativo        | Não         | Indicador de ativo para essa loja.       |

---

## 5. Estrutura da Ficha Técnica do artigo (apresentação)

A ficha técnica de um artigo é composta por **duas grandes secções**:

1. **Cabeçalho do produto**
2. **Tabela de composição (linhas de ficha técnica)**  
3. **Secções adicionais (alergénios, informação nutricional se existir, preparação)**

### 5.1. Cabeçalho do produto

Campos recomendados para visualização:

- Código (`Produtos.Codigo`)
- Nome do produto (`Produtos.Produto` ou `PrecosTaxas.NomeProdVenda`)
- Família / Subfamília
- Unidade base de produção (`Produtos.UnProduFtPV`)
- Validade (texto amigável baseado em `Validade`)
- Temperatura (texto amigável baseado em `Temperaturas`)
- Indicadores: Ativo, Descontinuado, AfetaStk, Menu
- Informação adicional (`InformacaoAdicional`)

Opcionalmente cruzados com `PrecosTaxas` para mostrar:

- Preço(s) de venda relevantes (PVP1..PVP5) para uma loja selecionada ou loja default.
- Taxas de IVA aplicáveis.

### 5.2. Tabela de composição (linhas de ficha técnica)

Para cada linha de `FichasTecnicas` de um determinado `ProdutoCodigo`,
a aplicação deve apresentar, no mínimo, as seguintes colunas:

- **Código** do componente (`ComponenteCodigo`)
- **Descrição / Nome** do componente (`ComponenteNome`)
- **Quantidade** (`Qtd`)
- **Unidade** (`Unidade`)
- **Preço unitário** (`Ppu`)
- **Custo da linha** (`Preco`)
- **Peso da linha** (`Peso`)
- **Ordem** (para ordenar visualmente as linhas)

### 5.3. Secção de totais e cálculos

Para cada Ficha Técnica, devem ser calculados e apresentados:

- **Custo total da ficha técnica** – soma dos custos das linhas.
- **Peso total** – soma dos pesos das linhas.
- **Custo por unidade de produção** – custo total / unidade base (`UnProduFtPV`)
- **Custo por dose** – se existir campo de nº de doses (pode ser definido na camada de apresentação).

### 5.4. Secção de alergénios

- Para cada componente, deve ser possível determinar a lista de alergénios
  associados (via dados externos, mapeamentos ou outra tabela não especificada aqui).
- A ficha técnica do produto deve apresentar a **união** de todos os alergénios
  dos seus componentes, como lista única ao nível do produto.

> Regras de detalhe de alergénios podem ser especificadas noutro documento,
> mas o comportamento mínimo é: **se qualquer linha tiver um alergénio X,
> a ficha técnica do produto expõe X como alergénio presente.**

### 5.5. Secção de preparação

Se existir registo em `ProdutoPreparacao` para o produto:

- Apresentar o conteúdo `Html` como bloco de instruções de confeção.

---

## 6. Regras de negócio – campos importados via Excel (imutabilidade)

### 6.1. Princípio geral

> **Todos os campos cujo valor tem origem nos ficheiros Excel são considerados
> dados oficiais e não podem ser alterados manualmente na aplicação.**

Isto aplica-se quer na interface de edição, quer em APIs ou outros mecanismos
de escrita.

### 6.2. Campos imutáveis por tipo de entidade

#### 6.2.1. Produto

Os seguintes campos são **imutáveis na aplicação** (apenas podem ser alterados
por nova importação de Excel):

- Codigo
- Produto
- NomeProdVenda
- Familia
- SubFamilia
- AfetaStk
- Menu
- CodBarras
- TipoMercad
- TipoVenda
- TipoProducao
- TipoGener
- UnStockVMPG
- UnVendaVMV
- UnInvVMMMPG
- UnProduFtPV
- CodAuxiliar
- CodAuxiliar2
- PCU
- PCM
- Descontinuado
- DispLojas
- TipoArtigo
- Validade
- Temperatura
- Ativo

#### 6.2.2. Linha de Ficha Técnica

Todos os campos da tabela `FichasTecnicas` que vêm do Excel são tratados como
imutáveis relativamente à origem Excel. Em particular:

- ProdutoCodigo
- ProdutoNome
- ComponenteCodigo
- ComponenteNome
- Qtd
- Unidade
- Ppu/PPU
- Preco
- Peso
- Ordem

Qualquer ajuste futuro de composição deve ser feito:
- Ou na origem (ficheiro Excel) com nova importação.
- Ou por um fluxo explícito que crie **camadas adicionais** de dados, sem
  sobrescrever diretamente os campos importados.

#### 6.2.3. Preços & Taxas

Todos os campos importados em `PrecosTaxas` (ver tabela na secção 4.5)
são também **imutáveis** na aplicação.

### 6.3. Comportamento exigido em implementações

- A interface de utilizador deve apresentar estes campos como **read-only** ou
  com um marcador visual (ex.: cadeado).  
- Qualquer tentativa de alteração via API deve ser rejeitada, devolvendo um erro
  do tipo:  
  `"Campo 'X' é de origem Excel e não pode ser alterado manualmente."`
- As únicas operações permitidas sobre estes campos são:
  - Importação de novo Excel.
  - Reprocessamento/importação deliberada que substitua dados anteriores.

---

## 7. Regras de cálculos principais

### 7.1. Cálculo do custo da linha de ficha técnica

Se ambos estiverem disponíveis:

- `Preco` (custo da linha) e `Ppu` (preço por unidade) **podem vir já calculados
  do Excel**.

Implementações futuras devem, contudo, garantir o seguinte comportamento mínimo:

```text
Preco (linha) = Qtd × Ppu   (quando Ppu estiver definido)

Se apenas Preco vier do Excel, pode ser considerado como valor oficial.
```

### 7.2. Cálculo do custo total da ficha técnica

```text
CustoTotalFicha = soma(Preco de todas as linhas da ficha)
```

### 7.3. Cálculo de custo por unidade / por dose

Dependendo da forma como a UI define `unidade base` ou `dose`, o cálculo é:

```text
CustoPorUnidade = CustoTotalFicha / UnidadeBaseProdução
```

ou, se houver um campo explícito de doses no nível do produto:

```text
CustoPorDose = CustoTotalFicha / NumeroDeDoses
```

> A existência e o nome do campo de nº de doses pode variar entre implementações,
> mas a fórmula conceptual acima deve ser respeitada.

### 7.4. Cálculo dos alergénios do produto

Para cada componente da ficha técnica, determinar a lista de alergénios aplicáveis.
Depois:

```text
AlergeniosDoProduto = união de todos os alergénios dos componentes
```

Não há duplicados; o resultado é apresentado como lista única.

---

## 8. Fluxo de dados – resumo textual

### 8.1. Importação de produtos

1. Utilizador escolhe **Importar Produtos**.
2. Seleciona ficheiro Excel com uma única folha e cabeçalhos válidos.
3. Sistema valida cabeçalhos.
4. Para cada linha:
   - Se `Codigo` existe em Produtos: atualiza campos imutáveis com os novos
     valores Excel (sobrescrevendo o que estiver na base de dados).
   - Se não existe: cria novo registo.
5. Regista importação no histórico.

### 8.2. Importação de fichas técnicas

1. Utilizador escolhe **Importar Fichas Técnicas**.
2. Seleciona ficheiro Excel apropriado.
3. Sistema valida cabeçalhos.
4. Para cada `ProdutoCodigo`:
   - Pode limpar (ou marcar obsoletas) as linhas anteriores dessa ficha técnica.
   - Inserir as novas linhas conforme ficheiro.
5. Atualiza base de dados para manter composição coerente.

### 8.3. Importação de preços & taxas

1. Utilizador escolhe **Importar Preços & Taxas**.
2. Seleciona ficheiro Excel.
3. Para cada linha (produto+loja):
   - Se existir registo em `PrecosTaxas`: atualiza.
   - Caso contrário: cria novo.

---

## 9. Glossário de termos

- **Produto** – artigo identificado por um código único, podendo ser vendido
  diretamente ou usado como componente.
- **Ficha Técnica** – descrição estruturada da composição de um produto (ingredientes,
  quantidades, unidades, custos e alergénios), associada a instruções de preparação.
- **Componente** – ingrediente ou subproduto usado para compor um produto.
- **PVP** – Preço de Venda ao Público.
- **Alergénio** – substância que pode provocar alergias, listada na tabela `Alergenios`.
- **Importação Excel** – processo de leitura de ficheiros Excel normalizados
  para atualização da base de dados.
- **Campo imutável** – campo cujo valor é definido exclusivamente via Excel
  e não pode ser alterado manualmente na aplicação.

---

## 10. Notas finais para outras implementações / AIs (incluindo Codex)

1. **Este documento é a referência funcional e de dados**.  
   Qualquer implementação (nova linguagem, novo repo ou agente AI) deve
   segui-lo como fonte de verdade.

2. **Não alterar o significado dos campos** sem atualizar este documento.  
   Mudanças estruturais (novos campos, campos deprecados) devem ser refletidas
   aqui antes de serem aplicadas no código.

3. **Respeitar a imutabilidade dos campos Excel** em qualquer interface
   (UI, API, batch, etc.).

4. A lógica de importação deve **continuar a ser baseada no tipo de importação
   escolhido na aplicação**, e **não** no nome do ficheiro Excel.

5. Implementações podem acrescentar:
   - Camadas de override interno (ex.: custos alternativos, preços de cenário).
   - Análises complementares (margens, food cost, etc.).  
   Desde que isso seja feito em **camadas adicionais**, sem alterar os campos
   base descritos neste documento.

Este documento pode ser dividido em vários ficheiros `.md` se desejado,
mas o conteúdo aqui descrito deve permanecer consistente.

