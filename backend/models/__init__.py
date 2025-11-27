from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


# ===================================================================
# TABELAS PRINCIPAIS
# ===================================================================


class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column("codigo", db.String(50), unique=True, nullable=False, index=True)
    produto = db.Column("produto", db.String(200), nullable=False)
    familia = db.Column("familia", db.String(100))
    subFamilia = db.Column("subFamilia", db.String(100))
    codBarras = db.Column("codBarras", db.String(100))
    nomeProdVenda = db.Column("nomeProdVenda", db.String(200))
    informacaoAdicional = db.Column("informacaoAdicional", db.Text)
    afetaStock = db.Column("afetaStock", db.Boolean, default=False)
    menu = db.Column("menu", db.Boolean, default=False)
    venda = db.Column("venda", db.Boolean, default=False)
    mercadoria = db.Column("mercadoria", db.Boolean, default=False)
    producao = db.Column("producao", db.Boolean, default=False)
    generico = db.Column("generico", db.Boolean, default=False)
    intermedio = db.Column("intermedio", db.Boolean, default=False)
    servico = db.Column("servico", db.Boolean, default=False)
    unidade = db.Column("unidade", db.String(50))
    unVenda = db.Column("unVenda", db.String(50))
    unInventario = db.Column("unInventario", db.String(50))
    unProducao = db.Column("unProducao", db.String(50))
    tipoMercad = db.Column("tipoMercad", db.String(100))
    tipoVenda = db.Column("tipoVenda", db.String(100))
    tipoProducao = db.Column("tipoProducao", db.String(100))
    tipoGener = db.Column("tipoGener", db.String(100))
    unStockVMPG = db.Column("unStockVMPG", db.String(50))
    unVendaVMV = db.Column("unVendaVMV", db.String(50))
    unInvVMMMPG = db.Column("unInvVMMMPG", db.String(50))
    unProduFtPV = db.Column("unProduFtPV", db.String(50))
    tipoArtigo = db.Column("tipoArtigo", db.String(100))
    validade = db.Column("validade", db.String(100))
    temperatura = db.Column("temperatura", db.String(100))
    ativo = db.Column("ativo", db.Boolean, default=True)
    codAuxiliar = db.Column("codAuxiliar", db.String(100))
    codAuxiliar2 = db.Column("codAuxiliar2", db.String(100))
    pcu = db.Column("pcu", db.Numeric(12, 4))
    pcm = db.Column("pcm", db.Numeric(12, 4))
    descontinuado = db.Column("descontinuado", db.Boolean, default=False)
    qtdNegativasNasCompras = db.Column("qtdNegativasNasCompras", db.Boolean, default=False)
    controlaNumerosDeSerie = db.Column("controlaNumerosDeSerie", db.Boolean, default=False)
    dispLojas = db.Column("dispLojas", db.String(200))
    pesoTransporte = db.Column("pesoTransporte", db.Numeric(12, 4))
    markup = db.Column("markup", db.Numeric(12, 4))
    tipoDeProdutoSaftPsoie = db.Column("tipoDeProdutoSaftPsoie", db.String(50))
    dataAtualizacao = db.Column(
        "dataAtualizacao", db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    preco = db.relationship(
        "PrecoTaxa", back_populates="produto", uselist=False, cascade="all, delete-orphan"
    )
    fichas = db.relationship(
        "FichaTecnica", back_populates="produto", cascade="all, delete-orphan"
    )


class FichaTecnica(db.Model):
    __tablename__ = "fichas_tecnicas"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(
        "codigo", db.String(50), db.ForeignKey("produtos.codigo"), nullable=False, index=True
    )
    produtoNome = db.Column("produtoNome", db.String(200))
    familiaSubfamilia = db.Column("familiaSubfamilia", db.String(200))
    componenteCodigo = db.Column("componenteCodigo", db.String(50), nullable=False)
    componenteNome = db.Column("componenteNome", db.String(200))
    qtd = db.Column("qtd", db.Numeric(12, 4))
    unidade = db.Column("unidade", db.String(50))
    ppu = db.Column("ppu", db.Numeric(12, 4))
    preco = db.Column("preco", db.Numeric(12, 4))
    peso = db.Column("peso", db.Numeric(12, 4))
    ordem = db.Column("ordem", db.Integer)
    dataCriacao = db.Column("dataCriacao", db.DateTime, default=datetime.utcnow)
    dataAtualizacao = db.Column(
        "dataAtualizacao", db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    produto = db.relationship("Produto", back_populates="fichas")

    __table_args__ = (
        db.UniqueConstraint("codigo", "componenteCodigo", name="uq_ficha_codigo_componente"),
    )


class PrecoTaxa(db.Model):
    __tablename__ = "precos_taxas"

    id = db.Column(db.Integer, primary_key=True)
    produtoCodigo = db.Column(
        "produtoCodigo", db.String(50), db.ForeignKey("produtos.codigo"), unique=True, nullable=False
    )
    loja = db.Column("loja", db.String(100), nullable=False)
    ativo = db.Column("ativo", db.Boolean, default=True)
    preco1 = db.Column("preco1", db.Numeric(12, 4))
    preco2 = db.Column("preco2", db.Numeric(12, 4))
    preco3 = db.Column("preco3", db.Numeric(12, 4))
    preco4 = db.Column("preco4", db.Numeric(12, 4))
    preco5 = db.Column("preco5", db.Numeric(12, 4))
    iva1 = db.Column("iva1", db.Numeric(6, 2))
    iva2 = db.Column("iva2", db.Numeric(6, 2))
    isencaoIVA = db.Column("isencaoIVA", db.Boolean, default=False)
    nomeProdVenda = db.Column("nomeProdVenda", db.String(200))
    familia = db.Column("familia", db.String(100))
    subFamilia = db.Column("subFamilia", db.String(100))

    produto = db.relationship("Produto", back_populates="preco")


# ===================================================================
# Utilities
# ===================================================================

def create_tables_and_seed():
    db.create_all()
    print("Tabelas criadas!")
