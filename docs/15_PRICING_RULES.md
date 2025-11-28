Regras Oficiais de Cálculo — Rácio, Food Cost, Custos Operacionais e Preço de Venda (com IVA)

Este documento define as regras profissionais para o cálculo financeiro de fichas técnicas de produtos/pratos:
	•	Rácio de um prato
	•	Food Cost (%)
	•	Custos Operacionais (Overhead Cost)
	•	Preço de Venda Profissional (com IVA)

Estas regras devem ser seguidas por todas as implementações futuras da aplicação (backend, frontend, APIs, exportações e lógica de cálculo).

⸻

1. Rácio de um Prato (Multiplicador de Custo)

1.1 Definição

O Rácio é o multiplicador aplicado ao custo do prato para chegar ao preço de venda sem IVA.

Rácio = PreçoDeVendaSemIVA / CustoTotalDoPrato

1.2 Relação com Food Cost

Como relação direta:

Rácio = 1 / FoodCostDecimal

Exemplos:
	•	FC = 25% → rácio = 4
	•	FC = 20% → rácio = 5

1.3 Interpretação prática

Rácio	FC%	Interpretação
3	~33%	Margem aceitável
4	25%	Boa margem
5	20%	Muito bom
6–7	14–17%	Excelente margem


⸻

2. Food Cost (%)

2.1 Definição

Percentagem do preço sem IVA que representa o custo dos ingredientes.

2.2 Fórmula profissional

FoodCost% = (CustoTotalDoPrato / PreçoDeVendaSemIVA) × 100

⚠️ IMPORTANTE
O Food Cost é SEM IVA.
O IVA não pertence ao restaurante.

2.3 Food Cost alvo

É a meta definida pelo restaurante.
Exemplos comuns:
	•	25% para pratos normais
	•	30% para menus
	•	18–22% para pratos premium

⸻

3. Custos Operacionais (Overhead Cost)

3.1 Definição

Custos indiretos associados à confeção do prato:
	•	eletricidade
	•	gás
	•	água
	•	mão-de-obra direta de cozinha
	•	desperdício normal
	•	consumíveis (óleo, detergentes, etc.)
	•	manutenção e equipamento

Estes custos não aparecem na lista de ingredientes, mas fazem parte do custo real de produção.

3.2 Percentagem típica

Valores usados pelo setor:
	•	10% — fast food, grande volume
	•	15% — restauração generalista (valor mais comum)
	•	20% — pratos premium
	•	25% — muita mão-de-obra (pastelaria, sushi, fine dining)

A percentagem deve ser configurável no sistema.

3.3 Como aplicar

Aplica-se ao custo total dos ingredientes antes de calcular o preço de venda.

CustoComOperacionais = CustoIngredientes × (1 + PercentualOperacionais)

Se PercentualOperacionais = 15%:

CustoComOperacionais = CustoIngredientes × 1.15


⸻

4. Cálculo Profissional do Preço de Venda (com IVA)

O cálculo dá-se em três etapas:

⸻

4.1 Etapa 1 — Cálculo do custo base (ingredientes)

CustoIngredientes = soma(Quantidade × PrecoUnitario)


⸻

4.2 Etapa 2 — Aplicação dos Custos Operacionais

CustoComOperacionais = CustoIngredientes × (1 + PercentualOperacionais)

Este é o custo REAL para calcular margens e Food Cost.

⸻

4.3 Etapa 3 — Calcular o Preço Sem IVA (PVSI)

O restaurante pode usar:

Método A — Via Food Cost alvo

PVSI = CustoComOperacionais / FoodCostAlvoDecimal

Método B — Via Rácio

PVSI = CustoComOperacionais × Rácio

Ambos os métodos são válidos.

⸻

4.4 Etapa 4 — Preço Final (com IVA)

PVP = PVSI × (1 + IVA/100)


⸻

5. Exemplo completo (profissional)

Ingredientes total:

2.40 €

Custos operacionais:

15% → 0.15

CustoComOperacionais = 2.40 × 1.15 = 2.76 €

Food Cost alvo:

30% → 0.30

PVSI = 2.76 / 0.30 = 9.20 €

IVA = 13%

PVP = 9.20 × 1.13 = 10.396 ≈ 10.40 €

Preço final sugerido:
10.50 €

⸻

6. Regras obrigatórias para o Codex
	1.	Food Cost e Rácio são sempre calculados sem IVA.
	2.	Custos operacionais devem ser aplicados antes do cálculo do PVSI.
	3.	O Codex deve seguir esta ordem:
	•	ler ingredientes
	•	somar custo
	•	aplicar operacionais
	•	calcular PVSI via FC ou Rácio
	•	aplicar IVA
	4.	Nunca calcular preço de venda diretamente sem FC, Rácio ou operacionais.
	5.	Alterações futuras às regras de cálculo devem ser refletidas neste documento antes de alterar código.
