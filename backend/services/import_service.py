import os
import re
import unicodedata
import shutil
from datetime import datetime

import pandas as pd
from flask import current_app

from models import (
    PrecoTaxa,
    Produto,
    FichaTecnica,
    FichaIngrediente,
    Ingrediente,
    Localizacao,
    db,
)


COLUMN_ALIASES = {
    "prodvenda": "codigo",
    "nomeprodvendanaonecessariopimportar": "nomeprodvenda",
    "familianaonecessariopimportar": "familia",
    "subfamilianaonecessariopimportar": "subfamilia",
    "unidade": "unidademedida",
}


def _normalize_header(header: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", str(header).strip().lower())
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    normalized = re.sub(r"[^a-z0-9]", "", ascii_text)
    return COLUMN_ALIASES.get(normalized, normalized)


def _load_single_sheet(file_path):
    try:
        xls = pd.ExcelFile(file_path)
    except Exception as exc:
        return None, [{"codigo": "E003", "mensagem": "Ficheiro não é Excel válido", "detalhe": str(exc)}]

    if len(xls.sheet_names) == 0:
        return None, [{"codigo": "E001", "mensagem": "Ficheiro sem folhas"}]
    if len(xls.sheet_names) > 1:
        return None, [{"codigo": "E002", "mensagem": "Ficheiro com mais de uma folha"}]

    df = pd.read_excel(xls, sheet_name=xls.sheet_names[0])
    df.columns = [_normalize_header(col) for col in df.columns]
    return df, []


def _parse_number(value, default=0.0):
    if pd.isna(value):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _parse_bool(value):
    if pd.isna(value):
        return None
    text = str(value).strip().lower()
    if text in {"1", "true", "sim", "yes", "y"}:
        return True
    if text in {"0", "false", "nao", "não", "no", "n"}:
        return False
    return None


def _validate_headers(df, required_sets):
    missing = [req for req in required_sets if not any(col in df.columns for col in req)]
    if missing:
        return [{"codigo": "E010", "mensagem": f"Cabeçalho obrigatório em falta: {sorted(list(m))[0]}"} for m in missing]
    return []


def _import_produtos(df, result, loc_pt):
    errors = _validate_headers(df, [{"codigo"}, {"produto", "nomeprodvenda"}])
    if errors:
        return errors

    for idx, row in df.iterrows():
        codigo = str(row.get("codigo", "")).strip()
        if not codigo:
            result["erros"].append({"codigo": "E020", "linha": idx + 2, "mensagem": "Linha sem código principal"})
            continue

        produto = Produto.query.filter_by(codigo=codigo).first()
        nome = row.get("produto") if not pd.isna(row.get("produto")) else row.get("nomeprodvenda")
        if not produto:
            produto = Produto(codigo=codigo, localizacao=loc_pt)
            db.session.add(produto)
            result["produtos"] += 1

        produto.nome = str(nome or "").strip() or produto.nome or codigo
        if "unidademedida" in df.columns:
            produto.unidade_medida = str(row.get("unidademedida") or produto.unidade_medida or "un")

        preco_bruto = None
        if "ppu" in df.columns:
            preco_bruto = row.get("ppu")
        elif "pcu" in df.columns:
            preco_bruto = row.get("pcu")
        elif "pcm" in df.columns:
            preco_bruto = row.get("pcm")
        if preco_bruto is not None:
            produto.preco_unitario = _parse_number(preco_bruto, produto.preco_unitario or 0)
        if "descontinuado" in df.columns:
            descontinuado = _parse_bool(row.get("descontinuado"))
            if descontinuado is True:
                produto.ativo = False
        if "iva1" in df.columns:
            produto.iva_percentagem = _parse_number(row.get("iva1"), produto.iva_percentagem or 0)
        ativo_val = row.get("ativo") if "ativo" in df.columns else None
        ativo_bool = _parse_bool(ativo_val)
        if ativo_bool is not None:
            produto.ativo = ativo_bool

    return []


def _import_fichas(df, result, loc_pt):
    errors = _validate_headers(df, [{"produtocodigo"}, {"componentecodigo"}, {"qtd"}, {"unidade"}])
    if errors:
        return errors

    df = df.dropna(subset=["produtocodigo"])

    for codigo_ficha, group in df.groupby("produtocodigo"):
        codigo_ficha = str(codigo_ficha).strip()
        first_row = group.iloc[0]

        existing = FichaTecnica.query.filter_by(codigo=codigo_ficha).first()
        if existing:
            FichaIngrediente.query.filter_by(ficha_id=existing.id).delete()
            db.session.delete(existing)
            db.session.flush()

        ficha = FichaTecnica(
            codigo=codigo_ficha,
            nome=str(first_row.get("produtonome") or first_row.get("produtocodigo") or "").strip(),
            porcoes=1,
            custo_total=0,
            localizacao=loc_pt,
        )
        db.session.add(ficha)
        db.session.flush()
        result["fichas"] += 1

        custo_total = 0

        for _, row in group.iterrows():
            comp_codigo = str(row.get("componentecodigo", "")).strip()
            if not comp_codigo:
                result["erros"].append({"codigo": "E020", "mensagem": "Linha sem código principal", "linha": int(_ + 2)})
                continue

            produto = Produto.query.filter_by(codigo=comp_codigo).first()
            if not produto:
                produto = Produto(
                    codigo=comp_codigo,
                    nome=str(row.get("componentenome") or comp_codigo),
                    unidade_medida=str(row.get("unidade") or "g"),
                    preco_unitario=_parse_number(row.get("ppu"), 0),
                    localizacao=loc_pt,
                )
                db.session.add(produto)
                db.session.flush()
                result["produtos"] += 1

            ingrediente = Ingrediente(
                produto=produto,
                quantidade=_parse_number(row.get("qtd"), 0),
                unidade=str(row.get("unidade") or "g"),
            )
            db.session.add(ingrediente)
            db.session.flush()

            custo_parcial = _parse_number(row.get("qtd"), 0) * _parse_number(row.get("ppu"), 0)
            custo_total += custo_parcial

            ficha_ing = FichaIngrediente(
                ficha=ficha,
                ingrediente=ingrediente,
                quantidade_ficha=_parse_number(row.get("qtd"), 0),
                custo_parcial=custo_parcial,
            )
            db.session.add(ficha_ing)
            result["ingredientes"] += 1

        ficha.custo_total = custo_total
        db.session.flush()

    return []


def _import_precos(df, result):
    errors = _validate_headers(df, [{"codigo"}, {"loja"}])
    if errors:
        return errors

    for idx, row in df.iterrows():
        codigo = str(row.get("codigo", "")).strip()
        loja = str(row.get("loja", "")).strip()

        if not codigo or not loja:
            result["erros"].append({"codigo": "E020", "linha": idx + 2, "mensagem": "Linha sem código principal"})
            continue

        preco = PrecoTaxa.query.filter_by(produto_codigo=codigo, loja=loja).first()
        if not preco:
            preco = PrecoTaxa(produto_codigo=codigo, loja=loja)
            db.session.add(preco)

        preco.preco1 = _parse_number(row.get("preco1"), preco.preco1 or 0)
        preco.preco2 = _parse_number(row.get("preco2"), preco.preco2 or 0)
        preco.preco3 = _parse_number(row.get("preco3"), preco.preco3 or 0)
        preco.preco4 = _parse_number(row.get("preco4"), preco.preco4 or 0)
        preco.preco5 = _parse_number(row.get("preco5"), preco.preco5 or 0)
        preco.iva1 = _parse_number(row.get("iva1"), preco.iva1 or 0)
        preco.iva2 = _parse_number(row.get("iva2"), preco.iva2 or 0)
        isencao = _parse_bool(row.get("isencaoiva"))
        if isencao is not None:
            preco.isencao_iva = isencao
        if "nomeprodvenda" in df.columns:
            preco.nome_prod_venda = str(row.get("nomeprodvenda") or preco.nome_prod_venda or "").strip()
        if "familia" in df.columns:
            preco.familia = str(row.get("familia") or preco.familia or "").strip()
        if "subfamilia" in df.columns:
            preco.subfamilia = str(row.get("subfamilia") or preco.subfamilia or "").strip()
        ativo_val = row.get("ativo") if "ativo" in df.columns else None
        ativo_bool = _parse_bool(ativo_val)
        if ativo_bool is not None:
            preco.ativo = ativo_bool

        result["precos"] += 1

    return []


def process_import(file_path, tipo):
    result = {"tipo": tipo, "fichas": 0, "ingredientes": 0, "produtos": 0, "precos": 0, "erros": []}

    tipo = (tipo or "").strip().lower()
    if tipo not in {"produtos", "fichas", "precos"}:
        return {"status": "erro", "erros": [{"codigo": "E011", "mensagem": "Tipo de importação desconhecido"}]}

    df, file_errors = _load_single_sheet(file_path)
    if file_errors:
        return {"status": "erro", "erros": file_errors}

    loc_pt = Localizacao.query.filter_by(codigo="PT").first()
    if not loc_pt:
        loc_pt = Localizacao(codigo="PT", nome="Portugal", moeda="EUR")
        db.session.add(loc_pt)
        db.session.flush()

    try:
        if tipo == "produtos":
            header_errors = _import_produtos(df, result, loc_pt)
        elif tipo == "fichas":
            header_errors = _import_fichas(df, result, loc_pt)
        else:
            header_errors = _import_precos(df, result)

        if header_errors:
            db.session.rollback()
            return {"status": "erro", "erros": header_errors}

        db.session.commit()
        result["status"] = "sucesso"

        history_path = os.path.join(current_app.config["UPLOAD_FOLDER"], "history")
        os.makedirs(history_path, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        shutil.move(file_path, os.path.join(history_path, f"{timestamp}_{os.path.basename(file_path)}"))

    except Exception as exc:
        db.session.rollback()
        result["status"] = "erro"
        result["erros"].append({"codigo": "E021", "mensagem": str(exc)})

    return result
