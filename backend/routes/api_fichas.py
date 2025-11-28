from flask import Blueprint, jsonify, request
from models import FichaTecnica, Produto, db


def _calcular_preco_linha(ficha: FichaTecnica) -> float:
    if ficha.preco is not None:
        return float(ficha.preco or 0)

    qtd = float(ficha.qtd or 0)
    ppu = float(ficha.ppu or 0)
    return qtd * ppu


def _serialize_produto_ficha(produto: Produto):
    linhas = sorted(produto.fichas, key=lambda f: f.ordem or 0)

    composicao = []
    custo_calculado = 0.0
    peso_total = 0.0

    for idx, ficha in enumerate(linhas, start=1):
        preco_linha = _calcular_preco_linha(ficha)
        peso = float(ficha.peso or ficha.qtd or 0)

        custo_calculado += preco_linha
        peso_total += peso

        composicao.append(
            {
                "ordem": ficha.ordem or idx,
                "componente_codigo": ficha.componenteCodigo,
                "componente_nome": ficha.componenteNome,
                "qtd": float(ficha.qtd or 0),
                "unidade": ficha.unidade,
                "ppu": float(ficha.ppu or 0),
                "preco": preco_linha,
                "peso": peso,
            }
        )

    nome_produto = produto.produto or produto.nomeProdVenda or produto.codigo

    cabecalho = {
        "codigo": produto.codigo,
        "nome": nome_produto,
        "nome_prod_venda": produto.nomeProdVenda,
        "familia": produto.familia,
        "subfamilia": produto.subFamilia,
        "unidade_base": produto.unProduFtPV,
        "validade": produto.validade,
        "temperatura": produto.temperatura,
        "tipo_artigo": produto.tipoArtigo,
        "ativo": produto.ativo,
        "descontinuado": produto.descontinuado,
        "afeta_stk": produto.afetaStock,
        "menu": produto.menu,
        "informacao_adicional": produto.informacaoAdicional,
        "porcoes": 1,
    }

    custo_registado = custo_calculado
    porcoes = cabecalho.get("porcoes") or 1
    unidade_base = cabecalho.get("unidade_base") or "un"

    precos_taxas = None
    if produto.preco:
        precos_taxas = {
            "preco1": float(produto.preco.preco1 or 0),
            "preco2": float(produto.preco.preco2 or 0),
            "preco3": float(produto.preco.preco3 or 0),
            "preco4": float(produto.preco.preco4 or 0),
            "preco5": float(produto.preco.preco5 or 0),
        }

    return {
        "codigo": produto.codigo,
        "nome": cabecalho["nome"],
        "cabecalho": cabecalho,
        "composicao": composicao,
        "custos": {
            "custo_calculado": custo_calculado,
            "custo_registado": custo_registado,
            "consistente": abs(custo_registado - custo_calculado) < 0.01,
            "diferenca": custo_registado - custo_calculado,
        },
        "totais": {
            "peso_total": peso_total,
            "custo_total": custo_registado,
            "unidade_base": unidade_base,
            "custo_por_unidade_base": custo_registado / porcoes if porcoes else custo_registado,
        },
        "alergenos": [],
        "preparacao_html": None,
        "precos_taxas": precos_taxas,
    }


fichas_bp = Blueprint('fichas', __name__, url_prefix='/api')


@fichas_bp.route('/fichas', methods=['GET'])
def get_all_fichas():
    produtos_com_fichas = (
        Produto.query.outerjoin(FichaTecnica)
        .filter(FichaTecnica.id.isnot(None))
        .all()
    )

    return jsonify([_serialize_produto_ficha(produto) for produto in produtos_com_fichas])


@fichas_bp.route('/fichas/<codigo>', methods=['GET'])
def get_ficha_by_codigo(codigo):
    produto = Produto.query.filter_by(codigo=codigo).first()
    if not produto or not produto.fichas:
        return jsonify({"error": "Ficha não encontrada"}), 404

    return jsonify(_serialize_produto_ficha(produto))


@fichas_bp.route('/fichas/<codigo>/atributos', methods=['PATCH'])
def atualizar_atributos_tecnicos(codigo):
    produto = Produto.query.filter_by(codigo=codigo).first()
    if not produto or not produto.fichas:
        return jsonify({"error": "Ficha não encontrada"}), 404

    payload = request.get_json(silent=True) or {}

    campos = {
        "validade": "validade",
        "temperatura": "temperatura",
        "tipo_artigo": "tipoArtigo",
    }

    atualizou = False
    for payload_key, attr in campos.items():
        if payload_key in payload:
            setattr(produto, attr, payload[payload_key] or None)
            atualizou = True

    if not atualizou:
        return jsonify({"error": "Nenhum atributo para atualizar"}), 400

    db.session.commit()

    return jsonify(_serialize_produto_ficha(produto))
