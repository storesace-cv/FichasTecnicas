import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { mapFichaResponse } from '../services/fichas';

const normalizarCampoOrdenacao = (valor) => (valor ?? '').toString().trim();

const ordenarPorHierarquiaProdutos = (lista = []) => {
  const locale = 'pt-PT';
  const compareStrings = (a, b) => a.localeCompare(b, locale, { sensitivity: 'base', numeric: true });

  return [...lista].sort((a, b) => {
    const familiaA = normalizarCampoOrdenacao(a.atributosTecnicos?.familia || a.cabecalho?.familia);
    const familiaB = normalizarCampoOrdenacao(b.atributosTecnicos?.familia || b.cabecalho?.familia);
    const familiaCmp = compareStrings(familiaA, familiaB);
    if (familiaCmp !== 0) return familiaCmp;

    const subfamiliaA = normalizarCampoOrdenacao(a.atributosTecnicos?.subfamilia || a.cabecalho?.subfamilia);
    const subfamiliaB = normalizarCampoOrdenacao(b.atributosTecnicos?.subfamilia || b.cabecalho?.subfamilia);
    const subfamiliaCmp = compareStrings(subfamiliaA, subfamiliaB);
    if (subfamiliaCmp !== 0) return subfamiliaCmp;

    const produtoA = normalizarCampoOrdenacao(a.nome || a.cabecalho?.nome);
    const produtoB = normalizarCampoOrdenacao(b.nome || b.cabecalho?.nome);
    const produtoCmp = compareStrings(produtoA, produtoB);
    if (produtoCmp !== 0) return produtoCmp;

    return compareStrings(normalizarCampoOrdenacao(a.codigo), normalizarCampoOrdenacao(b.codigo));
  });
};

const obterFamiliaFicha = (ficha) => ficha?.atributosTecnicos?.familia || ficha?.cabecalho?.familia || '';
const obterSubfamiliaFicha = (ficha) => ficha?.atributosTecnicos?.subfamilia || ficha?.cabecalho?.subfamilia || '';

