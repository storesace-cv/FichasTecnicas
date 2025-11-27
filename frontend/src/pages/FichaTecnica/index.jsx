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
} from '@heroicons/react/24/outline'
import Breadcrumbs from '../../components/Breadcrumbs'
import PageHeader from '../../components/PageHeader'
import Tabs from '../../components/Tabs'
import LoadingSpinner from '../../components/LoadingSpinner'
import StateMessage from '../../components/StateMessage'
import FichaSkeleton from '../../components/FichaSkeleton'
import { fetchFichaByCodigo } from '../../services/fichas'

const tabs = [
  { label: 'Resumo', value: 'resumo' },
  { label: 'Especificações', value: 'especificacoes' },
  { label: 'Documentos', value: 'documentos' },
  { label: 'Histórico', value: 'historico' },
  { label: 'Comentários', value: 'comentarios' },
]

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
  const [activeTab, setActiveTab] = useState('resumo')

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

  const meta = ficha.meta || {}
  const documentos = ficha.documentos || []
  const links = ficha.links || []
  const atributosTecnicos = ficha.atributosTecnicos || {}
  const historicoRegistos =
    ficha.historico?.length > 0
      ? ficha.historico
      : [
          { icon: ClockIcon, titulo: 'Criação', descricao: `Ficha criada em ${formatDate(meta.criadoEm)}` },
          { icon: FolderIcon, titulo: 'Última atualização', descricao: `Registos atualizados em ${formatDate(meta.atualizadoEm)}` },
          { icon: UserCircleIcon, titulo: 'Responsável', descricao: meta.autor || 'Equipa não definida' },
        ]
  const isRefreshing = loading && !!ficha

  return (
    <div className="min-h-screen bg-surface-muted py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Fichas Técnicas', href: '/' },
            { label: ficha.nome || ficha.codigo || 'Ficha Técnica' },
          ]}
        />

        <PageHeader
          title={ficha.nome || 'Ficha Técnica'}
          subtitle={`Código interno: ${ficha.codigo}`}
          actions={
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-subtle bg-surface border border-soft rounded-lg hover:bg-[var(--color-neutral-100)]"
            >
              <ArrowLeftIcon className="w-5 h-5" /> Voltar
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ficha.descricao && (
            <div className="bg-surface border border-soft rounded-xl p-5 space-y-3">
              <h3 className="text-lg font-semibold text-strong">Descrição</h3>
              <p className="text-sm leading-relaxed text-subtle">{ficha.descricao}</p>
            </div>
          )}

          <div className="bg-surface border border-soft rounded-xl p-5 space-y-4">
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
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Validade</dt>
                <dd className="text-sm font-semibold text-strong">{atributosTecnicos.validade}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Temperatura</dt>
                <dd className="text-sm font-semibold text-strong">{atributosTecnicos.temperatura}</dd>
              </div>
              {atributosTecnicos.informacao_adicional && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted">Informação adicional</dt>
                  <dd className="text-sm text-subtle">{atributosTecnicos.informacao_adicional}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {isRefreshing && (
          <div className="bg-primary-soft border border-[var(--color-primary-200)] rounded-xl shadow-sm">
            <LoadingSpinner label="A atualizar a ficha técnica…" />
          </div>
        )}

        <div className="bg-surface border border-soft rounded-xl shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'resumo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-primary-soft rounded-lg p-4 border border-[var(--color-primary-200)]">
                    <p className="text-xs text-primary-strong uppercase tracking-wide">Custo registado</p>
                    <p className="text-2xl font-bold text-primary-strong">{ficha.totais.custo_total.toFixed(2)} €</p>
                  </div>
                  <div className="bg-secondary-soft rounded-lg p-4 border border-[var(--color-secondary-200)]">
                    <p className="text-xs text-secondary-strong uppercase tracking-wide">Custo calculado</p>
                    <p className="text-2xl font-bold text-secondary-strong">{ficha.custos.custo_calculado.toFixed(2)} €</p>
                  </div>
                  <div className="bg-warning-soft rounded-lg p-4 border border-[var(--color-warning-200)]">
                    <p className="text-xs text-warning-strong uppercase tracking-wide">Peso total</p>
                    <p className="text-2xl font-bold text-[var(--color-warning-800)]">
                      {ficha.totais.peso_total.toFixed(3)} {ficha.cabecalho.unidade_base}
                    </p>
                  </div>
                  <div className="bg-success-soft rounded-lg p-4 border border-[var(--color-success-200)]">
                    <p className="text-xs text-success-strong uppercase tracking-wide">Custo / unidade base</p>
                    <p className="text-2xl font-bold text-success-strong">{ficha.totais.custo_por_unidade_base.toFixed(3)} €</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-strong mb-3">Composição resumida</h3>
                    <div className="overflow-x-auto border border-[var(--color-neutral-100)] rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-surface-muted text-left text-subtle">
                          <tr>
                            <th className="px-4 py-3">Ordem</th>
                            <th className="px-4 py-3">Ingrediente</th>
                            <th className="px-4 py-3 text-right">Qtd</th>
                            <th className="px-4 py-3">Unidade</th>
                            <th className="px-4 py-3 text-right">Custo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ficha.composicao.map((ing) => (
                            <tr key={`${ing.componente_codigo}-${ing.ordem}`} className="border-t border-[var(--color-neutral-100)]">
                              <td className="px-4 py-3 text-subtle">{ing.ordem}</td>
                              <td className="px-4 py-3 font-medium text-strong">{ing.componente_nome}</td>
                              <td className="px-4 py-3 text-right text-subtle">{Number(ing.quantidade).toFixed(3)}</td>
                              <td className="px-4 py-3 text-subtle">{ing.unidade}</td>
                              <td className="px-4 py-3 text-right font-semibold text-strong">{Number(ing.preco).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-surface-muted border border-soft rounded-lg p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-strong">Alergénios</h3>
                    {ficha.alergenos.length === 0 ? (
                      <p className="text-sm text-subtle">Nenhum alergénio associado às linhas desta ficha.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ficha.alergenos.map((al) => (
                          <span key={al.codigo} className="text-xs px-3 py-1 rounded-full border border-[var(--color-error-200)] bg-error-soft text-error-strong">
                            {al.nome || al.codigo}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'especificacoes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-strong">Tabela de composição</h3>
                  {custoBadge}
                </div>
                <div className="overflow-x-auto border border-[var(--color-neutral-100)] rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-muted text-left text-subtle">
                      <tr>
                        <th className="px-4 py-3">Ordem</th>
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3">Ingrediente</th>
                        <th className="px-4 py-3 text-right">Qtd</th>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3 text-right">PPU</th>
                        <th className="px-4 py-3 text-right">Custo</th>
                        <th className="px-4 py-3 text-right">Peso</th>
                        <th className="px-4 py-3">Alergénios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ficha.composicao.map((ing, idx) => (
                        <tr key={`${ing.componente_codigo || 'linha'}-${idx}`} className="border-t border-[var(--color-neutral-100)] hover:bg-surface-muted">
                          <td className="px-4 py-3 text-subtle">{ing.ordem}</td>
                          <td className="px-4 py-3 font-mono text-xs text-subtle">{ing.componente_codigo || '—'}</td>
                          <td className="px-4 py-3 font-medium text-strong">{ing.componente_nome}</td>
                          <td className="px-4 py-3 text-right text-subtle">{Number(ing.quantidade).toFixed(3)}</td>
                          <td className="px-4 py-3 text-subtle">{ing.unidade}</td>
                          <td className="px-4 py-3 text-right text-subtle">{Number(ing.ppu).toFixed(3)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-strong">{Number(ing.preco).toFixed(2)} €</td>
                          <td className="px-4 py-3 text-right text-subtle">{Number(ing.peso).toFixed(3)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {(ing.alergenos || []).length === 0 && <span className="text-xs text-muted">—</span>}
                              {(ing.alergenos || []).map((al) => (
                                <span key={`${al.codigo}-${ing.ordem}`} className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
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
            )}

            {activeTab === 'documentos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-strong mb-2">Anexos</h3>
                  {documentos.length === 0 ? (
                    <p className="text-sm text-subtle">Sem anexos disponíveis para esta ficha técnica.</p>
                  ) : (
                    <div className="divide-y divide-[var(--color-neutral-100)] border border-[var(--color-neutral-100)] rounded-lg">
                      {documentos.map((doc) => (
                        <div key={doc.id || doc.nome} className="flex items-center justify-between px-4 py-3">
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
                          className="flex items-center gap-3 px-4 py-3 bg-surface-muted border border-[var(--color-neutral-100)] rounded-lg hover:bg-[var(--color-neutral-100)] transition"
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
            )}

            {activeTab === 'historico' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-strong">Histórico de alterações</h3>
                <div className="bg-surface-muted border border-soft rounded-lg p-4 space-y-3">
                  {historicoRegistos.map((evento, idx) => {
                    const Icone = evento.icon || ClockIcon

                    return (
                      <div key={evento.id || evento.titulo || idx} className="flex items-start gap-3">
                        <Icone className="w-5 h-5 text-muted mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-strong">{evento.titulo || 'Registo'}</p>
                          <p className="text-sm text-subtle">
                            {evento.descricao || formatDate(evento.data)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'comentarios' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-strong">Comentários</h3>
                <p className="text-sm text-subtle">
                  Integração com o backend de comentários pendente. Mantém as notas internas aqui quando o serviço estiver disponível.
                </p>
                <div className="border border-dashed border-strong rounded-lg p-4 text-center text-sm text-muted">
                  Em breve poderás consultar e adicionar comentários ligados a esta ficha técnica.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
