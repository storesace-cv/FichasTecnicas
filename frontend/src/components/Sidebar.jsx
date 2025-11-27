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
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const [openSections, setOpenSections] = useState({ "Base de Dados": true });
  const [isResetting, setIsResetting] = useState(false);

  const menu = [
    { to: "/", nome: "Fichas", icone: <HomeIcon className="w-6 h-6" /> },
    {
      nome: "Base de Dados",
      icone: <ServerStackIcon className="w-6 h-6" />,
      children: [
        { to: "/importacoes", nome: "Importações", icone: <DocumentArrowUpIcon className="w-6 h-6" /> },
        { nome: "Reset da BD", acao: "reset", icone: <ArrowPathIcon className="w-6 h-6" /> },
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

  return (
    <div className="w-full md:w-64 bg-gradient-to-b from-[var(--color-primary-700)] to-[var(--color-primary-900)] text-on-primary md:min-h-screen p-[var(--spacing-6)] flex-shrink-0 md:sticky md:top-0">
      <h1 className="text-3xl font-black mb-[var(--spacing-12)]">BWB FTV</h1>
      <nav className="space-y-[var(--spacing-4)]">
        {menu.map(item => (
          item.children ? (
            <div key={item.nome}>
              <button
                type="button"
                onClick={() => toggleSection(item.nome)}
                className="w-full flex items-center justify-between gap-4 px-[var(--spacing-6)] py-[var(--spacing-4)] rounded-xl text-xl font-medium transition hover:bg-[var(--color-surface)] hover:bg-opacity-20"
              >
                <div className="flex items-center gap-4">
                  {item.icone}
                  {item.nome}
                </div>
                {openSections[item.nome] ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
              {openSections[item.nome] && (
                <div className="mt-[var(--spacing-2)] space-y-[var(--spacing-2)] ml-[var(--spacing-4)]">
                  {item.children.map(child => (
                    child.to ? (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-[var(--spacing-5)] py-[var(--spacing-3)] rounded-lg text-lg font-medium transition ${
                            isActive ? 'bg-surface text-primary-strong shadow-card' : 'hover:bg-[var(--color-surface)] hover:bg-opacity-20'
                          }`
                        }
                      >
                        {child.icone}
                        {child.nome}
                      </NavLink>
                    ) : (
                      <button
                        key={child.nome}
                        type="button"
                        onClick={handleResetDb}
                        className={`w-full flex items-center gap-3 px-[var(--spacing-5)] py-[var(--spacing-3)] rounded-lg text-left text-lg font-medium transition ${
                          isResetting
                            ? 'bg-[var(--color-surface)] bg-opacity-20 cursor-not-allowed'
                            : 'hover:bg-[var(--color-surface)] hover:bg-opacity-20'
                        }`}
                        disabled={isResetting}
                      >
                        {child.icone}
                        {isResetting ? 'A limpar BD...' : child.nome}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-[var(--spacing-6)] py-[var(--spacing-4)] rounded-xl text-xl font-medium transition ${
                  isActive ? 'bg-surface text-primary-strong shadow-card' : 'hover:bg-[var(--color-surface)] hover:bg-opacity-20'
                }`
              }
            >
              {item.icone}
              {item.nome}
            </NavLink>
          )
        ))}
      </nav>
    </div>
  );
}