export default function FichaList() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [selectedSubfamily, setSelectedSubfamily] = useState('');

  useEffect(() => {
    axios.get('/api/fichas')
      .then(res => {
        setFichas((res.data || []).map(mapFichaResponse));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const familyOptions = useMemo(() => {
    const mapa = new Map();

    fichas.forEach((ficha) => {
      const familia = obterFamiliaFicha(ficha);
      const subfamilia = obterSubfamiliaFicha(ficha);

      if (!familia && !subfamilia) return;

      if (!mapa.has(familia)) {
        mapa.set(familia, new Set());
      }

      if (subfamilia) {
        mapa.get(familia).add(subfamilia);
      }
    });

    return mapa;
  }, [fichas]);

  const availableFamilies = useMemo(
    () => Array.from(familyOptions.keys()).filter(Boolean),
    [familyOptions],
  );

  const availableSubfamilies = useMemo(() => {
    if (selectedFamilies.length === 0) {
      return Array.from(familyOptions.values())
        .reduce((acc, subfamilias) => [...acc, ...subfamilias], [])
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base', numeric: true }));
    }

    const subfamiliasAssociadas = new Set();
    selectedFamilies.forEach((familia) => {
      const subfamilias = familyOptions.get(familia);
      subfamilias?.forEach((sub) => subfamiliasAssociadas.add(sub));
    });

    return Array.from(subfamiliasAssociadas.values())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base', numeric: true }));
  }, [familyOptions, selectedFamilies]);

  useEffect(() => {
    if (selectedSubfamily && !availableSubfamilies.includes(selectedSubfamily)) {
      setSelectedSubfamily('');
    }
  }, [availableSubfamilies, selectedSubfamily]);

  const filtered = fichas.filter((ficha) => {
    const termoPesquisa = search.toLowerCase();
    const familia = obterFamiliaFicha(ficha);
    const subfamilia = obterSubfamiliaFicha(ficha);

    const correspondePesquisa =
      ficha?.codigo?.toLowerCase().includes(termoPesquisa) ||
      ficha?.nome?.toLowerCase().includes(termoPesquisa);

    const correspondeFamilia =
      selectedFamilies.length === 0 || selectedFamilies.includes(familia);

    const correspondeSubfamilia =
      !selectedSubfamily || subfamilia === selectedSubfamily;

    return correspondePesquisa && correspondeFamilia && correspondeSubfamilia;
  });

  const ordered = ordenarPorHierarquiaProdutos(filtered);

  if (loading) return <div className="text-center py-16 md:py-20 text-xl md:text-2xl px-4">A carregar fichas...</div>;

  return (
    <div className="max-w-[90rem] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-4 md:py-5 bg-surface-muted/95 backdrop-blur supports-[backdrop-filter]:bg-surface-muted/80 border-b border-soft shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-strong">Fichas Técnicas ({ordered.length})</h2>
            <input
              type="text"
              placeholder="Pesquisar código ou nome..."
              className="px-3 sm:px-4 py-2.5 sm:py-3 border border-soft rounded-lg text-base sm:text-lg w-full md:w-80 bg-surface text-subtle placeholder:text-muted focus:ring-2 focus:ring-primary-strong/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-base font-semibold text-strong">Famílias</p>
                {selectedFamilies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFamilies([])}
                    className="text-sm text-primary-strong hover:underline"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableFamilies.map((familia) => {
                  const ativa = selectedFamilies.includes(familia);
                  return (
                    <button
                      key={familia}
                      type="button"
                      onClick={() =>
                        setSelectedFamilies((prev) =>
                          prev.includes(familia)
                            ? prev.filter((item) => item !== familia)
                            : [...prev, familia],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition shadow-sm ${
                        ativa
                          ? 'bg-primary-soft border-primary-strong text-primary-strong'
                          : 'bg-surface border-soft text-strong hover:border-primary-soft'
                      }`}
                    >
                      {familia}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full lg:w-72 space-y-2">
              <label className="text-base font-semibold text-strong" htmlFor="subfamilia-select">
                Sub família
              </label>
              <select
                id="subfamilia-select"
                value={selectedSubfamily}
                onChange={(e) => setSelectedSubfamily(e.target.value)}
                className="w-full border border-soft rounded-lg px-3 py-2.5 bg-surface text-strong focus:ring-2 focus:ring-primary-strong/50"
              >
                <option value="">Todas</option>
                {availableSubfamilies.map((subfamilia) => (
                  <option key={subfamilia} value={subfamilia}>
                    {subfamilia}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="text-center py-24 sm:py-32 bg-surface rounded-2xl shadow-card border border-soft px-6">
          <DocumentTextIcon className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-muted" />
          <p className="text-xl sm:text-2xl text-strong">Ainda não tens fichas técnicas</p>
          <p className="text-base sm:text-lg text-subtle mt-2">Vai a "Importar Excel" e carrega o teu ficheiro do NET-bo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {ordered.map(ficha => (
            <Link key={ficha.codigo} to={`/fichas/${ficha.codigo}`} className="block">
              <div className="bg-surface rounded-xl shadow-card overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-soft">
                {ficha.imagem_prato && (
                  <img src={`/api/images/${ficha.imagem_prato}`} alt={ficha.nome} className="w-full h-44 sm:h-48 object-cover" />
                )}
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                      <span className="text-xs sm:text-sm font-mono bg-primary-soft text-primary-strong px-2.5 sm:px-3 py-1 rounded-full truncate">
                        {ficha.codigo}
                      </span>
                      <span className="text-xs sm:text-sm text-subtle whitespace-nowrap">{ficha.cabecalho?.porcoes || 1} porções</span>
                    </div>
                  <h3 className="text-lg sm:text-xl font-bold text-strong mb-2 sm:mb-3 line-clamp-2">{ficha.nome}</h3>
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold text-success-strong">
                      {(ficha.totais?.custo_total || ficha.custos?.custo_registado || 0).toFixed(2)} €
                    </p>
                    <p className="text-xs sm:text-sm text-muted">custo total</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
