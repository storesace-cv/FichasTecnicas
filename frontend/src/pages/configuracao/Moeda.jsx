import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'configuracao_moeda_simbolo';

export default function Moeda() {
  const [simbolo, setSimbolo] = useState('€');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const simboloGuardado = localStorage.getItem(STORAGE_KEY);
    if (simboloGuardado) {
      setSimbolo(simboloGuardado);
    }
  }, []);

  const guardar = (event) => {
    event.preventDefault();
    const valor = simbolo.trim();
    localStorage.setItem(STORAGE_KEY, valor);
    setMensagem('Símbolo da moeda atualizado com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Regionalização</p>
          <h1 className="text-4xl font-black text-strong">Moeda</h1>
          <p className="text-base text-subtle">Defina o símbolo da moeda a utilizar nas fichas e cálculos.</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-4">
          <form className="space-y-6" onSubmit={guardar}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-strong" htmlFor="simbolo-moeda">
                Símbolo da moeda
              </label>
              <input
                id="simbolo-moeda"
                type="text"
                value={simbolo}
                onChange={(event) => setSimbolo(event.target.value)}
                placeholder="Exemplo: €, R$, $"
                maxLength={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">Este símbolo será exibido em cálculos e listagens.</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
            >
              Guardar símbolo
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
