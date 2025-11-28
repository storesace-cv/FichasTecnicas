import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'configuracao_food_cost_operacionais';

export default function CustosOperacionais() {
  const [percentagem, setPercentagem] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const valorGuardado = localStorage.getItem(STORAGE_KEY);
    if (valorGuardado !== null) {
      setPercentagem(valorGuardado);
    }
  }, []);

  const guardar = (event) => {
    event.preventDefault();
    const valorNormalizado = percentagem === '' ? '' : Math.max(0, Math.min(100, Number(percentagem)));
    const valorParaGuardar = valorNormalizado === '' ? '' : valorNormalizado.toString();
    setPercentagem(valorParaGuardar);
    localStorage.setItem(STORAGE_KEY, valorParaGuardar);
    setMensagem('Custos operacionais atualizados com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Food Cost</p>
          <h1 className="text-4xl font-black text-strong">Custos Operacionais</h1>
          <p className="text-base text-subtle">Indique a percentagem a aplicar nos cálculos de food cost.</p>
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
                value={percentagem}
                onChange={(event) => setPercentagem(event.target.value)}
                placeholder="Exemplo: 12.5"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">Este valor será utilizado em cálculos futuros de food cost.</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
            >
              Guardar percentagem
            </button>
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
