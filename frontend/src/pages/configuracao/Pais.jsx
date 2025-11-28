import React, { useEffect, useState } from 'react';
import { COUNTRY_OPTIONS, getCountry, setCountry } from '../../services/country';

export default function Pais() {
  const [paisSelecionado, setPaisSelecionado] = useState(getCountry());
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setPaisSelecionado(getCountry());
  }, []);

  const guardar = (event) => {
    event.preventDefault();
    setCountry(paisSelecionado);
    setMensagem('País atualizado com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Regionalização</p>
          <h1 className="text-4xl font-black text-strong">País</h1>
          <p className="text-base text-subtle">
            Escolha o país para ajustar as preferências regionais da aplicação.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <form className="space-y-6" onSubmit={guardar}>
            <fieldset className="space-y-4">
              <legend className="block text-sm font-semibold text-strong mb-1">País</legend>
              <div className="grid gap-3">
                {COUNTRY_OPTIONS.map((opcao) => (
                  <label
                    key={opcao}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:border-primary"
                  >
                    <input
                      type="radio"
                      name="pais"
                      value={opcao}
                      checked={paisSelecionado === opcao}
                      onChange={() => setPaisSelecionado(opcao)}
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
              Guardar país
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
