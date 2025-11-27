import React, { useState } from 'react';
import axios from 'axios';

export default function ImportExcel() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5001/api/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult({ success: true, data: res.data });
    } catch (err) {
      setResult({ success: false, error: err.response?.data || err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Importar Fichas Técnicas</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">↑</div>
              <p className="text-xl text-gray-600">
                {file ? file.name : "Clica ou arrasta o teu Excel aqui"}
              </p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="mt-6 w-full bg-blue-700 text-white py-4 rounded-lg text-xl font-semibold hover:bg-blue-800 disabled:bg-gray-400 transition"
          >
            {uploading ? "A processar..." : "Importar Excel"}
          </button>
        </form>

        {result && (
          <div className={`mt-8 p-6 rounded-lg ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.success ? "Importação concluída com sucesso!" : "Erro na importação"}
            <pre className="mt-4 text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
