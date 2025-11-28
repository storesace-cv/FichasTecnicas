import axios from 'axios';

const normalizarAlergeno = (entrada) => {
  const id = entrada.id ?? entrada.Id ?? entrada.codigo ?? entrada.Codigo ?? entrada.nome ?? entrada.Nome;

  return {
    id,
    codigo: entrada.codigo ?? entrada.Codigo ?? null,
    nome: entrada.nome ?? entrada.Nome ?? '—',
    nome_ingles: entrada.nome_ingles ?? entrada.NomeIngles ?? null,
    descricao: entrada.descricao ?? entrada.Descricao ?? null,
    exemplos: entrada.exemplos ?? entrada.Exemplos ?? null,
    notas: entrada.notas ?? entrada.Notas ?? null,
  };
};

export async function listarAlergenios() {
  const response = await axios.get('/api/alergenios');
  return (response.data || []).map(normalizarAlergeno);
}

export { normalizarAlergeno };
