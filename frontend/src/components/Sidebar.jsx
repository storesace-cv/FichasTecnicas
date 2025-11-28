import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  ServerStackIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  GlobeEuropeAfricaIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const [openSections, setOpenSections] = useState({ "Base de Dados": false, Configuração: false });
  const [isResetting, setIsResetting] = useState(false);

  const menu = [
    { to: "/", nome: "Fichas", icone: <HomeIcon className="w-6 h-6" /> },
    {
      nome: "Base de Dados",
      icone: <ServerStackIcon className="w-6 h-6" />,
      children: [
        { to: "/importacoes", nome: "Importações", icone: <DocumentArrowUpIcon className="w-6 h-6" /> },
        { to: "/referencias", nome: "Tabelas de Referência", icone: <Squares2X2Icon className="w-6 h-6" /> },
        { nome: "Reset da BD", acao: "reset", icone: <ArrowPathIcon className="w-6 h-6" /> },
      ],
    },
    {
      nome: "Configuração",
      icone: <Cog6ToothIcon className="w-6 h-6" />,
      children: [
        {
          nome: "Regionalização",
          icone: <GlobeEuropeAfricaIcon className="w-6 h-6" />,
          children: [
            { to: "/configuracao/regionalizacao/moeda", nome: "Moeda" },
          ],
        },
        {
          nome: "Food Cost",
          icone: <CurrencyDollarIcon className="w-6 h-6" />,
          children: [
            { to: "/configuracao/food-cost/tipo-negocio", nome: "Tipo de Negócio" },
            { to: "/configuracao/food-cost/intervalos", nome: "Intervalos de Food Cost" },
            { to: "/configuracao/food-cost/custos-operacionais", nome: "Custos Operacionais" },
          ],
        },
      ],
    },
  ];

  const toggleSection = (nome) => {
    setOpenSections((prev) => ({ ...prev, [nome]: !prev[nome] }));
  };

  const handleResetDb = async () => {
    if (isResetting) return;

    const confirmed = window.confirm(
      "Tem a certeza que pretende apagar todos os dados? Esta ação não pode ser revertida."
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      const response = await axios.post('/api/reset-db');
      alert(response.data?.message || 'Base de dados apagada com sucesso.');
    } catch (error) {
      const message = error.response?.data?.error || 'Ocorreu um erro ao limpar a base de dados.';
      alert(message);
    } finally {
      setIsResetting(false);
    }
  };

  const renderNavItem = (item, level = 0, parentKey = '') => {
    const itemKey = parentKey ? `${parentKey}/${item.nome}` : item.nome;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={itemKey}>
          <button
            type="button"
            onClick={() => toggleSection(itemKey)}
            className={`w-full flex items-center justify-between gap-4 rounded-xl font-medium transition hover:bg-[var(--color-surface)] hover:bg-opacity-20 ${
              level === 0
                ? 'px-[var(--spacing-6)] py-[var(--spacing-4)] text-xl'
                : 'px-[var(--spacing-5)] py-[var(--spacing-3)] text-lg pl-[var(--spacing-6)]'
            }`}
          >
            <div className="flex items-center gap-4">
              {item.icone}
              <span>{item.nome}</span>
            </div>
            {openSections[itemKey] ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
          {openSections[itemKey] && (
            <div className="mt-[var(--spacing-2)] space-y-[var(--spacing-2)] ml-[var(--spacing-4)] border-l border-white/10 pl-[var(--spacing-4)]">
              {item.children.map(child => renderNavItem(child, level + 1, itemKey))}
            </div>
          )}
        </div>
      );
    }

    if (item.to) {
      return (
        <NavLink
          key={itemKey}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg font-medium transition ${
              level === 0
                ? 'px-[var(--spacing-6)] py-[var(--spacing-4)] text-xl'
                : 'px-[var(--spacing-5)] py-[var(--spacing-3)] text-lg pl-[var(--spacing-6)]'
            } ${
              isActive
                ? 'bg-surface text-primary-strong shadow-card'
                : 'hover:bg-[var(--color-surface)] hover:bg-opacity-20'
            }`
          }
        >
          {item.icone}
          {item.nome}
        </NavLink>
      );
    }

    return (
      <button
        key={itemKey}
        type="button"
        onClick={handleResetDb}
        className={`w-full flex items-center gap-3 rounded-lg text-left font-medium transition ${
          level === 0
            ? 'px-[var(--spacing-6)] py-[var(--spacing-4)] text-xl'
            : 'px-[var(--spacing-5)] py-[var(--spacing-3)] text-lg pl-[var(--spacing-6)]'
        } ${
          isResetting
            ? 'bg-[var(--color-surface)] bg-opacity-20 cursor-not-allowed'
            : 'hover:bg-[var(--color-surface)] hover:bg-opacity-20'
        }`}
        disabled={isResetting}
      >
        {item.icone}
        {isResetting ? 'A limpar BD...' : item.nome}
      </button>
    );
  };

  return (
    <div className="w-full md:w-64 bg-gradient-to-b from-[var(--color-primary-700)] to-[var(--color-primary-900)] text-on-primary md:min-h-screen p-[var(--spacing-6)] flex-shrink-0 md:sticky md:top-0">
      <h1 className="text-3xl font-black mb-[var(--spacing-12)]">BWB FTV</h1>
      <nav className="space-y-[var(--spacing-4)]">
        {menu.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
}
