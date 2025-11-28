import React, { useEffect, useState } from 'react';
import {
  DEFAULT_CURRENCY_BY_COUNTRY,
  getCurrencySettings,
  resetCurrencySettings,
  setCurrencySettings,
  useCurrencyFormatter,
} from '../../services/currency';
import { useCountry } from '../../services/country';

const SYMBOL_POSITION_OPTIONS = [
  { value: 'before', label: 'Antes do valor' },
  { value: 'after', label: 'Depois do valor' },
];

const DECIMAL_SEPARATOR_OPTIONS = [
  { value: ',', label: 'Vírgula (,)' },
  { value: '.', label: 'Ponto (.)' },
];

const THOUSAND_SEPARATOR_OPTIONS = [
  { value: '.', label: 'Ponto (.)' },
  { value: ' ', label: 'Espaço ( )' },
  { value: '', label: 'Sem separador' },
];

export default function Moeda() {
  const { formatCurrency, settings } = useCurrencyFormatter();
  const country = useCountry();
  const [config, setConfig] = useState(getCurrencySettings());
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setConfig(settings);
  }, [settings]);

  const atualizarConfig = (partial) => {
    setConfig((anterior) => ({ ...anterior, ...partial }));
  };

  const guardar = (event) => {
    event.preventDefault();
    setCurrencySettings(config);
    setMensagem('Configuração da moeda atualizada com sucesso.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const repor = () => {
    const defaults = resetCurrencySettings(country);
    setConfig(defaults);
    setMensagem('Definições de moeda repostas para o país selecionado.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const exemplosPorPais = Object.entries(DEFAULT_CURRENCY_BY_COUNTRY).map(([nomePais, definicao]) => ({
    nomePais,
    exemplo: formatCurrency(1250, definicao),
  }));

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Regionalização</p>
          <h1 className="text-4xl font-black text-strong">Moeda</h1>
          <p className="text-base text-subtle">
            Ajuste símbolo, posição e separadores dos valores monetários. As definições mudam automaticamente com o país,
            mas podem ser personalizadas.
          </p>
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
                value={config.symbol}
                onChange={(event) => atualizarConfig({ symbol: event.target.value })}
                placeholder="Exemplo: €, R$, $"
                maxLength={5}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-subtle">Este símbolo será exibido em cálculos e listagens.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-strong">Posição do símbolo</span>
                <div className="grid gap-3">
                  {SYMBOL_POSITION_OPTIONS.map((opcao) => (
                    <label
                      key={opcao.value}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:border-primary"
                    >
                      <input
                        type="radio"
                        name="posicao-simbolo"
                        value={opcao.value}
                        checked={config.symbolPosition === opcao.value}
                        onChange={() => atualizarConfig({ symbolPosition: opcao.value })}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-base text-strong">{opcao.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-strong">Separador decimal</span>
                <div className="grid gap-3">
                  {DECIMAL_SEPARATOR_OPTIONS.map((opcao) => (
                    <label
                      key={opcao.value}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:border-primary"
                    >
                      <input
                        type="radio"
                        name="separador-decimal"
                        value={opcao.value}
                        checked={config.decimalSeparator === opcao.value}
                        onChange={() => atualizarConfig({ decimalSeparator: opcao.value })}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-base text-strong">{opcao.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-strong" htmlFor="separador-milhar">
                  Separador de milhar
                </label>
                <select
                  id="separador-milhar"
                  value={config.thousandSeparator}
                  onChange={(event) => atualizarConfig({ thousandSeparator: event.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base shadow-sm focus:border-primary focus:outline-none"
                >
                  {THOUSAND_SEPARATOR_OPTIONS.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-subtle">Personalize a forma como os milhares são agrupados.</p>
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-strong" htmlFor="espaco-simbolo">
                  <input
                    id="espaco-simbolo"
                    type="checkbox"
                    checked={config.symbolSpacing}
                    onChange={(event) => atualizarConfig({ symbolSpacing: event.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  Usar espaço entre valor e símbolo
                </label>
                <p className="text-sm text-subtle">Desative para colocar o símbolo imediatamente após o número.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong"
              >
                Guardar definições
              </button>
              <button
                type="button"
                onClick={repor}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-strong font-semibold shadow-sm transition hover:border-primary hover:text-primary"
              >
                Repor para o país ({country})
              </button>
            </div>
          </form>

          {mensagem && (
            <div className="rounded-lg bg-success-50 text-success-800 px-4 py-3 text-sm font-medium">{mensagem}</div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-3">
          <h2 className="text-lg font-bold text-strong">Exemplos por país</h2>
          <p className="text-sm text-subtle">Ao alterar o país, estas definições são aplicadas automaticamente.</p>
          <ul className="grid gap-3 md:grid-cols-3">
            {exemplosPorPais.map(({ nomePais, exemplo }) => (
              <li key={nomePais} className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-strong">{nomePais}</p>
                <p className="text-base text-subtle">{exemplo}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
