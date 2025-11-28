import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FichaList from './components/FichaList';
import FichaTecnicaPage from './pages/FichaTecnica';
import Importacoes from './pages/import/Importacoes';
import ImportarTipo from './pages/import/ImportarTipo';
import Referencias from './pages/referencias/Referencias';
import Moeda from './pages/configuracao/Moeda';
import Pais from './pages/configuracao/Pais';
import TipoNegocio from './pages/configuracao/TipoNegocio';
import IntervalosFoodCost from './pages/configuracao/IntervalosFoodCost';
import CalculoPVPFoodCost from './pages/configuracao/CalculoPVPFoodCost';
import CalculoPVPRatio from './pages/configuracao/CalculoPVPRatio';

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
            <Route path="/configuracao/regionalizacao/pais" element={<Pais />} />
            <Route path="/configuracao/regionalizacao/moeda" element={<Moeda />} />
            <Route path="/configuracao/food-cost/tipo-negocio" element={<TipoNegocio />} />
            <Route path="/configuracao/food-cost/intervalos" element={<IntervalosFoodCost />} />
            <Route path="/configuracao/calculo-pvp/food-cost-alvo" element={<CalculoPVPFoodCost />} />
            <Route path="/configuracao/calculo-pvp/ratio" element={<CalculoPVPRatio />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
