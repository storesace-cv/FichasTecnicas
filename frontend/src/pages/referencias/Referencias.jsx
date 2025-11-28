import React, { useEffect, useMemo, useState } from 'react';
import {
  criarReferencia,
  actualizarReferencia,
  listarReferencias,
} from '../../services/referencias';

const configuracoes = {
  tipoartigos: {
    titulo: 'Tipos de Artigos',
    campos: [
      { nome: 'Descricao', label: 'Descrição', tipo: 'text', required: true },
      { nome: 'Ativo', label: 'Ativo', tipo: 'checkbox' },
    ],
  },
  validades: {
    titulo: 'Validades',
    campos: [
      { nome: 'Descricao', label: 'Descrição', tipo: 'text', required: true },
      { nome: 'Unidade', label: 'Unidade', tipo: 'text', required: true },
      { nome: 'Valor', label: 'Valor', tipo: 'number', required: true, step: '0.0001' },
      { nome: 'Ativo', label: 'Ativo', tipo: 'checkbox' },
    ],
  },
  temperaturas: {
    titulo: 'Temperaturas',
    campos: [
      { nome: 'Descricao', label: 'Descrição', tipo: 'text', required: true },
      { nome: 'Intervalo', label: 'Intervalo', tipo: 'text' },
      { nome: 'Ativo', label: 'Ativo', tipo: 'checkbox' },
    ],
  },
};

function CampoEdicao({ campo, valor, onChange, disabled = false }) {
  if (campo.tipo === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={Boolean(valor)}
          onChange={e => onChange(campo.nome, e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        {campo.label}
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium" htmlFor={`${campo.nome}-input`}>
        {campo.label}
      </label>
      <input
        id={`${campo.nome}-input`}
        type={campo.tipo}
        required={campo.required}
        step={campo.step}
        value={valor ?? ''}
        onChange={e => onChange(campo.nome, campo.tipo === 'number' ? Number(e.target.value) : e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function LinhaReferencia({
  registo,
  campos,
  onGuardar,
  loading,
}) {
  const [emEdicao, setEmEdicao] = useState(false);
  const [valores, setValores] = useState(() => registo);

  useEffect(() => {
    setValores(registo);
  }, [registo]);

  const onChange = (nome, valor) => {
    setValores(prev => ({ ...prev, [nome]: valor }));
  };

  const guardar = async () => {
    await onGuardar(valores);
    setEmEdicao(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Código</p>
          <p className="font-mono text-sm">{registo.Codigo}</p>
        </div>
        <div className="flex flex-1 flex-wrap gap-4">
          {campos
            .filter(c => c.nome !== 'Ativo')
            .map(campo => (
              <CampoEdicao
                key={campo.nome}
                campo={campo}
                valor={valores[campo.nome]}
                onChange={onChange}
                disabled={!emEdicao}
              />
            ))}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={Boolean(valores.Ativo)}
              onChange={e => onChange('Ativo', e.target.checked)}
              disabled={!emEdicao}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Ativo
          </label>
        </div>
        <div className="flex gap-2">
          {emEdicao ? (
            <>
              <button
                type="button"
                onClick={guardar}
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2 text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-60"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEmEdicao(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-200"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEmEdicao(true)}
              className="rounded-lg bg-white px-4 py-2 text-primary shadow-sm ring-1 ring-primary transition hover:bg-primary/10"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormNovo({ campos, onSubmit }) {
  const [valores, setValores] = useState(() => (
    campos.reduce((acc, campo) => ({ ...acc, [campo.nome]: campo.tipo === 'checkbox' ? true : '' }), {})
  ));
  const [loading, setLoading] = useState(false);

  const onChange = (nome, valor) => setValores(prev => ({ ...prev, [nome]: valor }));

  const submeter = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(valores);
      setValores(campos.reduce((acc, campo) => ({ ...acc, [campo.nome]: campo.tipo === 'checkbox' ? true : '' }), {}));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submeter} className="space-y-4 rounded-xl border border-dashed border-primary bg-primary/5 p-4">
      <h3 className="text-lg font-semibold text-primary">Novo registo</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {campos.map(campo => (
          <CampoEdicao key={campo.nome} campo={campo} valor={valores[campo.nome]} onChange={onChange} />
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-60"
      >
        Guardar
      </button>
    </form>
  );
}

export default function Referencias() {
  const [tabAtiva, setTabAtiva] = useState('tipoartigos');
  const [registos, setRegistos] = useState([]);
  const [loading, setLoading] = useState(false);

  const configuracaoAtual = useMemo(() => configuracoes[tabAtiva], [tabAtiva]);

  const carregar = async () => {
    setLoading(true);
    try {
      const dados = await listarReferencias(tabAtiva);
      setRegistos(dados);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [tabAtiva]);

  const criarOuAtualizar = async payload => {
    const existe = registos.find(r => r.Codigo === payload.Codigo);
    if (existe) {
      await actualizarReferencia(tabAtiva, existe.Codigo, payload);
    } else {
      await criarReferencia(tabAtiva, payload);
    }
    await carregar();
  };

  const criar = async payload => criarOuAtualizar(payload);
  const guardar = async payload => criarOuAtualizar(payload);

  return (
    <div className="max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black text-primary-strong">Tabelas de Referência</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(configuracoes).map(([slug, conf]) => (
          <button
            key={slug}
            type="button"
            onClick={() => setTabAtiva(slug)}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
              tabAtiva === slug
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {conf.titulo}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <FormNovo campos={configuracaoAtual.campos} onSubmit={criar} />

        {loading ? (
          <p className="text-gray-500">A carregar...</p>
        ) : registos.length === 0 ? (
          <p className="text-gray-500">Sem registos nesta tabela.</p>
        ) : (
          <div className="space-y-4">
            {registos.map(registo => (
              <LinhaReferencia
                key={registo.Codigo}
                registo={registo}
                campos={configuracaoAtual.campos}
                onGuardar={guardar}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
