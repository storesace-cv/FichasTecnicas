import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { mapFichaResponse } from '../services/fichas';

export default function FichaList() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/fichas')
      .then(res => {
        setFichas((res.data || []).map(mapFichaResponse));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = fichas.filter(f =>
    f?.codigo?.toLowerCase().includes(search.toLowerCase()) ||
    f?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-16 md:py-20 text-xl md:text-2xl px-4">A carregar fichas...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-strong">Fichas Técnicas ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Pesquisar código ou nome..."
          className="px-3 sm:px-4 py-2.5 sm:py-3 border border-soft rounded-lg text-base sm:text-lg w-full sm:w-96 bg-surface text-subtle placeholder:text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 sm:py-32 bg-surface rounded-2xl shadow-card border border-soft px-6">
          <DocumentTextIcon className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-muted" />
          <p className="text-xl sm:text-2xl text-strong">Ainda não tens fichas técnicas</p>
          <p className="text-base sm:text-lg text-subtle mt-2">Vai a "Importar Excel" e carrega o teu ficheiro do NET-bo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map(ficha => (
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
