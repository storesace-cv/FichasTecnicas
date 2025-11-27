import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';

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
        setFicha(resFicha.data);
        const codigos = resAll.data
          .map(f => f.codigo)
          .sort((a, b) => Number(a) - Number(b));
        setAllCodigos(codigos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [codigo]);

  if (loading) return <div className="flex h-screen items-center justify-center text-4xl">A carregar…</div>;
  if (!ficha) return <div className="flex h-screen items-center justify-center text-4xl text-red-600">Ficha não encontrada</div>;

  const currentIndex = allCodigos.indexOf(codigo);
  const first = allCodigos[0];
  const last = allCodigos[allCodigos.length - 1];
  const prev = allCodigos[currentIndex - 1];
  const next = allCodigos[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BARRA DE NAVEGAÇÃO COMPLETA */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:underline flex items-center gap-3 text-xl font-bold">
            <ArrowLeftIcon className="w-7 h-7" /> Voltar à lista
          </Link>

          <div className="flex items-center gap-6 bg-blue-50 px-8 py-4 rounded-full shadow-2xl">
            {/* Primeira */}
            <button
              onClick={() => navigate(`/ficha/${first}`)}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition ${currentIndex === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'}`}
            >
              <ChevronDoubleLeftIcon className="w-8 h-8" />
            </button>

            {/* Anterior */}
            <button
              onClick={() => prev && navigate(`/ficha/${prev}`)}
              disabled={!prev}
              className={`p-3 rounded-full transition ${!prev ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'}`}
            >
              <ArrowLeftIcon className="w-8 h-8" />
            </button>

            {/* Contador */}
            <span className="text-2xl font-black text-blue-900 min-w-44 text-center px-4">
              {currentIndex + 1} / {allCodigos.length}
            </span>

            {/* Próxima */}
            <button
              onClick={() => next && navigate(`/ficha/${next}`)}
              disabled={!next}
              className={`p-3 rounded-full transition ${!next ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'}`}
            >
              <ArrowRightIcon className="w-8 h-8" />
            </button>

            {/* Última */}
            <button
              onClick={() => navigate(`/ficha/${last}`)}
              disabled={currentIndex === allCodigos.length - 1}
              className={`p-3 rounded-full transition ${currentIndex === allCodigos.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'}`}
            >
              <ChevronDoubleRightIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* RESTO DA FICHA (igual à anterior) */}
      <div className="container mx-auto p-6 max-w-[1920px] mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-10 items-start">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="bg-gray-300 border-2 border-dashed rounded w-full h-64 mb-6"></div>
            <h1 className="text-4xl font-bold">{ficha.nome}</h1>
            <p className="text-2xl text-blue-600 mt-2">{ficha.codigo}</p>
            <p className="text-xl mt-4">Porções: {ficha.porcoes || 1}</p>
            <div className="mt-8 p-6 bg-green-100 rounded text-center">
              <div className="text-5xl font-bold text-green-600">
                {Number(ficha.custo_total).toFixed(2)} €
              </div>
              <div className="text-gray-600 mt-2">Custo total</div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 text-white p-4">
              <h2 className="text-2xl font-bold">Ingredientes</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Ingrediente</th>
                  <th className="px-6 py-3 text-right">Qtd</th>
                  <th className="px-6 py-3 text-left">Unidade</th>
                  <th className="px-6 py-3 text-right">PPU</th>
                  <th className="px-6 py-3 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {(ficha.ingredientes || []).map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{i + 1}</td>
                    <td className="px-6 py-3">{item.produto?.nome || '-'}</td>
                    <td className="px-6 py-3 text-right">{Number(item.quantidade_ficha || 0).toFixed(3)}</td>
                    <td className="px-6 py-3">{item.ingrediente?.unidade || '-'}</td>
                    <td className="px-6 py-3 text-right">{Number(item.produto?.preco_unitario || 0).toFixed(3)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-green-600">
                      {Number(item.custo_parcial || 0).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
