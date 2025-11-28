import React, { useEffect, useState } from 'react';
import { BUSINESS_TYPES, getBusinessType, setBusinessType } from '../../services/foodCostConfig';

export default function TipoNegocio() {
  const [tipoNegocio, setTipoNegocio] = useState(getBusinessType());
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setTipoNegocio(getBusinessType());
  }, []);

  const guardar = (event) => {
    event.preventDefault();
    setBusinessType(tipoNegocio);
    setMensagem('Tipo de negócio atualizado com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Food Cost</p>
          <h1 className="text-4xl font-black text-strong">Tipo de Negócio</h1>
          <p className="text-base text-subtle">
            Selecione o tipo de negócio para aplicar automaticamente os intervalos de Food Cost adequados.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <form className="space-y-6" onSubmit={guardar}>
            <fieldset className="space-y-4">
              <legend className="block text-sm font-semibold text-strong mb-1">Tipo de Negócio</legend>
              <div className="grid gap-3">
                {BUSINESS_TYPES.map((opcao) => (
                  <label
                    key={opcao}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:border-primary"
                  >
                    <input
                      type="radio"
                      name="tipo-negocio"
                      value={opcao}
                      checked={tipoNegocio === opcao}
                      onChange={() => setTipoNegocio(opcao)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-base text-strong">{opcao}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
            >
              Guardar tipo de negócio
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
