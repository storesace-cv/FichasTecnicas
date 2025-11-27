from flask import Blueprint, jsonify
from models import FichaTecnica, Produto


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
