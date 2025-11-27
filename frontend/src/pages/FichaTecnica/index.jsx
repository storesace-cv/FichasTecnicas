import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
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
import { mapFichaResponse } from '../../services/fichas'

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

export default function FichaTecnicaPage() {
  const navigate = useNavigate()
  const { fichaId } = useParams()
  const [ficha, setFicha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumo')

  useEffect(() => {
    setLoading(true)
    axios
      .get(`/api/fichas/${fichaId}`)
      .then((res) => setFicha(mapFichaResponse(res.data)))
      .catch(() => setFicha(null))
      .finally(() => setLoading(false))
  }, [fichaId])

  const custoBadge = useMemo(() => {
    if (!ficha?.custos) return null
    return ficha.custos.consistente ? (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm font-semibold">
        Custo consistente
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-sm font-semibold">
        Diferença de {ficha.custos.diferenca.toFixed(2)} €
      </span>
    )
  }, [ficha])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">A carregar ficha técnica…</div>
  }

  if (!ficha) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center">
        <p className="text-3xl font-bold text-gray-800">Ficha técnica não encontrada</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Voltar à lista
        </button>
      </div>
    )
  }

  const meta = ficha.meta || {}
  const documentos = ficha.documentos || []
  const links = ficha.links || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5" /> Voltar
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
              <TagIcon className="w-4 h-4" /> Estado
            </div>
            <p className="text-lg font-semibold text-gray-900">{meta.estado || 'Rascunho'}</p>
            {custoBadge}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
              <ClockIcon className="w-4 h-4" /> Criado em
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatDate(meta.criadoEm)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
              <ClockIcon className="w-4 h-4" /> Atualizado em
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatDate(meta.atualizadoEm)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
              <UserCircleIcon className="w-4 h-4" /> Autor / Categoria
            </div>
            <p className="text-lg font-semibold text-gray-900">{meta.autor || 'Equipa não definida'}</p>
            <p className="text-sm text-gray-600">{meta.categoria || 'Sem categoria'}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'resumo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-blue-700 uppercase tracking-wide">Custo registado</p>
                    <p className="text-2xl font-bold text-blue-900">{ficha.totais.custo_total.toFixed(2)} €</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <p className="text-xs text-indigo-700 uppercase tracking-wide">Custo calculado</p>
                    <p className="text-2xl font-bold text-indigo-900">{ficha.custos.custo_calculado.toFixed(2)} €</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-xs text-amber-700 uppercase tracking-wide">Peso total</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {ficha.totais.peso_total.toFixed(3)} {ficha.cabecalho.unidade_base}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-green-700 uppercase tracking-wide">Custo / unidade base</p>
                    <p className="text-2xl font-bold text-green-900">{ficha.totais.custo_por_unidade_base.toFixed(3)} €</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Composição resumida</h3>
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
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
                            <tr key={`${ing.componente_codigo}-${ing.ordem}`} className="border-t border-gray-100">
                              <td className="px-4 py-3 text-gray-700">{ing.ordem}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">{ing.componente_nome}</td>
                              <td className="px-4 py-3 text-right text-gray-700">{Number(ing.quantidade).toFixed(3)}</td>
                              <td className="px-4 py-3 text-gray-700">{ing.unidade}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">{Number(ing.preco).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Alergénios</h3>
                    {ficha.alergenos.length === 0 ? (
                      <p className="text-sm text-gray-600">Nenhum alergénio associado às linhas desta ficha.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ficha.alergenos.map((al) => (
                          <span key={al.codigo} className="text-xs px-3 py-1 rounded-full border border-red-100 bg-red-50 text-red-700">
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
                  <h3 className="text-lg font-semibold text-gray-900">Tabela de composição</h3>
                  {custoBadge}
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
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
                        <tr key={`${ing.componente_codigo || 'linha'}-${idx}`} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{ing.ordem}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{ing.componente_codigo || '—'}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{ing.componente_nome}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{Number(ing.quantidade).toFixed(3)}</td>
                          <td className="px-4 py-3 text-gray-700">{ing.unidade}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{Number(ing.ppu).toFixed(3)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{Number(ing.preco).toFixed(2)} €</td>
                          <td className="px-4 py-3 text-right text-gray-700">{Number(ing.peso).toFixed(3)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {(ing.alergenos || []).length === 0 && <span className="text-xs text-gray-400">—</span>}
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
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Preparação</h4>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ficha.preparacao_html }} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anexos</h3>
                  {documentos.length === 0 ? (
                    <p className="text-sm text-gray-600">Sem anexos disponíveis para esta ficha técnica.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {documentos.map((doc) => (
                        <div key={doc.id || doc.nome} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <DocumentIcon className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{doc.nome || doc.filename}</p>
                              <p className="text-xs text-gray-500">{doc.tipo || doc.mime || 'Documento'}</p>
                            </div>
                          </div>
                          {doc.url && (
                            <a
                              href={doc.url}
                              className="inline-flex items-center gap-2 text-sm text-blue-700 font-semibold hover:underline"
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Links úteis</h3>
                  {links.length === 0 ? (
                    <p className="text-sm text-gray-600">Nenhum link registado para esta ficha.</p>
                  ) : (
                    <div className="space-y-3">
                      {links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{link.titulo || link.label || link.url}</p>
                            {link.descricao && <p className="text-xs text-gray-500">{link.descricao}</p>}
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
                <h3 className="text-lg font-semibold text-gray-900">Histórico de alterações</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Criação</p>
                      <p className="text-sm text-gray-600">Ficha criada em {formatDate(meta.criadoEm)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FolderIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Última atualização</p>
                      <p className="text-sm text-gray-600">Registos atualizados em {formatDate(meta.atualizadoEm)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCircleIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Responsável</p>
                      <p className="text-sm text-gray-600">{meta.autor || 'Equipa não definida'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comentarios' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Comentários</h3>
                <p className="text-sm text-gray-600">
                  Integração com o backend de comentários pendente. Mantém as notas internas aqui quando o serviço estiver disponível.
                </p>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
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
