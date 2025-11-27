import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon, PrinterIcon } from '@heroicons/react/24/outline';

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
      setFicha(resFicha.data);
      const codigos = resAll.data.map(f => f.codigo).sort((a, b) => a - b);
      setAllCodigos(codigos);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [codigo]);

  if (loading) return <div className="text-center py-32 text-3xl">A carregar...</div>;
  if (!ficha) return <div className="text-center py-32 text-red-600 text-3xl">Ficha não encontrada</div>;

  const currentIndex = allCodigos.indexOf(codigo);
  const prevCodigo = allCodigos[currentIndex - 1];
  const nextCodigo = allCodigos[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Navegação com setas */}
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center mb-8">
        <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2 text-lg">
          <ArrowLeftIcon className="w-6 h-6" /> Voltar
        </Link>

        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full shadow-lg">
          <button
            onClick={() => prevCodigo && navigate(`/ficha/${prevCodigo}`)}
            disabled={!prevCodigo}
            className={`p-3 rounded-full transition ${prevCodigo ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <ArrowLeftIcon className="w-7 h-7" />
          </button>
          <span className="text-xl font-bold text-gray-700 min-w-32 text-center">
            {currentIndex + 1} / {allCodigos.length}
          </span>
          <button
            onClick={() => nextCodigo && navigate(`/ficha/${nextCodigo}`)}
            disabled={!nextCodigo}
            className={`p-3 rounded-full transition ${nextCodigo ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <ArrowRightIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Conteúdo da ficha (igual ao que tinhas antes, mas mais bonito) */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-8">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 mb-6" />
          <h1 className="text-4xl font-black text-gray-800">{ficha.nome}</h1>
          <p className="text-3xl font-mono text-blue-600 mt-3">{ficha.codigo}</p>
          <p className="text-xl text-gray-600 mt-4">Porções: <strong>{ficha.porcoes}</strong></p>

          <div className="mt-10 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl text-center">
            <p className="text-lg text-gray-700 font-semibold">Custo Total</p>
            <p className="text-6xl font-black text-green-600 mt-3">
              {ficha.custo_total.toFixed(2)} €
           ccf>
          </div>

          <button className="mt-8 w-full bg-blue-700 text-white py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-4 hover:bg-blue-800 transition shadow-lg">
            <PrinterIcon className="w-8 h-8" />
            Imprimir PDF (em breve)
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-black text-white px-10 py-6">
              <h2 className="text-4xl font-bold">Ingredientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-gray-700 font-bold">
                  <tr>
                    <th className="px-8 py-5 text-left">#</th>
                    <th className="px-8 py-5 text-left">Ingrediente</th>
                    <th className="px-8 py-5 text-right">Qtd</th>
                    <th className="px-8 py-5 text-left">Unidade</th>
                    <th className="px-8 py-5 text-right">PPU</th>
                    <th className="px-8 py-5 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {ficha.ingredientes.map((ing, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition">
                      <td className="px-8 py-5 text-gray-600 font-medium">{i + 1}</td>
                      <td className="px-8 py-5 font-semibold text-gray-800">{ing.produto.nome}</td>
                      <td className="px-8 py-5 text-right">{Number(ing.quantidade_ficha).toFixed(3)}</td>
                      <td className="px-8 py-5">{ing.ingrediente.unidade}</td>
                      <td className="px-8 py-5 text-right">{Number(ing.produto.preco_unitario).toFixed(3)}</td>
                      <td className="px-8 py-5 text-right font-bold text-green-600">
                        {Number(ing.custo_parcial).toFixed(2)} €
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
