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

  if (loading) return <div className="text-center py-20 text-2xl">A carregar fichas...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-strong">Fichas Técnicas ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Pesquisar código ou nome..."
          className="px-4 py-3 border border-soft rounded-lg text-lg w-96 bg-surface text-subtle placeholder:text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-32 bg-surface rounded-2xl shadow-card border border-soft">
          <DocumentTextIcon className="w-24 h-24 mx-auto mb-6 text-muted" />
          <p className="text-2xl text-strong">Ainda não tens fichas técnicas</p>
          <p className="text-lg text-subtle mt-2">Vai a "Importar Excel" e carrega o teu ficheiro do NET-bo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(ficha => (
            <Link key={ficha.codigo} to={`/fichas/${ficha.codigo}`} className="block">
              <div className="bg-surface rounded-xl shadow-card overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-soft">
                {ficha.imagem_prato && (
                  <img src={`/api/images/${ficha.imagem_prato}`} alt={ficha.nome} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-mono bg-primary-soft text-primary-strong px-3 py-1 rounded-full">
                        {ficha.codigo}
                      </span>
                      <span className="text-sm text-subtle">{ficha.cabecalho?.porcoes || 1} porções</span>
                    </div>
                  <h3 className="text-xl font-bold text-strong mb-3 line-clamp-2">{ficha.nome}</h3>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-success-strong">
                      {(ficha.totais?.custo_total || ficha.custos?.custo_registado || 0).toFixed(2)} €
                    </p>
                    <p className="text-sm text-muted">custo total</p>
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
