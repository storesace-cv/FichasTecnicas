import React, { useEffect, useMemo, useState } from 'react';
import {
  BUSINESS_TYPES,
  canEditIntervals,
  DEFAULT_INTERVALS_BY_BUSINESS,
  FOOD_COST_BUSINESS_TYPE_STORAGE_KEY,
  getBusinessType,
  getIntervalsForBusinessType,
  saveConsultantIntervals,
} from '../../services/foodCostConfig';

export default function IntervalosFoodCost() {
  const [tipoNegocio, setTipoNegocio] = useState(getBusinessType());
  const [valores, setValores] = useState(() => normalizarValores(getIntervalsForBusinessType(getBusinessType())));
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const edicaoPermitida = useMemo(() => canEditIntervals(tipoNegocio), [tipoNegocio]);

  useEffect(() => {
    const atualizaAPartirDoStorage = (event) => {
      // Garantimos que a página reflete o tipo de negócio selecionado noutros ecrãs/abas.
      if (!event || event.key === null || event.key === FOOD_COST_BUSINESS_TYPE_STORAGE_KEY) {
        const novoTipo = getBusinessType();
        setTipoNegocio(novoTipo);
        setValores(normalizarValores(getIntervalsForBusinessType(novoTipo)));
        setErro('');
        setMensagem('');
      }
    };

    window.addEventListener('storage', atualizaAPartirDoStorage);
    return () => window.removeEventListener('storage', atualizaAPartirDoStorage);
  }, []);

  const guardar = (event) => {
    event.preventDefault();
    if (!edicaoPermitida) return;

    const bomMaxNumero = Number(valores.bomMax);
    const normalMaxNumero = Number(valores.normalMax);

    if (!Number.isFinite(bomMaxNumero) || !Number.isFinite(normalMaxNumero)) {
      setErro('Introduza valores numéricos válidos para os limites.');
      return;
    }

    if (bomMaxNumero < 0 || normalMaxNumero < 0) {
      setErro('Os limites devem ser iguais ou superiores a 0%.');
      return;
    }

    if (normalMaxNumero <= bomMaxNumero) {
      setErro('O limite de Normal / Aceitável deve ser superior ao limite de Bom.');
      return;
    }

    // Guarda apenas quando o tipo permite edição manual.
    const valoresGuardados = saveConsultantIntervals({ bomMax: bomMaxNumero, normalMax: normalMaxNumero });
    setValores(normalizarValores(valoresGuardados));
    setErro('');
    setMensagem('Intervalos de Food Cost atualizados para Consultores de F&B.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const valoresAtuais = useMemo(() => {
    // Para Consultores de F&B refletimos imediatamente o que está a ser editado.
    if (edicaoPermitida) {
      const bom = Number(valores.bomMax);
      const normal = Number(valores.normalMax);

      return {
        bomMax: Number.isFinite(bom) ? bom : DEFAULT_INTERVALS_BY_BUSINESS['Consultores de F&B'].bomMax,
        normalMax: Number.isFinite(normal) ? normal : DEFAULT_INTERVALS_BY_BUSINESS['Consultores de F&B'].normalMax,
      };
    }

    return getIntervalsForBusinessType(tipoNegocio);
  }, [edicaoPermitida, valores.bomMax, valores.normalMax, tipoNegocio]);

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Food Cost</p>
          <h1 className="text-4xl font-black text-strong">Intervalos de Food Cost</h1>
          <p className="text-base text-subtle">
            Os limites são definidos automaticamente pelo tipo de negócio selecionado em "Tipo de Negócio".
            {edicaoPermitida
              ? ' Pode personalizar os valores quando o tipo for Consultores de F&B.'
              : ' Para editar manualmente, selecione "Consultores de F&B" em Tipo de Negócio.'}
          </p>
          <p className="text-sm text-muted">Tipo selecionado: <strong>{tipoNegocio}</strong></p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <form className="space-y-8" onSubmit={guardar}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="limite-bom">
                Limite superior de "Bom" (FC ≤ X%)
              </label>
              <input
                id="limite-bom"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={valores.bomMax}
                onChange={(event) => setValores((prev) => ({ ...prev, bomMax: event.target.value }))}
                disabled={!edicaoPermitida}
                className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none ${
                  !edicaoPermitida ? 'bg-gray-50 cursor-not-allowed text-muted' : ''
                }`}
              />
              <p className="text-sm text-subtle">Intervalo "Bom": FC ≤ {valoresAtuais.bomMax}%.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="limite-normal">
                Limite superior de "Normal / Aceitável" (FC ≤ Y%)
              </label>
              <input
                id="limite-normal"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={valores.normalMax}
                onChange={(event) => setValores((prev) => ({ ...prev, normalMax: event.target.value }))}
                disabled={!edicaoPermitida}
                className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none ${
                  !edicaoPermitida ? 'bg-gray-50 cursor-not-allowed text-muted' : ''
                }`}
              />
              <p className="text-sm text-subtle">Intervalo "Normal / Aceitável": {valoresAtuais.bomMax}% &lt; FC ≤ {valoresAtuais.normalMax}%.</p>
            </div>

            <div className="space-y-2 text-sm text-subtle">
              <p>
                Intervalo "Mau / Problemático": FC &gt; {valoresAtuais.normalMax}%.
              </p>
              {!edicaoPermitida && (
                <p className="text-warning-700 font-medium">
                  Estes valores são predefinidos para {tipoNegocio} e não podem ser alterados.
                </p>
              )}
              {edicaoPermitida && (
                <p className="text-success-800 font-medium">
                  Pode personalizar os intervalos para Consultores de F&B. As alterações serão reutilizadas quando voltar a selecionar este tipo.
                </p>
              )}
            </div>

            {erro && <div className="rounded-lg bg-warning-50 text-warning-800 px-4 py-3 text-sm font-medium">{erro}</div>}

            {edicaoPermitida && (
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
              >
                Guardar intervalos
              </button>
            )}
          </form>

          {mensagem && (
            <div className="rounded-lg bg-success-50 text-success-800 px-4 py-3 text-sm font-medium">{mensagem}</div>
          )}
        </div>

        <div className="rounded-2xl bg-surface p-6 border border-gray-100 shadow-inner space-y-3">
          <h2 className="text-lg font-semibold text-strong">Valores predefinidos por tipo de negócio</h2>
          <div className="grid gap-3">
            {BUSINESS_TYPES.map((tipo) => {
              const intervalos = DEFAULT_INTERVALS_BY_BUSINESS[tipo];
              return (
                <div key={tipo} className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <p className="font-semibold text-strong">{tipo}</p>
                  <p className="text-sm text-subtle">Bom: FC ≤ {intervalos.bomMax}%</p>
                  <p className="text-sm text-subtle">Normal / Aceitável: {intervalos.bomMax}% &lt; FC ≤ {intervalos.normalMax}%</p>
                  <p className="text-sm text-subtle">Mau / Problemático: FC &gt; {intervalos.normalMax}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizarValores(valores) {
  return {
    bomMax: valores?.bomMax?.toString() ?? '',
    normalMax: valores?.normalMax?.toString() ?? '',
  };
}
