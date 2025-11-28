import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, beforeEach, expect, it, vi } from 'vitest'

import FichaTecnicaPage from '../pages/FichaTecnica'
import { fetchFichaByCodigo } from '../services/fichas'

vi.mock('../services/fichas', () => ({
  fetchFichaByCodigo: vi.fn(),
}))

const buildFicha = (overrides = {}) => ({
  codigo: 'FT-123',
  nome: 'Bolo de Chocolate',
  descricao: 'Uma ficha completa para teste.',
  cabecalho: { unidade_base: 'kg' },
  meta: {
    estado: 'Ativo',
    criadoEm: '2024-08-01T10:00:00Z',
    atualizadoEm: '2024-08-10T10:00:00Z',
    autor: 'Chef Silva',
    categoria: 'Sobremesas',
  },
  custos: {
    custo_calculado: 12.5,
    custo_registado: 12.5,
    consistente: true,
    diferenca: 0,
  },
  totais: {
    custo_total: 12.5,
    custo_por_unidade_base: 6.25,
    peso_total: 2.5,
    unidade_base: 'kg',
  },
  atributosTecnicos: {
    familia: 'Padaria',
    subfamilia: 'Bolos',
    unidade_base: 'kg',
    validade: '3 dias',
    temperatura: '4ºC',
    informacao_adicional: 'Servir fresco',
  },
  composicao: [
    {
      ordem: 1,
      componente_nome: 'Farinha',
      quantidade: 1,
      unidade: 'kg',
      preco: 5,
      ppu: 5,
      peso: 1,
      alergenos: [{ codigo: 'GL', nome: 'Glúten' }],
    },
    {
      ordem: 2,
      componente_nome: 'Chocolate',
      quantidade: 1.5,
      unidade: 'kg',
      preco: 7.5,
      ppu: 5,
      peso: 1.5,
      alergenos: [],
    },
  ],
  alergenos: [
    { codigo: 'GL', nome: 'Glúten' },
    { codigo: 'LC', nome: 'Lactose' },
  ],
  documentos: [{ id: 'doc1', nome: 'Ficha PDF', tipo: 'PDF', url: 'https://example.com/doc.pdf' }],
  links: [{ url: 'https://example.com', titulo: 'Manual do produto', descricao: 'Mais detalhes' }],
  historico: [
    { id: 'hist1', titulo: 'Criação', descricao: 'Ficha criada' },
    { id: 'hist2', titulo: 'Atualização', descricao: 'Dados revistos' },
  ],
  preparacao_html: '<p>Instruções detalhadas</p>',
  ...overrides,
})

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={[`/fichas/FT-123`]}>
      <Routes>
        <Route path="/fichas/:fichaId" element={<FichaTecnicaPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('FichaTecnicaPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders ficha metadata and switches between tabs', async () => {
    fetchFichaByCodigo.mockResolvedValueOnce(buildFicha())

    renderWithRouter()

    await waitFor(() => {
      expect(fetchFichaByCodigo).toHaveBeenCalledWith('FT-123')
      expect(screen.getByText(/Código interno: FT-123/)).toBeInTheDocument()
    })

    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Chef Silva')).toBeInTheDocument()
    expect(screen.getByText('Padaria')).toBeInTheDocument()

    expect(screen.getByText('Custo registado')).toBeInTheDocument()
    expect(screen.getByText('Composição resumida')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Especificações' }))
    expect(await screen.findByText('Tabela de composição')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Documentos' }))
    expect(screen.getByText('Anexos')).toBeInTheDocument()
    expect(screen.getByText('Ficha PDF')).toBeInTheDocument()
  })

  it('shows skeleton during initial loading and replaces it after fetch', async () => {
    let resolveFicha
    const pendingFicha = new Promise((resolve) => {
      resolveFicha = resolve
    })

    fetchFichaByCodigo.mockReturnValueOnce(pendingFicha)

    const { container } = renderWithRouter()

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()

    resolveFicha(buildFicha())

    expect(await screen.findByText(/Código interno: FT-123/)).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('renders an error state and allows retrying the request', async () => {
    fetchFichaByCodigo
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(buildFicha({ meta: { estado: 'Rascunho' } }))

    renderWithRouter()

    expect(await screen.findByText('Não foi possível carregar a ficha técnica')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => expect(fetchFichaByCodigo).toHaveBeenCalledTimes(2))

    expect(await screen.findByText('Rascunho')).toBeInTheDocument()
    expect(screen.getAllByText(/Código interno: FT-123/)).not.toHaveLength(0)
  })

  it('exibe a fotografia do prato quando presente na ficha', async () => {
    const imagemPratoUrl = 'https://images.example.com/foto-bolo.jpg'

    fetchFichaByCodigo.mockResolvedValueOnce(
      buildFicha({ imagem_prato: imagemPratoUrl, nome: 'Bolo Mármore' })
    )

    renderWithRouter()

    const imagem = await screen.findByAltText('Imagem do prato Bolo Mármore')
    expect(imagem).toBeInTheDocument()
    expect(imagem.getAttribute('src')).toBe(imagemPratoUrl)
  })
})
