import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FichaList from './components/ficha/FichaList';
import FichaDetail from './components/ficha/FichaDetail';
import Importacoes from './pages/import/Importacoes';
import ImportarTipo from './pages/import/ImportarTipo';

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<FichaList />} />
            <Route path="/ficha/:codigo" element={<FichaDetail />} />
            <Route path="/importacoes" element={<Importacoes />} />
            <Route path="/importar/:tipo" element={<ImportarTipo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
