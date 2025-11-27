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
      const res = await axios.post('/api/import', formData, {
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
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">Importar Excel NET-bo</h2>
      
      <div className="bg-white rounded-2xl shadow-xl p-10">
        <form onSubmit={handleSubmit}>
          <div className="border-4 border-dashed border-blue-300 rounded-2xl p-20 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-8xl mb-6">Upload</div>
              <p className="text-2xl text-gray-700">
                {file ? file.name : "Clica ou arrasta o teu ficheiro Excel aqui"}
              </p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="mt-8 w-full bg-blue-700 text-white py-5 rounded-xl text-2xl font-bold hover:bg-blue-800 disabled:bg-gray-400 transition"
          >
            {uploading ? "A importar... Aguenta!" : "Importar Fichas Técnicas"}
          </button>
        </form>

        {result && (
          <div className={`mt-10 p-8 rounded-xl text-lg ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <strong>{result.success ? "SUCESSO!" : "ERRO"}</strong>
            <pre className="mt-4 text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
