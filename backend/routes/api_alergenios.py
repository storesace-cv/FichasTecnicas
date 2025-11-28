from flask import Blueprint, jsonify

from models import Alergenio


def _serialize_alergeno(registo: Alergenio):
    return {
        "id": registo.Id,
        "nome": registo.Nome,
        "nome_ingles": registo.NomeIngles,
        "descricao": registo.Descricao,
        "exemplos": registo.Exemplos,
        "notas": registo.Notas,
    }


alergenios_bp = Blueprint("alergenios", __name__, url_prefix="/api/alergenios")


@alergenios_bp.route("", methods=["GET"])
def listar_alergenios():
    registos = Alergenio.query.order_by(Alergenio.Nome.asc()).all()
    return jsonify([_serialize_alergeno(r) for r in registos])

