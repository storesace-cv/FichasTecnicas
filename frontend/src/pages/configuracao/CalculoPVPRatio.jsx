import React, { useEffect, useState } from 'react';

const STORAGE_KEY_OPERACIONAIS = 'configuracao_food_cost_operacionais';
const STORAGE_KEY_RATIO = 'configuracao_pvp_ratio';

export default function CalculoPVPRatio() {
  const [custosOperacionais, setCustosOperacionais] = useState('');
  const [ratio, setRatio] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const custosGuardados = localStorage.getItem(STORAGE_KEY_OPERACIONAIS);
    if (custosGuardados !== null) {
      setCustosOperacionais(custosGuardados);
    }

    const ratioGuardado = localStorage.getItem(STORAGE_KEY_RATIO);
    if (ratioGuardado !== null) {
      setRatio(ratioGuardado);
    }
  }, []);

  const guardar = (event) => {
    event.preventDefault();

    const custosNormalizados = custosOperacionais === '' ? '' : Math.max(0, Math.min(100, Number(custosOperacionais)));
    const ratioNormalizado = ratio === '' ? '' : Math.max(0, Number(ratio));

    const custosParaGuardar = custosNormalizados === '' ? '' : custosNormalizados.toString();
    const ratioParaGuardar = ratioNormalizado === '' ? '' : ratioNormalizado.toString();

    setCustosOperacionais(custosParaGuardar);
    setRatio(ratioParaGuardar);

    localStorage.setItem(STORAGE_KEY_OPERACIONAIS, custosParaGuardar);
    localStorage.setItem(STORAGE_KEY_RATIO, ratioParaGuardar);

    setMensagem('Parâmetros de cálculo via rácio atualizados com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
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
                min="0"
                step="0.01"
                value={ratio}
                onChange={(event) => setRatio(event.target.value)}
                placeholder="Exemplo: 2.5"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">
                Use o rácio que multiplicará o custo com operacionais para obter o PVSI antes da aplicação do IVA (iva1).
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
      </div>
    </div>
  );
}
