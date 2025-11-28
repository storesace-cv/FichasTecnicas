import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { useCurrencySymbol } from '../services/currency';

export default function FichaDetail() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCodigos, setAllCodigos] = useState([]);
  const currencySymbol = useCurrencySymbol();

  useEffect(() => {
    axios.get(`/api/fichas/${codigo}`).then(res => setFicha(res.data));
    axios.get('/api/fichas').then(res => {
      const codigos = res.data.map(f => f.codigo).sort((a, b) => a - b);
      setAllCodigos(codigos);
      setLoading(false);
    });
  }, [codigo]);

  if (loading) return <div className="text-center py-32 text-2xl">A carregar ficha...</div>;
  if (!ficha) return <div className="text-center py-32 text-red-600 text-2xl">Ficha não encontrada</div>;

  const currentIndex = allCodigos.indexOf(codigo);
  const prevCodigo = allCodigos[currentIndex - 1];
  const nextCodigo = allCodigos[currentIndex + 1];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Navegação */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="text-primary-strong hover:underline flex items-center gap-2">
          <ArrowLeftIcon className="w-5 h-5" /> Voltar à lista
        </Link>

        <div className="flex items-center gap-4 text-lg">
          <button
            onClick={() => prevCodigo && navigate(`/ficha/${prevCodigo}`)}
            disabled={!prevCodigo}
            className={`px-5 py-2 rounded-lg font-medium transition ${prevCodigo ? 'bg-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-300)]' : 'bg-[var(--color-neutral-100)] text-muted cursor-not-allowed'}`}
          >
            ← Anterior
          </button>
          <span className="font-semibold text-subtle">{currentIndex + 1} / {allCodigos.length}</span>
          <button
            onClick={() => nextCodigo && navigate(`/ficha/${nextCodigo}`)}
            disabled={!nextCodigo}
            className={`px-5 py-2 rounded-lg font-medium transition ${nextCodigo ? 'bg-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-300)]' : 'bg-[var(--color-neutral-100)] text-muted cursor-not-allowed'}`}
          >
            Próxima →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Foto + Info */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl shadow-xl p-8 sticky top-6">
            <div className="bg-[var(--color-neutral-200)] border-2 border-dashed rounded-xl w-full h-72 mb-6" />
            <h1 className="text-4xl font-bold text-strong">{ficha.nome}</h1>
            <p className="text-2xl font-mono text-primary-strong mt-2">{ficha.codigo}</p>
            <p className="text-lg text-subtle mt-3">Porções: <strong>{ficha.porcoes || 1}</strong></p>

            <div className="mt-8 p-6 bg-success-soft rounded-2xl text-center">
              <p className="text-sm text-subtle uppercase tracking-wider">Custo Total</p>
              <p className="text-5xl font-bold text-success-strong mt-2">
                {ficha.custo_total.toFixed(2)} {currencySymbol}
              </p>
            </div>

            <button className="mt-8 w-full bg-[var(--color-primary-700)] text-on-primary py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold hover:bg-[var(--color-primary-800)] transition">
              <PrinterIcon className="w-7 h-7" /> Imprimir PDF (em breve)
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-surface-strong text-on-primary px-8 py-5">
              <h2 className="text-3xl font-bold">Ingredientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-neutral-100)] text-subtle">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Ingrediente</th>
                    <th className="px-6 py-4 text-right">Qtd</th>
                    <th className="px-6 py-4 text-left">Unidade</th>
                    <th className="px-6 py-4 text-right">PPU</th>
                    <th className="px-6 py-4 text-right font-bold">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {ficha.ingredientes.map((ing, i) => (
                    <tr key={i} className="border-b hover:bg-surface-muted transition">
                      <td className="px-6 py-4 text-subtle">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-strong">{ing.produto.nome}</td>
                      <td className="px-6 py-4 text-right">{ing.quantidade_ficha.toFixed(3)}</td>
                      <td className="px-6 py-4">{ing.ingrediente.unidade}</td>
                      <td className="px-6 py-4 text-right">{ing.produto.preco_unitario.toFixed(3)}</td>
                      <td className="px-6 py-4 text-right font-bold text-success-strong">
                        {ing.custo_parcial.toFixed(2)} {currencySymbol}
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
