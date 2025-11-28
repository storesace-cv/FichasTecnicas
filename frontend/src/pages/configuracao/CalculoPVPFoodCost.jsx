import React, { useEffect, useState } from 'react';

const STORAGE_KEY_OPERACIONAIS = 'configuracao_food_cost_operacionais';
const STORAGE_KEY_FOOD_COST_ALVO = 'configuracao_pvp_food_cost_alvo';

export default function CalculoPVPFoodCost() {
  const [custosOperacionais, setCustosOperacionais] = useState('');
  const [foodCostAlvo, setFoodCostAlvo] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const custosGuardados = localStorage.getItem(STORAGE_KEY_OPERACIONAIS);
    if (custosGuardados !== null) {
      setCustosOperacionais(custosGuardados);
    }

    const foodCostGuardado = localStorage.getItem(STORAGE_KEY_FOOD_COST_ALVO);
    if (foodCostGuardado !== null) {
      setFoodCostAlvo(foodCostGuardado);
    }
  }, []);

  const guardar = (event) => {
    event.preventDefault();

    const custosNormalizados = custosOperacionais === '' ? '' : Math.max(0, Math.min(100, Number(custosOperacionais)));
    const foodCostNormalizado = foodCostAlvo === '' ? '' : Math.max(0, Math.min(100, Number(foodCostAlvo)));

    const custosParaGuardar = custosNormalizados === '' ? '' : custosNormalizados.toString();
    const foodCostParaGuardar = foodCostNormalizado === '' ? '' : foodCostNormalizado.toString();

    setCustosOperacionais(custosParaGuardar);
    setFoodCostAlvo(foodCostParaGuardar);

    localStorage.setItem(STORAGE_KEY_OPERACIONAIS, custosParaGuardar);
    localStorage.setItem(STORAGE_KEY_FOOD_COST_ALVO, foodCostParaGuardar);

    setMensagem('Parâmetros de cálculo via food cost alvo atualizados com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Cálculo PVP</p>
          <h1 className="text-4xl font-black text-strong">via Food Cost alvo</h1>
          <p className="text-base text-subtle">
            Configure os parâmetros necessários para calcular o PVP usando o food cost alvo. Os preços importados de Excel já incluem IVA,
            e a taxa a usar está no campo <strong>iva1</strong> da tabela de preços.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <form className="space-y-6" onSubmit={guardar}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="custos-operacionais">
                Percentagem de custos operacionais (%)
              </label>
              <input
                id="custos-operacionais"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={custosOperacionais}
                onChange={(event) => setCustosOperacionais(event.target.value)}
                placeholder="Exemplo: 12.5"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">
                Este valor é aplicado sobre o custo dos ingredientes antes de calcular o food cost alvo.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="food-cost-alvo">
                Food cost alvo (%)
              </label>
              <input
                id="food-cost-alvo"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={foodCostAlvo}
                onChange={(event) => setFoodCostAlvo(event.target.value)}
                placeholder="Exemplo: 30"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">
                Indique o food cost alvo em percentagem. O valor decimal será usado no cálculo PVSI = Custo com operacionais / FoodCostAlvo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
              >
                Guardar parâmetros
              </button>
              <p className="text-sm text-subtle">
                Ao apresentar o PVP, será aplicada a taxa de IVA definida no artigo (campo iva1).
              </p>
            </div>
          </form>

          {mensagem && (
            <div className="rounded-lg bg-success-50 text-success-800 px-4 py-3 text-sm font-medium">
              {mensagem}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold text-strong">Como funciona o cálculo via Food Cost alvo</h2>
          <p className="text-base text-subtle">
            Esta abordagem parte do custo real do prato (ingredientes + custos operacionais) e aplica o{' '}
            <strong>Food Cost alvo</strong> para chegar ao preço de venda sem IVA (PVSI). Depois, aplica-se o IVA indicado no
            artigo (campo <strong>iva1</strong>) para obter o PVP final apresentado ao cliente.
          </p>
          <div className="space-y-2 text-sm text-strong">
            <p className="font-semibold">Passos e fórmulas:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>CustoIngredientes</strong> = soma de (Quantidade × PreçoUnitário) de cada ingrediente importado (estes
                preços já incluem IVA de origem, mas o cálculo profissional trabalha sem IVA ao aplicar as fórmulas).
              </li>
              <li>
                <strong>CustoComOperacionais</strong> = CustoIngredientes × (1 + PercentagemOperacionais/100).
              </li>
              <li>
                <strong>PVSI</strong> = CustoComOperacionais / FoodCostAlvoDecimal (ex.: 30% → 0.30).
              </li>
              <li>
                <strong>PVP</strong> = PVSI × (1 + IVA/100), usando o IVA do artigo (<strong>iva1</strong>).
              </li>
            </ol>
          </div>
          <p className="text-sm text-subtle">
            Dica: um food cost alvo de 25% corresponde aproximadamente a um rácio de 4. Quanto menor o food cost, maior a
            margem. Ajuste a percentagem de operacionais para refletir eletricidade, mão-de-obra e outros custos indiretos do
            seu negócio.
          </p>
        </div>
      </div>
    </div>
  );
}
