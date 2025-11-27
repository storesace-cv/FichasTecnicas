import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function FichaDetail() {
  const { codigo } = useParams();
  const [ficha, setFicha] = useState(null);

  useEffect(() => {
    axios.get(`/api/fichas/${codigo}`)
      .then(res => setFicha(res.data))
      .catch(() => setFicha(null));
  }, [codigo]);

  if (!ficha) return <div className="p-20 text-center text-3xl">A carregar ou ficha não encontrada...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)] px-4 py-6 sm:py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-block mb-6 sm:mb-8 text-primary-strong hover:underline text-base sm:text-lg">
          ← Voltar à lista
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Lado esquerdo */}
          <div className="bg-surface rounded-xl shadow-lg p-5 sm:p-8">
            <div className="bg-[var(--color-neutral-200)] border-2 border-dashed rounded-xl w-full h-64 sm:h-80 mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold line-clamp-2">{ficha.nome}</h1>
            <p className="text-xl sm:text-2xl text-primary-strong font-mono mt-2">Código: {ficha.codigo}</p>
            <p className="text-lg sm:text-xl mt-3 sm:mt-4">Porções: <strong>{ficha.porcoes || 1}</strong></p>
            <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-success-soft rounded-xl text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-success-strong">
                {Number(ficha.custo_total).toFixed(2)} €
              </p>
              <p className="text-base sm:text-lg text-subtle mt-1 sm:mt-2">Custo Total</p>
            </div>
          </div>

          {/* Tabela */}
          <div className="lg:col-span-2 bg-surface rounded-xl shadow-lg overflow-hidden">
            <div className="bg-surface-strong text-on-primary px-4 sm:px-6 py-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Ingredientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm md:text-base">
                <thead className="bg-[var(--color-neutral-100)] text-subtle font-semibold">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left w-12">#</th>
                    <th className="px-4 sm:px-6 py-3 text-left w-72 max-w-[18rem] truncate">Ingrediente</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-28">Qtd</th>
                    <th className="px-4 sm:px-6 py-3 text-left w-28">Unidade</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-28">PPU</th>
                    <th className="px-4 sm:px-6 py-3 text-right w-32">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {(ficha.ingredientes || []).map((ing, i) => (
                    <tr key={i} className="border-b border-[var(--color-neutral-200)]">
                      <td className="px-4 sm:px-6 py-3 text-subtle">{i + 1}</td>
                      <td className="px-4 sm:px-6 py-3 font-medium max-w-[18rem] truncate">{ing.produto?.nome || '-'}</td>
                      <td className="px-4 sm:px-6 py-3 text-right">{Number(ing.quantidade_ficha || 0).toFixed(3)}</td>
                      <td className="px-4 sm:px-6 py-3">{ing.ingrediente?.unidade || '-'}</td>
                      <td className="px-4 sm:px-6 py-3 text-right">{Number(ing.produto?.preco_unitario || 0).toFixed(3)}</td>
                      <td className="px-4 sm:px-6 py-3 text-right font-bold text-success-strong">
                        {Number(ing.custo_parcial || 0).toFixed(2)} €
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
