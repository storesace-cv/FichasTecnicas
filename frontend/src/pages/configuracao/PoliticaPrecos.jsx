import React, { useEffect, useMemo, useState } from 'react';
import { useCountry } from '../../services/country';
import {
  DEFAULT_PRICING_POLICY_BY_COUNTRY,
  PRICING_POLICY_OPTIONS,
  applyPricingPolicyDefaultForCountry,
  fetchPricingPolicy,
  getPolicyDetails,
  savePricingPolicy,
} from '../../services/pricingPolicy';

export default function PoliticaPrecos() {
  const country = useCountry();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [estado, setEstado] = useState({ manualOverride: false, country: null });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultPolicyKey = useMemo(
    () => DEFAULT_PRICING_POLICY_BY_COUNTRY[country] || DEFAULT_PRICING_POLICY_BY_COUNTRY.Portugal,
    [country]
  );

  useEffect(() => {
    const carregarPolitica = async () => {
      setLoading(true);
      setErro('');

      try {
        const politicaGuardada = await fetchPricingPolicy();

        if (politicaGuardada?.policyKey) {
          setSelectedPolicy(politicaGuardada.policyKey);
          setEstado({
            manualOverride: Boolean(politicaGuardada.manualOverride),
            country: politicaGuardada.country || country,
          });
          return;
        }

        const politicaPorDefeito = await applyPricingPolicyDefaultForCountry(country);
        setSelectedPolicy(politicaPorDefeito.policyKey || defaultPolicyKey);
        setEstado({
          manualOverride: Boolean(politicaPorDefeito.manualOverride),
          country: politicaPorDefeito.country || country,
        });
      } catch (errorCarregamento) {
        setErro('Não foi possível carregar a política de preços.');
      } finally {
        setLoading(false);
      }
    };

    carregarPolitica();
  }, [country, defaultPolicyKey]);

  const guardar = async (event) => {
    event.preventDefault();
    if (!selectedPolicy) return;

    setSaving(true);
    setErro('');
    try {
      const resposta = await savePricingPolicy(selectedPolicy, country);
      setMensagem('Política de preços guardada com sucesso.');
      setEstado({
        manualOverride: Boolean(resposta.manualOverride),
        country: resposta.country || country,
      });
      setTimeout(() => setMensagem(''), 4000);
    } catch (errorGravacao) {
      setErro('Ocorreu um erro ao guardar a política de preços.');
    } finally {
      setSaving(false);
    }
  };

  const politicaAtual = getPolicyDetails(selectedPolicy);
  const politicaSugestao = getPolicyDetails(defaultPolicyKey);

  return (
    <div className="p-8 md:p-12 lg:p-16 space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Configuração · Regionalização</p>
          <h1 className="text-4xl font-black text-strong">Política de Preços</h1>
          <p className="text-base text-subtle">
            Escolha como o PVP final (já com IVA) deve ser arredondado. Estas políticas são aplicadas após o cálculo pelo Food
            Cost alvo ou pelo Rácio, conforme descrito em docs/15_PRICING_RULES.md.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-strong">Sugestão para {country}</p>
              <p className="text-sm text-subtle">
                {politicaSugestao?.title} é aplicada por defeito quando ainda não existe política guardada.
              </p>
            </div>
            {politicaAtual && (
              <div className="rounded-lg border border-gray-200 bg-surface-muted px-4 py-3 text-sm text-strong">
                <p className="font-semibold">Política em uso: {politicaAtual.title}</p>
                <p className="text-subtle">
                  {estado.manualOverride
                    ? 'Escolhida manualmente — pode alterá-la a qualquer momento.'
                    : `Aplicada automaticamente para ${estado.country || country}.`}
                </p>
              </div>
            )}
          </div>

          {erro && <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{erro}</div>}
          {mensagem && <div className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-800">{mensagem}</div>}

          <form className="space-y-6" onSubmit={guardar}>
            <div className="grid gap-4 md:grid-cols-2">
              {PRICING_POLICY_OPTIONS.map((opcao) => (
                <label
                  key={opcao.key}
                  className={`relative flex h-full cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary ${
                    selectedPolicy === opcao.key ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="pricing-policy"
                      value={opcao.key}
                      checked={selectedPolicy === opcao.key}
                      onChange={() => setSelectedPolicy(opcao.key)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                      disabled={loading || saving}
                    />
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-strong">{opcao.title}</p>
                      <p className="text-sm text-subtle leading-relaxed">{opcao.description}</p>
                      <p className="text-xs font-medium text-muted uppercase tracking-[0.08em]">{opcao.examples}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!selectedPolicy || saving || loading}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'A guardar...' : 'Guardar política de preços'}
              </button>
              <div className="text-sm text-subtle">
                A política escolhida será aplicada ao arredondamento do PVP final em todos os cálculos futuros.
              </div>
            </div>
          </form>
        </div>

        {loading && <p className="text-sm text-subtle">A carregar políticas de preços...</p>}
      </div>
    </div>
  );
}

