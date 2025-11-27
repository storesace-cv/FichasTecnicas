from flask import Blueprint, jsonify
from models import FichaTecnica, FichaIngrediente, Ingrediente, Produto
from sqlalchemy.orm import joinedload

fichas_bp = Blueprint('fichas', __name__, url_prefix='/api')

@fichas_bp.route('/fichas', methods=['GET'])
def get_all_fichas():
    fichas = FichaTecnica.query.options(
        joinedload(FichaTecnica.ingredientes).joinedload(FichaIngrediente.ingrediente).joinedload(Ingrediente.produto)
    ).all()

    result = []
    for f in fichas:
        result.append({
            "id": f.id,
            "codigo": f.codigo,
            "nome": f.nome,
            "porcoes": f.porcoes or 1,
            "custo_total": float(f.custo_total or 0),
            "imagem_prato": f.imagem_prato,
            "ingredientes": [
                {
                    "quantidade_ficha": fi.quantidade_ficha or 0,
                    "custo_parcial": float(fi.custo_parcial or 0),
                    "produto": {
                        "nome": fi.ingrediente.produto.nome if fi.ingrediente.produto else "—",
                        "preco_unitario": float(fi.ingrediente.produto.preco_unitario or 0)
                    },
                    "ingrediente": {
                        "unidade": fi.ingrediente.unidade or "un"
                    }
                } for fi in f.ingredientes
            ]
        })
    return jsonify(result)

@fichas_bp.route('/fichas/<codigo>', methods=['GET'])
def get_ficha_by_codigo(codigo):
    ficha = FichaTecnica.query.options(
        joinedload(FichaTecnica.ingredientes).joinedload(FichaIngrediente.ingrediente).joinedload(Ingrediente.produto)
    ).filter_by(codigo=codigo).first()

    if not ficha:
        return jsonify({"error": "Ficha não encontrada"}), 404

    return jsonify({
        "id": ficha.id,
        "codigo": ficha.codigo,
        "nome": ficha.nome,
        "porcoes": ficha.porcoes or 1,
        "custo_total": float(ficha.custo_total or 0),
        "imagem_prato": ficha.imagem_prato,
        "ingredientes": [
            {
                "quantidade_ficha": fi.quantidade_ficha or 0,
                "custo_parcial": float(fi.custo_parcial or 0),
                "produto": {
                    "nome": fi.ingrediente.produto.nome if fi.ingrediente.produto else "—",
                    "preco_unitario": float(fi.ingrediente.produto.preco_unitario or 0)
                },
                "ingrediente": {
                    "unidade": fi.ingrediente.unidade or "un"
                }
            } for fi in ficha.ingredientes
        ]
    })
