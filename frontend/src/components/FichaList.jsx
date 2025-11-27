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
        <h2 className="text-3xl font-bold text-gray-800">Fichas Técnicas ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Pesquisar código ou nome..."
          className="px-4 py-3 border rounded-lg text-lg w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-32">
          <DocumentTextIcon className="w-32 h-32 mx-auto mb-6 text-gray-300" />
          <p className="text-2xl text-gray-600">Ainda não tens fichas técnicas</p>
          <p className="text-lg text-gray-500 mt-2">Vai a "Importar Excel" e carrega o teu ficheiro do NET-bo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(ficha => (
            <Link key={ficha.codigo} to={`/ficha/${ficha.codigo}`} className="block">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                {ficha.imagem_prato && (
                  <img src={`/api/images/${ficha.imagem_prato}`} alt={ficha.nome} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {ficha.codigo}
                      </span>
                      <span className="text-sm text-gray-600">{ficha.cabecalho?.porcoes || 1} porções</span>
                    </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{ficha.nome}</h3>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {(ficha.totais?.custo_total || ficha.custos?.custo_registado || 0).toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-500">custo total</p>
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
