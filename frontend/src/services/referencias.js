import axios from 'axios';

export async function listarReferencias(nome) {
  const response = await axios.get(`/api/referencias/${nome}`);
  return response.data;
}

export async function criarReferencia(nome, dados) {
  const response = await axios.post(`/api/referencias/${nome}`, dados);
  return response.data;
}

export async function actualizarReferencia(nome, codigo, dados) {
  const response = await axios.put(`/api/referencias/${nome}/${codigo}`, dados);
  return response.data;
}
