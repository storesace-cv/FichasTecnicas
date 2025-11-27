from flask import Blueprint, jsonify
from models import FichaTecnica, Produto


def _serialize_ficha(ficha: FichaTecnica):
    produto = ficha.produto
    return {
        "codigo": ficha.codigo,
        "produto_nome": ficha.produtoNome or (produto.produto if produto else None),
        "familia_subfamilia": ficha.familiaSubfamilia,
        "componente_codigo": ficha.componenteCodigo,
        "componente_nome": ficha.componenteNome,
        "qtd": float(ficha.qtd or 0),
        "unidade": ficha.unidade,
        "ppu": float(ficha.ppu or 0),
        "preco": float(ficha.preco or 0),
        "peso": float(ficha.peso or 0),
    }


fichas_bp = Blueprint('fichas', __name__, url_prefix='/api')


@fichas_bp.route('/fichas', methods=['GET'])
def get_all_fichas():
    fichas = FichaTecnica.query.all()
    return jsonify([_serialize_ficha(ficha) for ficha in fichas])


@fichas_bp.route('/fichas/<codigo>', methods=['GET'])
def get_ficha_by_codigo(codigo):
    fichas = FichaTecnica.query.filter_by(codigo=codigo).all()
    if not fichas:
        return jsonify({"error": "Ficha não encontrada"}), 404

    return jsonify([_serialize_ficha(ficha) for ficha in fichas])
