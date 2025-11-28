import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { mapFichaResponse } from '../../services/fichas';

export default function FichaDetail() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [allCodigos, setAllCodigos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/fichas/${codigo}`),
      axios.get('/api/fichas')
    ])
      .then(([resFicha, resAll]) => {
        const fichaAtual = mapFichaResponse(resFicha.data);
        setFicha(fichaAtual);

        const fichasOrdenadas = (resAll.data || [])
          .map(mapFichaResponse)
          .sort((a, b) => {
            const familiaA = (a.atributosTecnicos?.familia || '').toString();
            const familiaB = (b.atributosTecnicos?.familia || '').toString();
            if (familiaA.localeCompare(familiaB) !== 0) return familiaA.localeCompare(familiaB);

            const subfamiliaA = (a.atributosTecnicos?.subfamilia || '').toString();
            const subfamiliaB = (b.atributosTecnicos?.subfamilia || '').toString();
            if (subfamiliaA.localeCompare(subfamiliaB) !== 0) return subfamiliaA.localeCompare(subfamiliaB);

            const produtoA = (a.nome || a.cabecalho?.nome || '').toString();
            const produtoB = (b.nome || b.cabecalho?.nome || '').toString();
            if (produtoA.localeCompare(produtoB) !== 0) return produtoA.localeCompare(produtoB);

            return Number(a.codigo) - Number(b.codigo);
          });

        setAllCodigos(fichasOrdenadas.map(f => f.codigo));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [codigo]);

  if (loading) return <div className="flex h-screen items-center justify-center text-2xl md:text-4xl px-4">A carregar…</div>;
  if (!ficha) return <div className="flex h-screen items-center justify-center text-2xl md:text-4xl text-red-600 px-4">Ficha não encontrada</div>;

  const currentIndex = allCodigos.indexOf(codigo);
  const first = allCodigos[0];
  const last = allCodigos[allCodigos.length - 1];
  const prev = allCodigos[currentIndex - 1];
  const next = allCodigos[currentIndex + 1];

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* BARRA DE NAVEGAÇÃO COMPLETA */}
      <div className="bg-surface shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex justify-between items-center">
          <Link to="/" className="text-primary-strong hover:underline flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
            <ArrowLeftIcon className="w-6 h-6 sm:w-7 sm:h-7" /> Voltar à lista
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 bg-primary-soft px-4 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl">
            {/* Primeira */}
            <button
              onClick={() => navigate(`/ficha/${first}`)}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition ${currentIndex === 0 ? 'bg-[var(--color-neutral-300)] text-muted cursor-not-allowed' : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'}`}
              aria-label="Início"
            >
              <ChevronDoubleLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline font-semibold tracking-tight">Início</span>
            </button>

            {/* Anterior */}
            <button
              onClick={() => prev && navigate(`/ficha/${prev}`)}
              disabled={!prev}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition ${!prev ? 'bg-[var(--color-neutral-300)] text-muted cursor-not-allowed' : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'}`}
              aria-label="Atrás"
            >
              <ArrowLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline font-semibold tracking-tight">Atrás</span>
            </button>

            {/* Contador */}
            <span className="text-2xl font-black text-primary-strong min-w-44 text-center px-4">
              {currentIndex + 1} / {allCodigos.length}
            </span>

            {/* Próxima */}
            <button
              onClick={() => next && navigate(`/ficha/${next}`)}
              disabled={!next}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition ${!next ? 'bg-[var(--color-neutral-300)] text-muted cursor-not-allowed' : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'}`}
              aria-label="Avançar"
            >
              <ArrowRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline font-semibold tracking-tight">Avançar</span>
            </button>

            {/* Última */}
            <button
              onClick={() => navigate(`/ficha/${last}`)}
              disabled={currentIndex === allCodigos.length - 1}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition ${currentIndex === allCodigos.length - 1 ? 'bg-[var(--color-neutral-300)] text-muted cursor-not-allowed' : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'}`}
              aria-label="Fim"
            >
              <span className="hidden sm:inline font-semibold tracking-tight">Fim</span>
              <ChevronDoubleRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* RESTO DA FICHA (igual à anterior) */}
      <div className="w-full px-4 sm:px-6 mt-6 md:mt-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          <div className="bg-surface p-5 md:p-8 rounded-lg shadow w-full lg:w-[768px] lg:flex-none space-y-3 md:space-y-4">
            <div className="bg-[var(--color-neutral-300)] border-2 border-dashed rounded w-full h-56 sm:h-64 mb-2 md:mb-6"></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold line-clamp-2">{ficha.nome || ficha.cabecalho?.nome}</h1>
            <p className="text-lg sm:text-xl text-primary-strong mt-1 md:mt-2">{ficha.codigo}</p>
            <p className="text-base sm:text-lg md:text-xl mt-2 md:mt-4">Porções: {ficha.cabecalho?.porcoes || 1}</p>
            <div className="mt-4 md:mt-8 p-4 md:p-6 bg-success-soft rounded text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-success-strong">
                {Number(ficha.totais?.custo_total || ficha.custos?.custo_registado || 0).toFixed(2)} €
              </div>
              <div className="text-sm md:text-base text-subtle mt-1 md:mt-2">Custo total</div>
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow overflow-hidden w-full lg:flex-1">
          <div className="bg-surface-strong text-on-primary px-4 sm:px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold">Ingredientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm md:text-base">
                <thead className="bg-surface-muted text-subtle">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left w-12">#</th>
                    <th className="px-4 sm:px-6 py-3 text-left w-64 truncate">Ingrediente</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-28">Qtd</th>
                    <th className="px-4 sm:px-6 py-3 text-left w-28">Unidade</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-28">PPU</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-32">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {(ficha.composicao || []).map((item, i) => (
                    <tr key={i} className="border-b hover:bg-surface-muted">
                      <td className="px-4 sm:px-6 py-3 text-subtle">{i + 1}</td>
                      <td className="px-4 sm:px-6 py-3 font-medium text-strong max-w-xs sm:max-w-none truncate">{item.componente_nome || '—'}</td>
                      <td className="px-4 sm:px-6 py-3 text-right">{Number((item.quantidade ?? item.qtd) ?? 0).toFixed(3)}</td>
                      <td className="px-4 sm:px-6 py-3">{item.unidade || '—'}</td>
                      <td className="px-4 sm:px-6 py-3 text-right">{Number(item.ppu || 0).toFixed(3)}</td>
                      <td className="px-4 sm:px-6 py-3 text-right font-semibold text-success-strong">
                        {Number(item.preco || 0).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
