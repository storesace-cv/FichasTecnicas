from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.orm import relationship

db = SQLAlchemy()

# ===================================================================
# TABELAS PRINCIPAIS
# ===================================================================

class Localizacao(db.Model):
    __tablename__ = "localizacoes"
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(10), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    moeda = db.Column(db.String(10), nullable=False)
    formato_data = db.Column(db.String(20), default="dd/MM/yyyy")
    separador_decimal = db.Column(db.String(1), default=",")
    separador_milhar = db.Column(db.String(1), default=".")

    fichas = relationship("FichaTecnica", back_populates="localizacao")
    produtos = relationship("Produto", back_populates="localizacao")

class Produto(db.Model):
    __tablename__ = "produtos"
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False, index=True)
    nome = db.Column(db.String(200), nullable=False)
    unidade_medida = db.Column(db.String(20), default="un")
    preco_unitario = db.Column(db.Numeric(12, 4), default=0.0000)
    iva_percentagem = db.Column(db.Numeric(6, 2), default=0.00)
    imagem_nome = db.Column(db.String(255))
    ativo = db.Column(db.Boolean, default=True)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    localizacao_id = db.Column(db.Integer, db.ForeignKey("localizacoes.id"), nullable=False)
    localizacao = relationship("Localizacao", back_populates="produtos")
    ingredientes = relationship("Ingrediente", back_populates="produto", cascade="all, delete-orphan")

class Alergeno(db.Model):
    __tablename__ = "alergenos"
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(10), unique=True, nullable=False)
    nome_pt = db.Column(db.String(100), nullable=False)
    nome_en = db.Column(db.String(100))
    icone = db.Column(db.String(50))
    obrigatorio_ue = db.Column(db.Boolean, default=False)

    ingredientes = relationship("IngredienteAlergeno", back_populates="alergeno")

class Ingrediente(db.Model):
    __tablename__ = "ingredientes"
    id = db.Column(db.Integer, primary_key=True)
    produto_codigo = db.Column(db.String(50), db.ForeignKey("produtos.codigo"), nullable=False)
    quantidade = db.Column(db.Numeric(12, 4), nullable=False)
    unidade = db.Column(db.String(20), default="g")
    observacoes = db.Column(db.Text)

    produto = relationship("Produto", back_populates="ingredientes")
    alergenos = relationship("IngredienteAlergeno", back_populates="ingrediente", cascade="all, delete-orphan")
    fichas = relationship("FichaIngrediente", back_populates="ingrediente")

class IngredienteAlergeno(db.Model):
    __tablename__ = "ingrediente_alergenos"
    id = db.Column(db.Integer, primary_key=True)
    ingrediente_id = db.Column(db.Integer, db.ForeignKey("ingredientes.id"), nullable=False)
    alergeno_id = db.Column(db.Integer, db.ForeignKey("alergenos.id"), nullable=False)

    ingrediente = relationship("Ingrediente", back_populates="alergenos")
    alergeno = relationship("Alergeno", back_populates="ingredientes")

class FichaTecnica(db.Model):
    __tablename__ = "fichas_tecnicas"
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False, index=True)
    nome = db.Column(db.String(200), nullable=False)
    porcoes = db.Column(db.Integer, default=1)
    custo_total = db.Column(db.Numeric(12, 4), default=0.0000)
    preco_venda_sugerido = db.Column(db.Numeric(12, 4))
    margem_percentagem = db.Column(db.Numeric(6, 2))
    observacoes = db.Column(db.Text)
    imagem_prato = db.Column(db.String(255))
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    localizacao_id = db.Column(db.Integer, db.ForeignKey("localizacoes.id"), nullable=False)
    localizacao = relationship("Localizacao", back_populates="fichas")
    ingredientes = relationship("FichaIngrediente", back_populates="ficha", cascade="all, delete-orphan")

class FichaIngrediente(db.Model):
    __tablename__ = "ficha_ingredientes"
    id = db.Column(db.Integer, primary_key=True)
    ficha_id = db.Column(db.Integer, db.ForeignKey("fichas_tecnicas.id"), nullable=False)
    ingrediente_id = db.Column(db.Integer, db.ForeignKey("ingredientes.id"), nullable=False)
    quantidade_ficha = db.Column(db.Numeric(12, 4), nullable=False)
    custo_parcial = db.Column(db.Numeric(12, 4), default=0.0000)

    ficha = relationship("FichaTecnica", back_populates="ingredientes")
    ingrediente = relationship("Ingrediente", back_populates="fichas")
    # REMOVIDO o backref errado! Produto não tem FK direta aqui → removido backref="usado_em_fichas"

# ===================================================================
# Seed inicial
# ===================================================================
def create_tables_and_seed():
    db.create_all()

    # Localizações
    locs = [
        {"codigo": "PT", "nome": "Portugal", "moeda": "EUR"},
        {"codigo": "CV", "nome": "Cabo Verde", "moeda": "CVE"},
        {"codigo": "AO", "nome": "Angola", "moeda": "AOA"},
    ]
    for loc in locs:
        if not Localizacao.query.filter_by(codigo=loc["codigo"]).first():
            db.session.add(Localizacao(**loc))

    # Alergénios UE
    alergenos = [
        ("GL", "Glúten", "Gluten", "gluten.svg", True),
        ("CR", "Crustáceos", "Crustaceans", "crustaceos.svg", True),
        ("OV", "Ovos", "Eggs", "ovos.svg", True),
        ("PE", "Peixes", "Fish", "peixe.svg", True),
        ("AM", "Amendoins", "Peanuts", "amendoim.svg", True),
        ("SO", "Soja", "Soy", "soja.svg", True),
        ("LA", "Leite/Lactose", "Milk", "leite.svg", True),
        ("FR", "Frutos de casca rija", "Nuts", "frutos_secos.svg", True),
        ("AI", "Aipo", "Celery", "aipo.svg", True),
        ("MO", "Mostarda", "Mustard", "mostarda.svg", True),
        ("SE", "Sementes de sésamo", "Sesame", "sesamo.svg", True),
        ("SU", "Dióxido de enxofre e sulfitos", "Sulphites", "sulfitos.svg", True),
        ("LU", "Tremoço", "Lupin", "tremoco.svg", True),
        ("ML", "Moluscos", "Molluscs", "moluscos.svg", True),
    ]
    for cod, pt, en, icone, ue in alergenos:
        if not Alergeno.query.filter_by(codigo=cod).first():
            db.session.add(Alergeno(codigo=cod, nome_pt=pt, nome_en=en, icone=icone, obrigatorio_ue=ue))

    db.session.commit()
    print("Tabelas criadas e seed inicial concluído!")
