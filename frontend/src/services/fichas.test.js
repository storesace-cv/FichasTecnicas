import { describe, expect, it } from 'vitest';
import { mapFichaResponse, normalizeNumber } from './fichas';

describe('normalizeNumber', () => {
  it('returns numeric values or fallback', () => {
    expect(normalizeNumber('3.5')).toBe(3.5);
    expect(normalizeNumber(undefined, 2)).toBe(2);
  });
});

describe('mapFichaResponse', () => {
  it('normalizes a detailed ficha including custos and totais', () => {
    const payload = mapFichaResponse({
      codigo: 'P001',
      nome: 'Produto Teste',
      cabecalho: { porcoes: 2, unidade_base: 'kg' },
      composicao: [
        { quantidade: 1, unidade: 'kg', ppu: 4, preco: 4, peso: 1 },
        { quantidade: 2, unidade: 'kg', ppu: 2, preco: 4, peso: 2, alergenos: [{ codigo: 'GL', nome: 'Glúten' }] },
      ],
      custos: { custo_calculado: 8, custo_registado: 8 },
      totais: { peso_total: 3, custo_por_unidade_base: 4, unidade_base: 'kg' },
      alergenos: [{ codigo: 'GL', nome: 'Glúten' }],
      preparacao_html: '<p>Preparar com calma</p>',
    });

    expect(payload.custos.consistente).toBe(true);
    expect(payload.totais.peso_total).toBe(3);
    expect(payload.cabecalho.unidade_base).toBe('kg');
    expect(payload.alergenos).toHaveLength(1);
    expect(payload.preparacao_html).toContain('calma');
  });

  it('derives costs and totals from legacy ingredient fields when missing', () => {
    const payload = mapFichaResponse({
      codigo: 'P002',
      nome: 'Ficha Antiga',
      ingredientes: [
        { quantidade_ficha: 1.5, custo_parcial: 3, ingrediente: { unidade: 'g' } },
        { quantidade_ficha: 2.5, custo_parcial: 7, ingrediente: { unidade: 'g' } },
      ],
    });

    expect(payload.custos.custo_calculado).toBeCloseTo(10);
    expect(payload.totais.peso_total).toBeCloseTo(4);
    expect(payload.totais.unidade_base).toBe('un');
    expect(payload.custos.consistente).toBe(true);
  });
});
