import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  DocumentIcon,
  FolderIcon,
  LinkIcon,
  TagIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import Breadcrumbs from '../../components/Breadcrumbs'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import StateMessage from '../../components/StateMessage'
import FichaSkeleton from '../../components/FichaSkeleton'
import { atualizarAtributosTecnicos, fetchFichaByCodigo, fetchFichas } from '../../services/fichas'
import { listarReferencias } from '../../services/referencias'

const normalizarCampoOrdenacao = (valor) => (valor ?? '').toString().trim()

const ordenarPorHierarquiaProdutos = (lista = []) => {
  const locale = 'pt-PT'
  const compareStrings = (a, b) => a.localeCompare(b, locale, { sensitivity: 'base', numeric: true })

  return [...lista].sort((a, b) => {
    const familiaA = normalizarCampoOrdenacao(a.atributosTecnicos?.familia || a.cabecalho?.familia)
    const familiaB = normalizarCampoOrdenacao(b.atributosTecnicos?.familia || b.cabecalho?.familia)
    const familiaCmp = compareStrings(familiaA, familiaB)
    if (familiaCmp !== 0) return familiaCmp

    const subfamiliaA = normalizarCampoOrdenacao(a.atributosTecnicos?.subfamilia || a.cabecalho?.subfamilia)
    const subfamiliaB = normalizarCampoOrdenacao(b.atributosTecnicos?.subfamilia || b.cabecalho?.subfamilia)
    const subfamiliaCmp = compareStrings(subfamiliaA, subfamiliaB)
    if (subfamiliaCmp !== 0) return subfamiliaCmp

    const produtoA = normalizarCampoOrdenacao(a.nome || a.cabecalho?.nome)
    const produtoB = normalizarCampoOrdenacao(b.nome || b.cabecalho?.nome)
    const produtoCmp = compareStrings(produtoA, produtoB)
    if (produtoCmp !== 0) return produtoCmp

    return compareStrings(normalizarCampoOrdenacao(a.codigo), normalizarCampoOrdenacao(b.codigo))
  })
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function useFichaTecnica(codigo) {
  const [ficha, setFicha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarFicha = useCallback(() => {
    if (!codigo) {
      setFicha(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetchFichaByCodigo(codigo)
      .then((response) => setFicha(response))
      .catch((err) => {
        setFicha(null)
        setError(err)
      })
      .finally(() => setLoading(false))
  }, [codigo])

  useEffect(() => {
    carregarFicha()
  }, [carregarFicha])

  return { ficha, loading, error, refetch: carregarFicha }
}

export default function FichaTecnicaPage() {
  const navigate = useNavigate()
  const { fichaId } = useParams()
  const { ficha, loading, error, refetch } = useFichaTecnica(fichaId)
  const [referencias, setReferencias] = useState({ validades: [], temperaturas: [], tipoArtigos: [] })
  const [referenciasCarregadas, setReferenciasCarregadas] = useState(false)
  const [selecoesAtributos, setSelecoesAtributos] = useState({
    validade: '',
    temperatura: '',
    tipo_artigo: '',
  })
  const [salvandoAtributos, setSalvandoAtributos] = useState(false)
  const [erroAtributos, setErroAtributos] = useState(null)
  const [listaNavegacao, setListaNavegacao] = useState([])
  const [carregandoNavegacao, setCarregandoNavegacao] = useState(true)
  const imagemPratoSrc = useMemo(() => {
    if (!ficha?.imagem_prato) return null
    return /^https?:\/\//.test(ficha.imagem_prato)
      ? ficha.imagem_prato
      : `/api/images/${ficha.imagem_prato}`
  }, [ficha?.imagem_prato])
  const infoGridColumns = imagemPratoSrc ? 'lg:grid-cols-3' : 'lg:grid-cols-2'

  const custoBadge = useMemo(() => {
    if (!ficha?.custos) return null
    return ficha.custos.consistente ? (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-soft text-success-strong text-sm font-semibold">
        Custo consistente
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning-soft text-warning-strong text-sm font-semibold">
        Diferença de {ficha.custos.diferenca.toFixed(2)} €
      </span>
    )
  }, [ficha])

  const meta = ficha?.meta || {}
  const documentos = ficha?.documentos || []
  const links = ficha?.links || []
  const atributosTecnicos = ficha?.atributosTecnicos || {}
  const totalRegistos = listaNavegacao.length
  const indiceAtual = useMemo(
    () => listaNavegacao.findIndex((codigoLista) => String(codigoLista) === String(ficha?.codigo || fichaId)),
    [listaNavegacao, ficha?.codigo, fichaId],
  )
  const codigoAnterior = indiceAtual > 0 ? listaNavegacao[indiceAtual - 1] : null
  const codigoSeguinte = indiceAtual >= 0 && indiceAtual < totalRegistos - 1 ? listaNavegacao[indiceAtual + 1] : null
  const primeiroCodigo = totalRegistos > 0 ? listaNavegacao[0] : null
  const ultimoCodigo = totalRegistos > 0 ? listaNavegacao[totalRegistos - 1] : null
  const opcoesValidades = useMemo(
    () => (referencias.validades || []).filter((opcao) => opcao.Ativo !== false),
    [referencias.validades],
  )
  const opcoesTemperaturas = useMemo(
    () => (referencias.temperaturas || []).filter((opcao) => opcao.Ativo !== false),
    [referencias.temperaturas],
  )
  const opcoesTiposArtigos = useMemo(
    () => (referencias.tipoArtigos || []).filter((opcao) => opcao.Ativo !== false),
    [referencias.tipoArtigos],
  )
  const selectBaseClasses =
    'w-full rounded-lg border border-soft bg-surface px-3 py-2.5 text-sm text-strong shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-100)]'

  const sanitizeAtributoValor = useCallback((value) => (value && value !== '—' ? value : ''), [])

  const aplicarSelecoesAtributos = useCallback(
    (valores) => {
      setSelecoesAtributos({
        validade: sanitizeAtributoValor(valores.validade),
        temperatura: sanitizeAtributoValor(valores.temperatura),
        tipo_artigo: sanitizeAtributoValor(valores.tipo_artigo),
      })
    },
    [sanitizeAtributoValor],
  )

  useEffect(() => {
    let activo = true

    setReferenciasCarregadas(false)
    Promise.all([
      listarReferencias('validades'),
      listarReferencias('temperaturas'),
      listarReferencias('tipoartigos'),
    ])
      .then(([validades, temperaturas, tipoArtigos]) => {
        if (!activo) return
        setReferencias({
          validades: validades || [],
          temperaturas: temperaturas || [],
          tipoArtigos: tipoArtigos || [],
        })
      })
      .catch(() => {
        if (!activo) return
        setReferencias({ validades: [], temperaturas: [], tipoArtigos: [] })
      })
      .finally(() => {
        if (activo) setReferenciasCarregadas(true)
      })

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    let activo = true

    setCarregandoNavegacao(true)
    fetchFichas()
      .then((todasFichas) => {
        if (!activo) return
        const codigosOrdenados = ordenarPorHierarquiaProdutos(todasFichas || []).map((item) => item.codigo)
        setListaNavegacao(codigosOrdenados)
      })
      .catch(() => {
        if (activo) setListaNavegacao([])
      })
      .finally(() => {
        if (activo) setCarregandoNavegacao(false)
      })

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    aplicarSelecoesAtributos(atributosTecnicos)
  }, [aplicarSelecoesAtributos, atributosTecnicos])

  const handleSelectChange = (campo) => async (event) => {
    const novoValor = event.target.value
    setSelecoesAtributos((prev) => ({ ...prev, [campo]: novoValor }))

    if (!ficha?.codigo) return

    setSalvandoAtributos(true)
    setErroAtributos(null)
    try {
      const fichaAtualizada = await atualizarAtributosTecnicos(ficha.codigo, { [campo]: novoValor })

      if (fichaAtualizada?.atributosTecnicos) {
        aplicarSelecoesAtributos(fichaAtualizada.atributosTecnicos)
      }
    } catch (err) {
      setErroAtributos('Não foi possível guardar os atributos técnicos.')
    } finally {
      setSalvandoAtributos(false)
    }
  }

  const renderFallbackOption = (value, options) => {
    if (!value) return null
    return options.some((opcao) => opcao.Descricao === value) ? null : (
      <option value={value}>{value}</option>
    )
  }

  if (loading && !ficha) {
    return <FichaSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6">
        <StateMessage
          variant="error"
          title="Não foi possível carregar a ficha técnica"
          description="Tenta novamente ou volta para a lista para escolher outra ficha."
          action={(
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--color-error-200)] text-error-strong hover:bg-error-soft"
              >
                Voltar à lista
              </button>
              <button
                type="button"
                onClick={refetch}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-error-600)] text-on-primary hover:bg-[var(--color-error-800)]"
              >
                Tentar novamente
              </button>
            </div>
          )}
        />
      </div>
    )
  }

  if (!ficha) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6">
        <StateMessage
          variant="info"
          title="Ficha técnica não encontrada"
          description="O código indicado não devolveu resultados. Volta à lista de fichas e escolhe outro registo."
          action={(
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-primary-600)] text-on-primary font-semibold rounded-lg hover:bg-[var(--color-primary-700)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5" /> Voltar à lista
            </button>
          )}
        />
      </div>
    )
  }

  const historicoRegistos =
    ficha.historico?.length > 0
      ? ficha.historico
      : [
          { icon: ClockIcon, titulo: 'Criação', descricao: `Ficha criada em ${formatDate(meta.criadoEm)}` },
          { icon: FolderIcon, titulo: 'Última atualização', descricao: `Registos atualizados em ${formatDate(meta.atualizadoEm)}` },
          { icon: UserCircleIcon, titulo: 'Responsável', descricao: meta.autor || 'Equipa não definida' },
        ]
  const isRefreshing = loading && !!ficha
  const acoesNavegacao = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => primeiroCodigo && navigate(`/ficha/${primeiroCodigo}`)}
        disabled={carregandoNavegacao || indiceAtual <= 0 || !primeiroCodigo}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
          carregandoNavegacao || indiceAtual <= 0 || !primeiroCodigo
            ? 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'
            : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'
        }`}
        aria-label="Início"
      >
        <ChevronDoubleLeftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Início</span>
      </button>

      <button
        type="button"
        onClick={() => codigoAnterior && navigate(`/ficha/${codigoAnterior}`)}
        disabled={carregandoNavegacao || !codigoAnterior}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
          carregandoNavegacao || !codigoAnterior
            ? 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'
            : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'
        }`}
        aria-label="Atrás"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Atrás</span>
      </button>

      <span className="text-base font-bold text-strong min-w-[110px] text-center">
        {carregandoNavegacao ? '…' : indiceAtual >= 0 ? `${indiceAtual + 1} / ${totalRegistos}` : '—'}
      </span>

      <button
        type="button"
        onClick={() => codigoSeguinte && navigate(`/ficha/${codigoSeguinte}`)}
        disabled={carregandoNavegacao || !codigoSeguinte}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
          carregandoNavegacao || !codigoSeguinte
            ? 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'
            : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'
        }`}
        aria-label="Avançar"
      >
        <span className="hidden sm:inline">Avançar</span>
        <ArrowRightIcon className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => ultimoCodigo && navigate(`/ficha/${ultimoCodigo}`)}
        disabled={carregandoNavegacao || indiceAtual === totalRegistos - 1 || !ultimoCodigo}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
          carregandoNavegacao || indiceAtual === totalRegistos - 1 || !ultimoCodigo
            ? 'bg-[var(--color-neutral-200)] text-muted cursor-not-allowed'
            : 'bg-[var(--color-primary-600)] text-on-primary hover:bg-[var(--color-primary-700)] hover:scale-105'
        }`}
        aria-label="Fim"
      >
        <span className="hidden sm:inline">Fim</span>
        <ChevronDoubleRightIcon className="w-5 h-5" />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="sticky top-0 z-40 bg-surface-muted/95 backdrop-blur border-b border-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          <Breadcrumbs
            items={[
              { label: 'Fichas Técnicas', href: '/' },
              { label: ficha.nome || ficha.codigo || 'Ficha Técnica' },
            ]}
          />

          <PageHeader
            title={ficha.nome || 'Ficha Técnica'}
            subtitle={`Código interno: ${ficha.codigo}`}
            actions={acoesNavegacao}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-10 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-surface border border-soft rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
              <TagIcon className="w-4 h-4" /> Estado
            </div>
            <p className="text-lg font-semibold text-strong">{meta.estado || 'Rascunho'}</p>
            {custoBadge}
          </div>
          <div className="bg-surface border border-soft rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
              <ClockIcon className="w-4 h-4" /> Criado em
            </div>
            <p className="text-lg font-semibold text-strong">{formatDate(meta.criadoEm)}</p>
          </div>
          <div className="bg-surface border border-soft rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
              <ClockIcon className="w-4 h-4" /> Atualizado em
            </div>
            <p className="text-lg font-semibold text-strong">{formatDate(meta.atualizadoEm)}</p>
          </div>
          <div className="bg-surface border border-soft rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
              <UserCircleIcon className="w-4 h-4" /> Autor / Categoria
            </div>
            <p className="text-lg font-semibold text-strong">{meta.autor || 'Equipa não definida'}</p>
            <p className="text-sm text-subtle">{meta.categoria || 'Sem categoria'}</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${infoGridColumns} gap-4 sm:gap-6`}>
          <div className="space-y-4 lg:col-span-2">
            {ficha.descricao && (
              <div className="bg-surface border border-soft rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="text-lg font-semibold text-strong">Descrição</h3>
                <p className="text-sm leading-relaxed text-subtle">{ficha.descricao}</p>
              </div>
            )}

            <div className="bg-surface border border-soft rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-strong">Atributos técnicos</h3>
                <FolderIcon className="w-5 h-5 text-muted" />
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Família</dt>
                  <dd className="text-sm font-semibold text-strong">{atributosTecnicos.familia}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Subfamília</dt>
                  <dd className="text-sm font-semibold text-strong">{atributosTecnicos.subfamilia}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Unidade base</dt>
                  <dd className="text-sm font-semibold text-strong">{atributosTecnicos.unidade_base}</dd>
                </div>
              </dl>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-muted" htmlFor="validade-select">
                    Validade
                  </label>
                  <select
                    id="validade-select"
                    className={selectBaseClasses}
                    value={selecoesAtributos.validade}
                    onChange={handleSelectChange('validade')}
                    disabled={!referenciasCarregadas || opcoesValidades.length === 0}
                  >
                    <option value="">{referenciasCarregadas ? 'Seleciona a validade' : 'A carregar opções...'}</option>
                    {renderFallbackOption(selecoesAtributos.validade, opcoesValidades)}
                    {opcoesValidades.map((opcao) => (
                      <option key={opcao.Codigo} value={opcao.Descricao}>
                        {opcao.Descricao}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-muted" htmlFor="temperatura-select">
                    Temperatura
                  </label>
                  <select
                    id="temperatura-select"
                    className={selectBaseClasses}
                    value={selecoesAtributos.temperatura}
                    onChange={handleSelectChange('temperatura')}
                    disabled={!referenciasCarregadas || opcoesTemperaturas.length === 0}
                  >
                    <option value="">{referenciasCarregadas ? 'Seleciona a temperatura' : 'A carregar opções...'}</option>
                    {renderFallbackOption(selecoesAtributos.temperatura, opcoesTemperaturas)}
                    {opcoesTemperaturas.map((opcao) => (
                      <option key={opcao.Codigo} value={opcao.Descricao}>
                        {opcao.Descricao}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:col-start-1">
                  <label className="text-xs uppercase tracking-wide text-muted" htmlFor="tipo-artigo-select">
                    Tipo Artigo
                  </label>
                  <select
                    id="tipo-artigo-select"
                    className={selectBaseClasses}
                    value={selecoesAtributos.tipo_artigo}
                    onChange={handleSelectChange('tipo_artigo')}
                    disabled={!referenciasCarregadas || opcoesTiposArtigos.length === 0}
                  >
                    <option value="">{referenciasCarregadas ? 'Seleciona o tipo de artigo' : 'A carregar opções...'}</option>
                    {renderFallbackOption(selecoesAtributos.tipo_artigo, opcoesTiposArtigos)}
                    {opcoesTiposArtigos.map((opcao) => (
                      <option key={opcao.Codigo} value={opcao.Descricao}>
                        {opcao.Descricao}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hidden sm:block" aria-hidden="true" />
                {(salvandoAtributos || erroAtributos) && (
                  <p className={`text-xs ${erroAtributos ? 'text-[var(--color-error-600)]' : 'text-muted'}`}>
                    {erroAtributos || 'A guardar alterações...'}
                  </p>
                )}
              </div>
              {atributosTecnicos.informacao_adicional && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted">Informação adicional</p>
                  <p className="text-sm text-subtle">{atributosTecnicos.informacao_adicional}</p>
                </div>
              )}
            </div>
          </div>

          {imagemPratoSrc && (
            <div className="bg-surface border border-soft rounded-xl overflow-hidden shadow-card self-start">
              <div className="relative aspect-[4/3] bg-[var(--color-neutral-100)]">
                <img
                  src={imagemPratoSrc}
                  alt={`Imagem do prato ${ficha.nome || ficha.codigo}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-3 text-on-primary">
                  <p className="text-sm font-semibold">Fotografia do prato</p>
                  <p className="text-xs text-neutral-50/90">Última atualização visual da ficha</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {isRefreshing && (
          <div className="bg-primary-soft border border-[var(--color-primary-200)] rounded-xl shadow-sm">
            <LoadingSpinner label="A atualizar a ficha técnica…" />
          </div>
        )}

        <div className="space-y-8">
          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-strong">Resumo</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-primary-soft rounded-lg p-4 border border-[var(--color-primary-200)]">
                  <p className="text-xs text-primary-strong uppercase tracking-wide">Custo registado</p>
                  <p className="text-2xl font-bold text-primary-strong">{ficha.totais.custo_total.toFixed(2)} €</p>
                </div>
                <div className="bg-secondary-soft rounded-lg p-4 border border-[var(--color-secondary-200)]">
                  <p className="text-xs text-secondary-strong uppercase tracking-wide">Custo calculado</p>
                  <p className="text-2xl font-bold text-secondary-strong">{ficha.custos.custo_calculado.toFixed(2)} €</p>
                </div>
                <div className="bg-success-soft rounded-lg p-4 border border-[var(--color-success-200)]">
                  <p className="text-xs text-success-strong uppercase tracking-wide">Custo / unidade base</p>
                  <p className="text-2xl font-bold text-success-strong">{ficha.totais.custo_por_unidade_base.toFixed(3)} €</p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-strong">Especificações</h2>
                {custoBadge}
              </div>
              <div className="overflow-x-auto border border-[var(--color-neutral-100)] rounded-lg">
                <table className="w-full min-w-max text-sm md:text-base">
                  <thead className="bg-surface-muted text-left text-subtle font-semibold">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 w-16">Ordem</th>
                      <th className="px-3 sm:px-4 py-3 w-24">Código</th>
                      <th className="px-3 sm:px-4 py-3 text-left w-80 max-w-[18rem] truncate">Ingrediente</th>
                      <th className="px-3 sm:px-4 py-3 text-right w-24">Qtd</th>
                      <th className="px-3 sm:px-4 py-3 w-28">Unidade</th>
                      <th className="px-3 sm:px-4 py-3 text-right w-24">PPU</th>
                      <th className="px-3 sm:px-4 py-3 text-right w-28">Custo</th>
                      <th className="px-3 sm:px-4 py-3 text-right w-28">Peso</th>
                      <th className="px-3 sm:px-4 py-3 w-72">Alergénios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficha.composicao.map((ing, idx) => (
                      <tr
                        key={`${ing.componente_codigo || 'linha'}-${idx}`}
                        className="border-t border-[var(--color-neutral-100)] hover:bg-surface-muted"
                      >
                        <td className="px-3 sm:px-4 py-3 text-subtle">{ing.ordem}</td>
                        <td className="px-3 sm:px-4 py-3 font-mono text-xs md:text-sm text-subtle">{ing.componente_codigo || '—'}</td>
                        <td className="px-3 sm:px-4 py-3 font-medium text-strong max-w-[18rem] truncate">{ing.componente_nome}</td>
                        <td className="px-3 sm:px-4 py-3 text-right text-subtle">{Number(ing.quantidade).toFixed(3)}</td>
                        <td className="px-3 sm:px-4 py-3 text-subtle">{ing.unidade}</td>
                        <td className="px-3 sm:px-4 py-3 text-right text-subtle">{Number(ing.ppu).toFixed(3)}</td>
                        <td className="px-3 sm:px-4 py-3 text-right font-semibold text-strong">{Number(ing.preco).toFixed(2)}€</td>
                        <td className="px-3 sm:px-4 py-3 text-right text-subtle">{Number(ing.peso).toFixed(3)}</td>
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex flex-wrap gap-2 max-w-xs md:max-w-md">
                            {(ing.alergenos || []).length === 0 && <span className="text-xs text-muted">—</span>}
                            {(ing.alergenos || []).map((al) => (
                              <span
                                key={`${al.codigo}-${ing.ordem}`}
                                className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100"
                              >
                                {al.nome || al.codigo}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {ficha.preparacao_html && (
                <div className="bg-surface-muted border border-soft rounded-lg p-4">
                  <h4 className="text-md font-semibold text-strong mb-2">Preparação</h4>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ficha.preparacao_html }} />
                </div>
              )}
            </div>
          </section>

          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-3">
              <h2 className="text-xl font-semibold text-strong">Alergénios</h2>
              {ficha.alergenos.length === 0 ? (
                <p className="text-sm text-subtle">Nenhum alergénio associado às linhas desta ficha.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ficha.alergenos.map((al) => (
                    <span
                      key={al.codigo}
                      className="text-xs px-3 py-1 rounded-full border border-[var(--color-error-200)] bg-error-soft text-error-strong"
                    >
                      {al.nome || al.codigo}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-6">
              <h2 className="text-xl font-semibold text-strong">Documentos</h2>
              <div>
                <h3 className="text-lg font-semibold text-strong mb-2">Anexos</h3>
                {documentos.length === 0 ? (
                  <p className="text-sm text-subtle">Sem anexos disponíveis para esta ficha técnica.</p>
                ) : (
                  <div className="divide-y divide-[var(--color-neutral-100)] border border-[var(--color-neutral-100)] rounded-lg">
                    {documentos.map((doc) => (
                      <div
                        key={doc.id || doc.nome}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentIcon className="w-5 h-5 text-muted" />
                          <div>
                            <p className="text-sm font-semibold text-strong">{doc.nome || doc.filename}</p>
                            <p className="text-xs text-muted">{doc.tipo || doc.mime || 'Documento'}</p>
                          </div>
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            className="inline-flex items-center gap-2 text-sm text-primary-strong font-semibold hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DocumentArrowDownIcon className="w-5 h-5" /> Transferir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-strong mb-2">Links úteis</h3>
                {links.length === 0 ? (
                  <p className="text-sm text-subtle">Nenhum link registado para esta ficha.</p>
                ) : (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 bg-surface-muted border border-[var(--color-neutral-100)] rounded-lg hover:bg-[var(--color-neutral-100)] transition"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon className="w-5 h-5 text-muted" />
                        <div>
                          <p className="text-sm font-semibold text-strong">{link.titulo || link.label || link.url}</p>
                          {link.descricao && <p className="text-xs text-muted">{link.descricao}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-4">
              <h2 className="text-xl font-semibold text-strong">Histórico</h2>
              <div className="bg-surface-muted border border-soft rounded-lg p-4 space-y-3">
                {historicoRegistos.map((evento, idx) => {
                  const Icone = evento.icon || ClockIcon

                  return (
                    <div key={evento.id || evento.titulo || idx} className="flex items-start gap-3">
                      <Icone className="w-5 h-5 text-muted mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-strong">{evento.titulo || 'Registo'}</p>
                        <p className="text-sm text-subtle">{evento.descricao || formatDate(evento.data)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="w-full bg-surface border border-soft rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 space-y-4">
              <h2 className="text-xl font-semibold text-strong">Comentários</h2>
              <p className="text-sm text-subtle">
                Integração com o backend de comentários pendente. Mantém as notas internas aqui quando o serviço estiver disponível.
              </p>
              <div className="border border-dashed border-strong rounded-lg p-4 text-center text-sm text-muted">
                Em breve poderás consultar e adicionar comentários ligados a esta ficha técnica.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
