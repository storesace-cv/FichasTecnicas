import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FichaList from './components/FichaList';
import ImportExcel from './components/ImportExcel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Fichas Técnicas Valorizadas</h1>
            <nav className="mt-4 flex gap-8">
              <Link to="/" className="hover:underline text-lg">Fichas</Link>
              <Link to="/importar" className="hover:underline text-lg">Importar Excel</Link>
            </nav>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<FichaList />} />
            <Route path="/importar" element={<ImportExcel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
