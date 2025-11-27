export function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function mapFichaResponse(apiData) {
  if (!apiData) return null;

  const cabecalho = apiData.cabecalho || {};
  const composicaoOrigem = apiData.composicao || apiData.ingredientes || [];
  const composicao = composicaoOrigem.map((item, index) => ({
    ordem: item.ordem ?? index + 1,
    componente_codigo: item.componente_codigo ?? item.produto?.codigo ?? null,
    componente_nome: item.componente_nome ?? item.produto?.nome ?? '—',
    quantidade: normalizeNumber(item.quantidade ?? item.quantidade_ficha, 0),
    unidade: item.unidade || item.ingrediente?.unidade || '—',
    ppu: normalizeNumber(item.ppu ?? item.produto?.preco_unitario, 0),
    preco: normalizeNumber(item.preco ?? item.custo_parcial, 0),
    peso: normalizeNumber(item.peso ?? item.quantidade ?? item.quantidade_ficha, 0),
    alergenos: item.alergenos || [],
  }));

  const custoCalculado = apiData.custos?.custo_calculado ?? composicao.reduce((acc, ing) => acc + ing.preco, 0);
  const custoRegistado = apiData.custos?.custo_registado ?? apiData.custo_total ?? custoCalculado;
  const porcoes = cabecalho.porcoes ?? apiData.porcoes ?? 1;
  const pesoTotal = apiData.totais?.peso_total ?? composicao.reduce((acc, ing) => acc + ing.peso, 0);
  const unidadeBase = cabecalho.unidade_base || apiData.totais?.unidade_base || 'un';
  const custoPorUnidadeBase = apiData.totais?.custo_por_unidade_base ?? (porcoes ? custoCalculado / porcoes : custoCalculado);
  const consistente = Math.abs(custoRegistado - custoCalculado) < 0.01;

  return {
    codigo: apiData.codigo,
    nome: apiData.nome ?? cabecalho.nome,
    cabecalho: {
      ...cabecalho,
      unidade_base: unidadeBase,
      porcoes,
    },
    composicao,
    totais: {
      peso_total: pesoTotal,
      custo_total: custoRegistado,
      custo_por_unidade_base: custoPorUnidadeBase,
      unidade_base: unidadeBase,
    },
    custos: {
      custo_calculado: custoCalculado,
      custo_registado: custoRegistado,
      consistente,
      diferenca: custoRegistado - custoCalculado,
    },
    meta: {
      estado: apiData.estado || cabecalho.estado || 'Rascunho',
      categoria: apiData.categoria || cabecalho.categoria || 'Sem categoria',
      autor: apiData.autor || cabecalho.autor || 'Equipa não definida',
      criadoEm: apiData.criado_em || apiData.createdAt || apiData.data_criacao || cabecalho.data_criacao || null,
      atualizadoEm: apiData.atualizado_em || apiData.updatedAt || apiData.data_atualizacao || cabecalho.data_atualizacao || null,
    },
    alergenos: apiData.alergenos || [],
    documentos: apiData.documentos || apiData.anexos || [],
    links: apiData.links || apiData.ligacoes || [],
    preparacao_html: apiData.preparacao_html || null,
    imagem_prato: apiData.imagem_prato || null,
  };
}
