import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FichaList from './components/FichaList';
import FichaTecnicaPage from './pages/FichaTecnica';
import Importacoes from './pages/import/Importacoes';
import ImportarTipo from './pages/import/ImportarTipo';
import Referencias from './pages/referencias/Referencias';
import Moeda from './pages/configuracao/Moeda';
import CustosOperacionais from './pages/configuracao/CustosOperacionais';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-surface-muted">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<FichaList />} />
            <Route path="/fichas/:fichaId" element={<FichaTecnicaPage />} />
            <Route path="/ficha/:fichaId" element={<FichaTecnicaPage />} />
            <Route path="/importacoes" element={<Importacoes />} />
            <Route path="/importar/:tipo" element={<ImportarTipo />} />
            <Route path="/referencias" element={<Referencias />} />
            <Route path="/configuracao/regionalizacao/moeda" element={<Moeda />} />
            <Route path="/configuracao/food-cost/custos-operacionais" element={<CustosOperacionais />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
