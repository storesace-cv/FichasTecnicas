import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon, PrinterIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { mapFichaResponse } from '../../services/fichas';

export default function FichaDetail() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [allCodigos, setAllCodigos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega a ficha atual + todos os códigos
    Promise.all([
      axios.get(`/api/fichas/${codigo}`),
      axios.get('/api/fichas')
    ]).then(([resFicha, resAll]) => {
      setFicha(mapFichaResponse(resFicha.data));
      const codigos = resAll.data.map(f => f.codigo).sort((a, b) => a - b);
      setAllCodigos(codigos);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [codigo]);

  if (loading) return <div className="text-center py-32 text-3xl">A carregar...</div>;
  if (!ficha) return <div className="text-center py-32 text-error-strong text-3xl">Ficha não encontrada</div>;

  const currentIndex = allCodigos.indexOf(codigo);
  const prevCodigo = allCodigos[currentIndex - 1];
  const nextCodigo = allCodigos[currentIndex + 1];

  const custoBadge = useMemo(() => {
    if (!ficha?.custos) return null;
    const diferenca = ficha.custos.diferenca;
    const consistente = ficha.custos.consistente;
    return consistente ? (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-success-strong bg-success-soft px-3 py-1 rounded-full">
        <ShieldCheckIcon className="w-5 h-5" /> Custo consistente
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-warning-strong bg-warning-soft px-3 py-1 rounded-full">
        <ExclamationTriangleIcon className="w-5 h-5" /> Diferença {diferenca.toFixed(2)} €
      </span>
    );
  }, [ficha]);

  return (
    <div className="min-h-screen bg-surface-muted py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Navegação com setas */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="text-primary-strong hover:underline flex items-center gap-2 text-lg w-fit">
            <ArrowLeftIcon className="w-6 h-6" /> Voltar
          </Link>

          <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
            {custoBadge}
            <div className="flex items-center gap-6 bg-surface px-6 py-3 rounded-full shadow-lg">
              <button
                onClick={() => prevCodigo && navigate(`/ficha/${prevCodigo}`)}
                disabled={!prevCodigo}
                className={`p-3 rounded-full transition ${prevCodigo ? 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)]' : 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'}`}
              >
                <ArrowLeftIcon className="w-7 h-7" />
              </button>
              <span className="text-xl font-bold text-subtle min-w-32 text-center">
                {currentIndex + 1} / {allCodigos.length}
              </span>
              <button
                onClick={() => nextCodigo && navigate(`/ficha/${nextCodigo}`)}
                disabled={!nextCodigo}
                className={`p-3 rounded-full transition ${nextCodigo ? 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)]' : 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'}`}
              >
                <ArrowRightIcon className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>

        {/* Cabeçalho e resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-surface rounded-2xl shadow-2xl p-8 space-y-6 lg:col-span-1">
            <div className="bg-[var(--color-neutral-200)] border-2 border-dashed rounded-xl w-full h-64" />
            <div>
              <h1 className="text-4xl font-black text-strong">{ficha.nome}</h1>
              <p className="text-xl font-mono text-primary-strong mt-2">{ficha.codigo}</p>
              <p className="text-sm text-muted">Unidade base: {ficha.cabecalho.unidade_base}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-success-soft rounded-xl">
                <p className="text-sm text-subtle">Custo registado</p>
                <p className="text-3xl font-black text-success-strong">{ficha.totais.custo_total.toFixed(2)} €</p>
              </div>
              <div className="p-4 bg-surface-muted rounded-xl">
                <p className="text-sm text-subtle">Custo calculado</p>
                <p className="text-3xl font-black text-strong">{ficha.custos.custo_calculado.toFixed(2)} €</p>
              </div>
              <div className="p-4 bg-warning-soft rounded-xl">
                <p className="text-sm text-subtle">Peso total</p>
                <p className="text-3xl font-black text-warning-strong">{ficha.totais.peso_total.toFixed(3)} {ficha.cabecalho.unidade_base}</p>
              </div>
              <div className="p-4 bg-primary-soft rounded-xl">
                <p className="text-sm text-subtle">Custo / unidade base</p>
                <p className="text-3xl font-black text-primary-strong">{ficha.totais.custo_por_unidade_base.toFixed(3)} €</p>
              </div>
            </div>

            <button className="w-full bg-[var(--color-primary-700)] text-on-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-primary-800)] transition shadow-lg">
              <PrinterIcon className="w-7 h-7" />
              Imprimir PDF (em breve)
            </button>
          </div>

          {/* Tabela de composição */}
          <div className="lg:col-span-2 bg-surface rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-surface-strong text-on-primary px-6 md:px-10 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold">Composição</h2>
                <p className="text-sm text-muted">Ordem original e unidades base</p>
              </div>
              {custoBadge}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-neutral-100)] text-subtle font-bold">
                  <tr>
                    <th className="px-6 py-4 text-left">Ordem</th>
                    <th className="px-6 py-4 text-left">Código</th>
                    <th className="px-6 py-4 text-left">Ingrediente</th>
                    <th className="px-6 py-4 text-right">Qtd</th>
                    <th className="px-6 py-4 text-left">Unidade</th>
                    <th className="px-6 py-4 text-right">PPU</th>
                    <th className="px-6 py-4 text-right">Custo</th>
                    <th className="px-6 py-4 text-right">Peso</th>
                    <th className="px-6 py-4 text-left">Alergénios</th>
                  </tr>
                </thead>
                <tbody>
                  {ficha.composicao.map((ing, i) => (
                    <tr key={`${ing.componente_codigo || 'linha'}-${i}`} className="border-b border-[var(--color-neutral-200)] hover:bg-surface-muted transition">
                      <td className="px-6 py-4 text-subtle font-medium">{ing.ordem}</td>
                      <td className="px-6 py-4 font-mono text-sm text-subtle">{ing.componente_codigo || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-strong">{ing.componente_nome || '—'}</td>
                      <td className="px-6 py-4 text-right">{Number(ing.quantidade).toFixed(3)}</td>
                      <td className="px-6 py-4">{ing.unidade}</td>
                      <td className="px-6 py-4 text-right">{Number(ing.ppu).toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-bold text-success-strong">{Number(ing.preco).toFixed(2)} €</td>
                      <td className="px-6 py-4 text-right">{Number(ing.peso).toFixed(3)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(ing.alergenos || []).map(al => (
                            <span key={`${al.codigo}-${ing.ordem}`} className="text-xs bg-error-soft text-error-strong px-2 py-1 rounded-full border border-[var(--color-error-200)]">
                              {al.nome || al.codigo}
                            </span>
                          ))}
                          {(!ing.alergenos || ing.alergenos.length === 0) && <span className="text-xs text-muted">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totais, alergénios e preparação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-surface rounded-2xl shadow p-6 space-y-3 lg:col-span-1">
            <h3 className="text-xl font-bold text-strong">Totais</h3>
            <div className="flex items-center justify-between text-subtle">
              <span>Peso total</span>
              <strong>{ficha.totais.peso_total.toFixed(3)} {ficha.cabecalho.unidade_base}</strong>
            </div>
            <div className="flex items-center justify-between text-subtle">
              <span>Custo total</span>
              <strong>{ficha.totais.custo_total.toFixed(2)} €</strong>
            </div>
            <div className="flex items-center justify-between text-subtle">
              <span>Custo / unidade base</span>
              <strong>{ficha.totais.custo_por_unidade_base.toFixed(3)} €</strong>
            </div>
            {custoBadge}
          </div>

          <div className="bg-surface rounded-2xl shadow p-6 space-y-3 lg:col-span-1">
            <h3 className="text-xl font-bold text-strong">Alergénios do produto</h3>
            {ficha.alergenos.length === 0 ? (
              <p className="text-muted">Nenhum alergénio associado às linhas desta ficha.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ficha.alergenos.map(al => (
                  <span key={al.codigo} className="text-sm bg-error-soft text-error-strong px-3 py-1 rounded-full border border-[var(--color-error-200)]">
                    {al.nome || al.codigo}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl shadow p-6 space-y-3 lg:col-span-1">
            <h3 className="text-xl font-bold text-strong">Preparação</h3>
            {ficha.preparacao_html ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ficha.preparacao_html }} />
            ) : (
              <p className="text-muted">Sem instruções de preparação associadas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
