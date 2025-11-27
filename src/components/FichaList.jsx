import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function FichaList() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/fichas')
      .then(res => {
        setFichas(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = fichas.filter(f =>
    f.codigo.toLowerCase().includes(search.toLowerCase()) ||
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-xl">A carregar fichas...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Fichas Técnicas ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Procurar por código ou nome..."
          className="px-4 py-2 border rounded-lg w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <DocumentTextIcon className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Nenhuma ficha técnica encontrada</p>
          <p className="mt-2">Importa o teu Excel para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ficha => (
            <div key={ficha.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {ficha.codigo}
                </span>
                <span className="text-xs text-gray-500">{ficha.porcoes} porções</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{ficha.nome}</h3>
              <div className="text-right mt-4">
                <p className="text-2xl font-bold text-green-600">
                  {(ficha.custo_total || 0).toFixed(2)} €
                </p>
                <p className="text-sm text-gray-500">custo total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
