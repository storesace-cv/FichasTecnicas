import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const menu = [
    { to: "/", nome: "Fichas", icone: <HomeIcon className="w-6 h-6" /> },
    { to: "/importacoes", nome: "Importações", icone: <DocumentArrowUpIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-black mb-12">BWB FTV</h1>
      <nav className="space-y-4">
        {menu.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-xl text-xl font-medium transition ${
                isActive ? 'bg-white text-blue-900 shadow-xl' : 'hover:bg-white hover:bg-opacity-20'
              }`
            }
          >
            {item.icone}
            {item.nome}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
