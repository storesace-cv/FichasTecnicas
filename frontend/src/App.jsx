import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FichaList from './components/FichaList';
import FichaTecnicaPage from './pages/FichaTecnica';
import Importacoes from './pages/import/Importacoes';
import ImportarTipo from './pages/import/ImportarTipo';

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-surface-muted">
          <Routes>
            <Route path="/" element={<FichaList />} />
            <Route path="/fichas/:fichaId" element={<FichaTecnicaPage />} />
            <Route path="/ficha/:fichaId" element={<FichaTecnicaPage />} />
            <Route path="/importacoes" element={<Importacoes />} />
            <Route path="/importar/:tipo" element={<ImportarTipo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
