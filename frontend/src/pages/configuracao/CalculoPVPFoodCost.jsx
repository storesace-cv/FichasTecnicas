import React, { useEffect, useState } from 'react';
import {
  FOOD_COST_BUSINESS_TYPE_STORAGE_KEY,
  getBusinessType,
  getDefaultPvpParameters,
  OPERACIONAL_COST_STORAGE_KEY,
  PVP_FOOD_COST_TARGETS_DECIMALS_STORAGE_KEY,
  PVP_FOOD_COST_TARGETS_STORAGE_KEY,
  PVP_VARIATIONS_COUNT,
} from '../../services/foodCostConfig';

const LEGACY_STORAGE_KEY_FOOD_COST_ALVO = 'configuracao_pvp_food_cost_alvo';

const createEmptyFoodCostList = () => Array.from({ length: PVP_VARIATIONS_COUNT }, () => '');
const parseStoredArray = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      const normalized = parsed.slice(0, PVP_VARIATIONS_COUNT).map((value) =>
        value === '' || value === null || value === undefined ? '' : value.toString()
      );

      while (normalized.length < PVP_VARIATIONS_COUNT) {
        normalized.push('');
      }

      return normalized;
    }
  } catch (error) {
    return null;
  }

  return null;
};

export default function CalculoPVPFoodCost() {
  const [custosOperacionais, setCustosOperacionais] = useState('');
  const [foodCostAlvos, setFoodCostAlvos] = useState(createEmptyFoodCostList());
  const [tipoNegocio, setTipoNegocio] = useState(getBusinessType());
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const negocioSelecionado = getBusinessType();
    setTipoNegocio(negocioSelecionado);

    const custosGuardados = localStorage.getItem(OPERACIONAL_COST_STORAGE_KEY);
    if (custosGuardados !== null) {
      setCustosOperacionais(custosGuardados);
    }

    const foodCostGuardado = parseStoredArray(localStorage.getItem(PVP_FOOD_COST_TARGETS_STORAGE_KEY));
    const foodCostLegacy = localStorage.getItem(LEGACY_STORAGE_KEY_FOOD_COST_ALVO);

    if (foodCostGuardado !== null) {
      setFoodCostAlvos(foodCostGuardado);
    } else if (foodCostLegacy !== null) {
      setFoodCostAlvos(Array.from({ length: PVP_VARIATIONS_COUNT }, () => foodCostLegacy));
    }

    // Pré-preenche apenas quando não existem valores guardados, usando o tipo de negócio escolhido.
    if (custosGuardados === null && foodCostGuardado === null && foodCostLegacy === null) {
      aplicarDefaults(negocioSelecionado, false);
    }
  }, []);

  useEffect(() => {
    const atualizaTipo = (event) => {
      if (!event || event.key === null || event.key === FOOD_COST_BUSINESS_TYPE_STORAGE_KEY) {
        setTipoNegocio(getBusinessType());
      }
    };

    window.addEventListener('storage', atualizaTipo);
    return () => window.removeEventListener('storage', atualizaTipo);
  }, []);

  const guardar = (event) => {
    event.preventDefault();

    const custosNormalizados = custosOperacionais === '' ? '' : Math.max(0, Math.min(100, Number(custosOperacionais)));

    const foodCostPercentsNormalizados = foodCostAlvos.map((valor) =>
      valor === '' ? '' : Math.max(0.01, Math.min(100, Number(valor)))
    );
    const foodCostDecimaisNormalizados = foodCostPercentsNormalizados.map((valor) =>
      valor === '' ? '' : Math.max(0.01, Math.min(1, valor / 100))
    );

    const custosParaGuardar = custosNormalizados === '' ? '' : custosNormalizados.toString();
    const foodCostParaGuardar = foodCostPercentsNormalizados.map((valor) =>
      valor === '' ? '' : valor.toString()
    );
    const foodCostDecimalParaGuardar = foodCostDecimaisNormalizados.map((valor) =>
      valor === '' ? '' : valor.toString()
    );

    setCustosOperacionais(custosParaGuardar);
    setFoodCostAlvos(foodCostParaGuardar);

    localStorage.setItem(OPERACIONAL_COST_STORAGE_KEY, custosParaGuardar);
    localStorage.setItem(PVP_FOOD_COST_TARGETS_STORAGE_KEY, JSON.stringify(foodCostParaGuardar));
    localStorage.setItem(PVP_FOOD_COST_TARGETS_DECIMALS_STORAGE_KEY, JSON.stringify(foodCostDecimalParaGuardar));

    setMensagem('Parâmetros de cálculo via food cost alvo atualizados com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const aplicarDefaults = (negocio = tipoNegocio, exibirMensagem = true) => {
    const defaults = getDefaultPvpParameters(negocio);

    const custosParaGuardar = defaults.operacionaisPercent.toString();
    const foodCostParaGuardar = defaults.foodCostPercents.map((valor) => valor.toString());
    const foodCostDecimalParaGuardar = defaults.foodCostDecimals.map((valor) => valor.toString());

    // Substitui pelos valores recomendados para o tipo de negócio selecionado.
    setCustosOperacionais(custosParaGuardar);
    setFoodCostAlvos(foodCostParaGuardar);

    localStorage.setItem(OPERACIONAL_COST_STORAGE_KEY, custosParaGuardar);
    localStorage.setItem(PVP_FOOD_COST_TARGETS_STORAGE_KEY, JSON.stringify(foodCostParaGuardar));
    localStorage.setItem(PVP_FOOD_COST_TARGETS_DECIMALS_STORAGE_KEY, JSON.stringify(foodCostDecimalParaGuardar));

    if (exibirMensagem) {
      setMensagem(`Valores predefinidos aplicados para ${negocio}.`);
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Cálculo PVP</p>
          <h1 className="text-4xl font-black text-strong">Food cost alvo (%)</h1>
          <p className="text-base text-subtle">
            Configure até cinco valores de food cost alvo — cada um será usado para calcular PVP1 a PVP5 quando forem
            disponibilizados. Os preços importados de Excel já incluem IVA, e a taxa a usar está no campo <strong>iva1</strong> da
            tabela de preços.
          </p>
          <p className="text-sm text-muted">Tipo de negócio selecionado: <strong>{tipoNegocio}</strong></p>
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
              <p className="block text-sm font-semibold text-strong">Food cost alvo (%)</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {foodCostAlvos.map((valor, indice) => (
                  <div key={`food-cost-${indice}`} className="space-y-1">
                    <label className="block text-sm font-semibold text-strong" htmlFor={`food-cost-${indice}`}>
                      Food cost alvo [{indice + 1}] (%)
                    </label>
                    <input
                      id={`food-cost-${indice}`}
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      max="100"
                      step="0.01"
                      value={valor}
                      onChange={(event) =>
                        setFoodCostAlvos((prev) => {
                          const atualizados = [...prev];
                          atualizados[indice] = event.target.value;
                          return atualizados;
                        })
                      }
                      placeholder="Exemplo: 30"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-subtle">Associado ao futuro cálculo do PVP{indice + 1}.</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-subtle">
                Indique o food cost alvo em percentagem; o valor decimal correspondente é deduzido automaticamente (ex.: 30% → 0.30)
                e usado em PVSI = Custo com operacionais / FoodCostAlvo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
              >
                Guardar parâmetros
              </button>
              <button
                type="button"
                onClick={() => aplicarDefaults()}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
              >
                Repor valores por defeito
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
              <strong>Food Cost alvo</strong> em percentagem, deduzindo automaticamente o valor decimal correspondente, para chegar ao preço de venda sem IVA (PVSI).
              Depois, aplica-se o IVA indicado no
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
                <strong>PVSI</strong> = CustoComOperacionais / FoodCostAlvoDecimal, onde o decimal é deduzido automaticamente a partir da percentagem indicada (ex.: 30% → 0.30).
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
