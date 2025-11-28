import React, { useEffect, useState } from 'react';
import {
  FOOD_COST_BUSINESS_TYPE_STORAGE_KEY,
  getBusinessType,
  getDefaultPvpParameters,
} from '../../services/foodCostConfig';

const STORAGE_KEY_OPERACIONAIS = 'configuracao_food_cost_operacionais';
const STORAGE_KEY_RATIO = 'configuracao_pvp_ratio';

export default function CalculoPVPRatio() {
  const [custosOperacionais, setCustosOperacionais] = useState('');
  const [ratio, setRatio] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState(getBusinessType());
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const negocioSelecionado = getBusinessType();
    setTipoNegocio(negocioSelecionado);

    const custosGuardados = localStorage.getItem(STORAGE_KEY_OPERACIONAIS);
    if (custosGuardados !== null) {
      setCustosOperacionais(custosGuardados);
    }

    const ratioGuardado = localStorage.getItem(STORAGE_KEY_RATIO);
    if (ratioGuardado !== null) {
      setRatio(ratioGuardado);
    }

    // Pré-preenche apenas quando não existem valores guardados, usando o tipo de negócio escolhido.
    if (custosGuardados === null && ratioGuardado === null) {
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
    const ratioNormalizado = ratio === '' ? '' : Math.max(0.01, Number(ratio));

    const custosParaGuardar = custosNormalizados === '' ? '' : custosNormalizados.toString();
    const ratioParaGuardar = ratioNormalizado === '' ? '' : ratioNormalizado.toString();

    setCustosOperacionais(custosParaGuardar);
    setRatio(ratioParaGuardar);

    localStorage.setItem(STORAGE_KEY_OPERACIONAIS, custosParaGuardar);
    localStorage.setItem(STORAGE_KEY_RATIO, ratioParaGuardar);

    setMensagem('Parâmetros de cálculo via rácio atualizados com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const aplicarDefaults = (negocio = tipoNegocio, exibirMensagem = true) => {
    const defaults = getDefaultPvpParameters(negocio);

    const custosParaGuardar = defaults.operacionaisPercent.toString();
    const ratioParaGuardar = defaults.ratio.toString();

    // Substitui pelos valores recomendados para o tipo de negócio selecionado.
    setCustosOperacionais(custosParaGuardar);
    setRatio(ratioParaGuardar);

    localStorage.setItem(STORAGE_KEY_OPERACIONAIS, custosParaGuardar);
    localStorage.setItem(STORAGE_KEY_RATIO, ratioParaGuardar);

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
          <h1 className="text-4xl font-black text-strong">via Rácio</h1>
          <p className="text-base text-subtle">
            Defina o rácio de multiplicação para calcular o PVP. Lembre-se que os preços importados de Excel já incluem IVA e a taxa
            correta está no campo <strong>iva1</strong> da tabela de preços.
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
                Este valor será aplicado ao custo dos ingredientes antes de multiplicar pelo rácio.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="ratio">
                Rácio de multiplicação
              </label>
              <input
                id="ratio"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={ratio}
                onChange={(event) => setRatio(event.target.value)}
                placeholder="Exemplo: 2.5"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">
                Use o rácio que multiplicará o custo com operacionais para obter o PVSI antes da aplicação do IVA (iva1). Este valor deve ser maior que 0 e, tipicamente, superior a 1 (ex.: rácio 4 ≈ food cost de 25%).
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
                Para apresentar o PVP, o IVA (iva1) será aplicado ao PVSI calculado.
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
          <h2 className="text-xl font-bold text-strong">Como funciona o cálculo via Rácio</h2>
          <p className="text-base text-subtle">
            O rácio é o multiplicador profissional que transforma o custo real do prato (ingredientes + custos operacionais) no
            preço de venda sem IVA (PVSI). Depois, acrescenta-se o IVA do artigo (campo <strong>iva1</strong>) para apresentar
            o PVP final ao cliente.
          </p>
          <div className="space-y-2 text-sm text-strong">
            <p className="font-semibold">Passos e fórmulas:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>CustoIngredientes</strong> = soma de (Quantidade × PreçoUnitário) de cada ingrediente importado. Mesmo
                que os preços importados já incluam IVA, estas fórmulas trabalham sem IVA ao determinar margens profissionais.
              </li>
              <li>
                <strong>CustoComOperacionais</strong> = CustoIngredientes × (1 + PercentagemOperacionais/100).
              </li>
              <li>
                <strong>PVSI</strong> = CustoComOperacionais × Rácio.
              </li>
              <li>
                <strong>PVP</strong> = PVSI × (1 + IVA/100), usando o IVA do artigo (<strong>iva1</strong>).
              </li>
            </ol>
          </div>
          <p className="text-sm text-subtle">
            Dica: o rácio é o inverso do food cost em decimal (Rácio = 1 / FoodCost). Um food cost alvo de 25% equivale a um
            rácio de 4. Ajuste o rácio conforme a margem desejada e utilize a percentagem de operacionais para refletir custos
            indiretos como energia e mão-de-obra.
          </p>
        </div>
      </div>
    </div>
  );
}
