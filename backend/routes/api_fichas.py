from flask import Blueprint, jsonify
from models import (
    FichaIngrediente,
    FichaTecnica,
    Ingrediente,
    IngredienteAlergeno,
    Produto,
)
from sqlalchemy.orm import joinedload


def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _serialize_ficha(ficha, include_composicao=True):
    produto_principal = Produto.query.filter_by(codigo=ficha.codigo).first()
    unidade_base = (produto_principal.unidade_medida if produto_principal else None) or "un"

    composicao = []
    alergeno_map = {}
    custo_calculado = 0.0
    peso_total = 0.0

    ingredientes_ordenados = sorted(
        ficha.ingredientes, key=lambda fi: getattr(fi.ingrediente, "ordem", None) or fi.id
    )

    for idx, fi in enumerate(ingredientes_ordenados, start=1):
        ingrediente = fi.ingrediente
        produto_comp = ingrediente.produto

        quantidade = _to_float(fi.quantidade_ficha, 0)
        unidade = ingrediente.unidade or (produto_comp.unidade_medida if produto_comp else "un")
        ppu = _to_float(produto_comp.preco_unitario, 0) if produto_comp else 0.0
        if ppu == 0 and quantidade:
            ppu = _to_float(fi.custo_parcial, 0) / quantidade

        custo = _to_float(fi.custo_parcial, quantidade * ppu)
        peso = quantidade

        custo_calculado += custo
        peso_total += peso

        alergenos_comp = []
        for ing_alerg in ingrediente.alergenos:
            if not ing_alerg.alergeno:
                continue
            entry = {
                "codigo": ing_alerg.alergeno.codigo,
                "nome": ing_alerg.alergeno.nome_pt,
                "nome_ingles": ing_alerg.alergeno.nome_en,
                "icone": ing_alerg.alergeno.icone,
            }
            alergenos_comp.append(entry)
            alergeno_map[ing_alerg.alergeno.codigo] = entry

        composicao.append(
            {
                "ordem": getattr(ingrediente, "ordem", None) or idx,
                "componente_codigo": produto_comp.codigo if produto_comp else None,
                "componente_nome": produto_comp.nome if produto_comp else None,
                "quantidade": quantidade,
                "unidade": unidade,
                "ppu": ppu,
                "preco": custo,
                "peso": peso,
                "alergenos": alergenos_comp,
            }
        )

    custo_registado = _to_float(ficha.custo_total, custo_calculado)
    porcoes = ficha.porcoes or 1
    custo_por_unidade_base = custo_calculado / porcoes if porcoes else custo_calculado

    cabecalho = {
        "codigo": ficha.codigo,
        "nome": ficha.nome,
        "unidade_base": unidade_base,
        "porcoes": porcoes,
        "ativo": ficha.ativo,
        "preco_venda_sugerido": _to_float(ficha.preco_venda_sugerido),
        "margem_percentagem": _to_float(ficha.margem_percentagem),
        "observacoes": ficha.observacoes,
    }

    if produto_principal:
        cabecalho.update(
            {
                "produto_codigo": produto_principal.codigo,
                "produto_nome": produto_principal.nome,
                "unidade_base": produto_principal.unidade_medida or unidade_base,
            }
        )

    payload = {
        "id": ficha.id,
        "codigo": ficha.codigo,
        "nome": ficha.nome,
        "custo_total": custo_registado,
        "cabecalho": cabecalho,
        "totais": {
            "peso_total": peso_total,
            "unidade_base": cabecalho.get("unidade_base") or unidade_base,
            "custo_total": custo_calculado,
            "custo_por_unidade_base": custo_por_unidade_base,
        },
        "custos": {
            "custo_registado": custo_registado,
            "custo_calculado": custo_calculado,
            "diferenca": custo_registado - custo_calculado,
            "consistente": abs(custo_registado - custo_calculado) < 0.01,
        },
        "alergenos": list(alergeno_map.values()),
        "preparacao_html":
            produto_principal.preparacao.html if produto_principal and produto_principal.preparacao else None,
        "imagem_prato": ficha.imagem_prato,
        "porcoes": porcoes,
    }

    if include_composicao:
        payload["composicao"] = composicao
        payload["ingredientes"] = composicao  # compatibilidade com UI anterior

    return payload

fichas_bp = Blueprint('fichas', __name__, url_prefix='/api')

@fichas_bp.route('/fichas', methods=['GET'])
def get_all_fichas():
    fichas = FichaTecnica.query.options(
        joinedload(FichaTecnica.ingredientes)
        .joinedload(FichaIngrediente.ingrediente)
        .joinedload(Ingrediente.produto),
        joinedload(FichaTecnica.ingredientes)
        .joinedload(FichaIngrediente.ingrediente)
        .joinedload(Ingrediente.alergenos)
        .joinedload(IngredienteAlergeno.alergeno),
    ).all()

    result = [_serialize_ficha(ficha, include_composicao=False) for ficha in fichas]
    return jsonify(result)

@fichas_bp.route('/fichas/<codigo>', methods=['GET'])
def get_ficha_by_codigo(codigo):
    ficha = FichaTecnica.query.options(
        joinedload(FichaTecnica.ingredientes)
        .joinedload(FichaIngrediente.ingrediente)
        .joinedload(Ingrediente.produto),
        joinedload(FichaTecnica.ingredientes)
        .joinedload(FichaIngrediente.ingrediente)
        .joinedload(Ingrediente.alergenos)
        .joinedload(IngredienteAlergeno.alergeno),
    ).filter_by(codigo=codigo).first()

    if not ficha:
        return jsonify({"error": "Ficha não encontrada"}), 404

    return jsonify(_serialize_ficha(ficha))
