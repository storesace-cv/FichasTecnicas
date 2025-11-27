import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ImportarTipo() {
  const { tipo } = useParams();
  const titulo = tipo === 'produtos' ? 'Produtos Base' : tipo === 'precos' ? 'Preços & Taxas' : 'Fichas Técnicas';
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const upload = async () => {
    if (!file) return;
    setMsg('A importar...');
    const form = new FormData();
    form.append('file', file);
    form.append('tipo', tipo);
    try {
      const res = await axios.post('/api/import', form);
      const detalhes = res.data?.detalhes;
      if (detalhes?.status === 'sucesso') {
        const linhas = Object.entries({
          produtos: detalhes.produtos,
          fichas: detalhes.fichas,
          ingredientes: detalhes.ingredientes,
          precos: detalhes.precos,
        })
          .filter(([, valor]) => valor > 0)
          .map(([chave, valor]) => `${valor} ${chave}`)
          .join(' | ');

        setMsg(`SUCESSO! ${detalhes.tipo} importados. ${linhas}`.trim());
      } else {
        setMsg('ERRO: Resultado inesperado na importação.');
      }
    } catch (e) {
      const detalhesErro = e.response?.data?.detalhes;
      if (detalhesErro?.erros?.length) {
        const primeiro = detalhesErro.erros[0];
        const codigo = primeiro.codigo ? `[${primeiro.codigo}] ` : '';
        setMsg(`ERRO: ${codigo}${primeiro.mensagem || 'Falha a importar ficheiro.'}`);
      } else {
        setMsg('ERRO: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  return (
    <div className="p-16 max-w-4xl mx-auto">
      <Link to="/importacoes" className="flex items-center gap-4 text-2xl mb-12">
        <ArrowLeftIcon className="w-10 h-10" /> Voltar
      </Link>
      <h1 className="text-6xl font-black mb-16 text-center">{titulo}</h1>
      <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} className="block w-full text-2xl file:py-6 file:px-12 file:rounded-full file:bg-blue-600 file:text-white" />
      {file && <p className="mt-8 text-3xl font-bold text-center text-blue-600">{file.name}</p>}
      <button onClick={upload} disabled={!file} className="mt-16 w-full py-8 bg-blue-600 text-white text-4xl font-bold rounded-3xl hover:bg-blue-700 disabled:bg-gray-400">
        INICIAR IMPORTAÇÃO
      </button>
      {msg && <p className="mt-12 text-3xl font-bold text-center">{msg}</p>}
    </div>
  );
}
