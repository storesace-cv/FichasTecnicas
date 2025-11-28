import uuid
from flask import Blueprint, jsonify, request
from models import db, TipoArtigo, Validade, Temperatura


def _serialize_registo(registo):
    data = {col.name: getattr(registo, col.name) for col in registo.__table__.columns}
    return data


def _get_model_info(nome):
    mapping = {
        "tipoartigos": (TipoArtigo, "TA"),
        "validades": (Validade, "VA"),
        "temperaturas": (Temperatura, "TP"),
    }
    return mapping.get(nome.lower())


def _gerar_codigo(model_cls, prefixo):
    base = prefixo.upper()
    while True:
        sufixo = uuid.uuid4().hex[:8].upper()
        candidato = f"{base}-{sufixo}"
        if not model_cls.query.filter_by(Codigo=candidato).first():
            return candidato


def _actualizar_campos(registo, payload):
    for coluna in registo.__table__.columns:
        nome = coluna.name
        if nome == "Codigo":
            continue
        if nome in payload:
            setattr(registo, nome, payload[nome])
    db.session.add(registo)


referencias_bp = Blueprint("referencias", __name__, url_prefix="/api/referencias")


@referencias_bp.route("/<nome>", methods=["GET"])
def listar_referencias(nome):
    info = _get_model_info(nome)
    if not info:
        return jsonify({"error": "Tabela de referência desconhecida"}), 404

    model_cls, _ = info
    registos = model_cls.query.order_by(model_cls.Descricao.asc()).all()
    return jsonify([_serialize_registo(r) for r in registos])


@referencias_bp.route("/<nome>", methods=["POST"])
def criar_referencia(nome):
    info = _get_model_info(nome)
    if not info:
        return jsonify({"error": "Tabela de referência desconhecida"}), 404

    model_cls, prefixo = info
    payload = request.get_json(force=True, silent=True) or {}

    novo = model_cls()
    novo.Codigo = _gerar_codigo(model_cls, prefixo)
    _actualizar_campos(novo, payload)

    db.session.add(novo)
    db.session.commit()

    return jsonify(_serialize_registo(novo)), 201


@referencias_bp.route("/<nome>/<codigo>", methods=["PUT"])
def actualizar_referencia(nome, codigo):
    info = _get_model_info(nome)
    if not info:
        return jsonify({"error": "Tabela de referência desconhecida"}), 404

    model_cls, _ = info
    registo = model_cls.query.filter_by(Codigo=codigo).first()
    if not registo:
        return jsonify({"error": "Registo não encontrado"}), 404

    payload = request.get_json(force=True, silent=True) or {}
    _actualizar_campos(registo, payload)
    db.session.commit()

    return jsonify(_serialize_registo(registo))
