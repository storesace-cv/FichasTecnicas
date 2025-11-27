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
    <div className="min-h-screen bg-[var(--color-neutral-100)] p-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-block mb-8 text-primary-strong hover:underline text-lg">
          ← Voltar à lista
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Lado esquerdo */}
          <div className="bg-surface rounded-xl shadow-lg p-8">
            <div className="bg-[var(--color-neutral-200)] border-2 border-dashed rounded-xl w-full h-80 mb-6" />
            <h1 className="text-4xl font-bold">{ficha.nome}</h1>
            <p className="text-2xl text-primary-strong font-mono mt-2">Código: {ficha.codigo}</p>
            <p className="text-xl mt-4">Porções: <strong>{ficha.porcoes || 1}</strong></p>
            <div className="mt-8 p-6 bg-success-soft rounded-xl text-center">
              <p className="text-5xl font-black text-success-strong">
                {Number(ficha.custo_total).toFixed(2)} €
              </p>
              <p className="text-lg text-subtle mt-2">Custo Total</p>
            </div>
          </div>

          {/* Tabela */}
          <div className="lg:col-span-2 bg-surface rounded-xl shadow-lg overflow-hidden">
            <div className="bg-surface-strong text-on-primary p-6">
              <h2 className="text-3xl font-bold">Ingredientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-neutral-100)]">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Ingrediente</th>
                    <th className="px-6 py-4 text-right">Qtd</th>
                    <th className="px-6 py-4 text-left">Unidade</th>
                    <th className="px-6 py-4 text-right">PPU</th>
                    <th className="px-6 py-4 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {(ficha.ingredientes || []).map((ing, i) => (
                    <tr key={i} className="border-b border-[var(--color-neutral-200)]">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 font-medium">{ing.produto?.nome || '-'}</td>
                      <td className="px-6 py-4 text-right">{Number(ing.quantidade_ficha || 0).toFixed(3)}</td>
                      <td className="px-6 py-4">{ing.ingrediente?.unidade || '-'}</td>
                      <td className="px-6 py-4 text-right">{Number(ing.produto?.preco_unitario || 0).toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-bold text-success-strong">
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
