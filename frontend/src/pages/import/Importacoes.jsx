import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentArrowUpIcon, CurrencyEuroIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Importacoes() {
  return (
    <div className="p-16">
      <h1 className="text-6xl font-black text-strong mb-12 text-center">Importações</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        <Link to="/importar/produtos"  className="block group">
          <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-800)] text-on-primary rounded-3xl shadow-2xl p-20 text-center transform group-hover:scale-105 transition">
            <ClipboardDocumentListIcon className="w-32 h-32 mx-auto mb-8" />
            <h2 className="text-4xl font-bold">Importar Produtos Base</h2>
          </div>
        </Link>
        <Link to="/importar/precos" className="block group">
          <div className="bg-gradient-to-br from-[var(--color-success-600)] to-[var(--color-success-700)] text-on-primary rounded-3xl shadow-2xl p-20 text-center transform group-hover:scale-105 transition">
            <CurrencyEuroIcon className="w-32 h-32 mx-auto mb-8" />
            <h2 className="text-4xl font-bold">Importar Preços & Taxas</h2>
          </div>
        </Link>
        <Link to="/importar/fichas" className="block group">
          <div className="bg-gradient-to-br from-[var(--color-secondary-400)] to-[var(--color-secondary-800)] text-on-primary rounded-3xl shadow-2xl p-20 text-center transform group-hover:scale-105 transition">
            <DocumentArrowUpIcon className="w-32 h-32 mx-auto mb-8" />
            <h2 className="text-4xl font-bold">Importar Fichas Técnicas</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}
