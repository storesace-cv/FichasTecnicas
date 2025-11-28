from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import os
import uuid


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
    alergenios = db.relationship(
        "Alergenio",
        secondary="ProdutoAlergenios",
        back_populates="produtos",
        cascade="all",
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


class Alergenio(db.Model):
    __tablename__ = "Alergenios"

    Id = db.Column("Id", db.Integer, primary_key=True)
    Nome = db.Column("Nome", db.String(200), nullable=False)
    NomeIngles = db.Column("NomeIngles", db.String(200))
    Descricao = db.Column("Descricao", db.Text)
    Exemplos = db.Column("Exemplos", db.Text)
    Notas = db.Column("Notas", db.Text)

    produtos = db.relationship(
        "Produto",
        secondary="ProdutoAlergenios",
        back_populates="alergenios",
    )


class ProdutoAlergenio(db.Model):
    __tablename__ = "ProdutoAlergenios"

    Id = db.Column("Id", db.Integer, primary_key=True)
    ProdutoCodigo = db.Column(
        "ProdutoCodigo", db.String(50), db.ForeignKey("produtos.codigo"), nullable=False
    )
    AlergenioId = db.Column(
        "AlergenioId", db.Integer, db.ForeignKey("Alergenios.Id"), nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint("ProdutoCodigo", "AlergenioId", name="uq_produto_alergenio"),
    )


# ===================================================================
# TABELAS DE REFERÊNCIA
# ===================================================================


class TipoArtigo(db.Model):
    __tablename__ = "TiposArtigos"

    Codigo = db.Column("Codigo", db.String(50), primary_key=True, default=lambda: uuid.uuid4().hex[:12])
    Descricao = db.Column("Descricao", db.String(200), nullable=False)
    Ativo = db.Column("Ativo", db.Boolean, default=True)


class Validade(db.Model):
    __tablename__ = "Validades"

    Codigo = db.Column("Codigo", db.String(50), primary_key=True, default=lambda: uuid.uuid4().hex[:12])
    Descricao = db.Column("Descricao", db.String(200), nullable=False)
    Unidade = db.Column("Unidade", db.String(50), nullable=False)
    Valor = db.Column("Valor", db.Numeric(12, 4), nullable=False)
    Ativo = db.Column("Ativo", db.Boolean, default=True)


class Temperatura(db.Model):
    __tablename__ = "Temperaturas"

    Codigo = db.Column("Codigo", db.String(50), primary_key=True, default=lambda: uuid.uuid4().hex[:12])
    Descricao = db.Column("Descricao", db.String(200), nullable=False)
    Intervalo = db.Column("Intervalo", db.String(50))
    Ativo = db.Column("Ativo", db.Boolean, default=True)


class PricingPolicy(db.Model):
    __tablename__ = "PricingPolicies"

    Id = db.Column("Id", db.Integer, primary_key=True)
    PolicyKey = db.Column("PolicyKey", db.String(50), nullable=False)
    Country = db.Column("Country", db.String(100))
    ManualOverride = db.Column("ManualOverride", db.Boolean, default=False)
    CreatedAt = db.Column("CreatedAt", db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(
        "UpdatedAt", db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def serialize(self):
        return {
            "policyKey": self.PolicyKey,
            "country": self.Country,
            "manualOverride": bool(self.ManualOverride),
            "updatedAt": self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            "createdAt": self.CreatedAt.isoformat() if self.CreatedAt else None,
        }


# ===================================================================
# Utilities
# ===================================================================

def create_tables_and_seed():
    db.create_all()
    print("Tabelas criadas!")


def seed_alergenios_from_json(json_path: str):
    if not json_path:
        return

    if Alergenio.query.count() > 0:
        return

    if not os.path.exists(json_path):
        print(f"Ficheiro de seed de alergénios não encontrado em {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as handle:
        try:
            dados = json.load(handle)
        except json.JSONDecodeError:
            print("Ficheiro de alergénios inválido; ignorando seed.")
            return

    for entrada in dados or []:
        novo = Alergenio(
            Id=entrada.get("id"),
            Nome=entrada.get("nome"),
            NomeIngles=entrada.get("nome_ingles"),
            Descricao=entrada.get("descricao"),
            Exemplos="\n".join(entrada.get("exemplos", [])) if isinstance(entrada.get("exemplos"), list) else entrada.get("exemplos"),
            Notas=entrada.get("notas"),
        )
        db.session.add(novo)

    db.session.commit()
    print(f"Seed de alergénios aplicado a partir de {json_path}")
