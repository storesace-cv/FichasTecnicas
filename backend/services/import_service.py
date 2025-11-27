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
    db,
)


COLUMN_ALIASES = {
    "prodvenda": "prodVenda",
    "nomeprodvendanaonecessariopimportar": "nomeProdVenda",
    "familianaonecessariopimportar": "familia",
    "subfamilianaonecessariopimportar": "subFamilia",
    "produtocodigo": "produtoCodigo",
    "produtonome": "produtoNome",
    "componentecodigo": "componenteCodigo",
    "componentenome": "componenteNome",
    "qtd": "qtd",
    "ppu": "ppu",
}


PRODUTO_FIELD_TYPES = {
    "codigo": str,
    "produto": str,
    "familia": str,
    "subFamilia": str,
    "codBarras": str,
    "afetaStock": "bool",
    "menu": "bool",
    "venda": "bool",
    "mercadoria": "bool",
    "producao": "bool",
    "generico": "bool",
    "intermedio": "bool",
    "servico": "bool",
    "unidade": str,
    "unVenda": str,
    "unInventario": str,
    "unProducao": str,
    "codAuxiliar": str,
    "codAuxiliar2": str,
    "pcu": float,
    "pcm": float,
    "descontinuado": "bool",
    "qtdNegativasNasCompras": "bool",
    "controlaNumerosDeSerie": "bool",
    "dispLojas": str,
    "pesoTransporte": float,
    "markup": float,
    "tipoDeProdutoSaftPsoie": str,
}

FICHA_FIELD_TYPES = {
    "familiaSubfamilia": str,
    "produtoCodigo": str,
    "produtoNome": str,
    "componenteCodigo": str,
    "componenteNome": str,
    "qtd": float,
    "unidade": str,
    "ppu": float,
    "preco": float,
    "peso": float,
}

PRECO_FIELD_TYPES = {
    "prodVenda": str,
    "loja": str,
    "ativo": "bool",
    "preco1": float,
    "preco2": float,
    "preco3": float,
    "preco4": float,
    "preco5": float,
    "iva1": float,
    "iva2": float,
    "isencaoIVA": "bool",
    "nomeProdVenda": str,
    "familia": str,
    "subFamilia": str,
}


def _to_camel(header: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", str(header).strip().lower())
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    parts = re.split(r"[^a-z0-9]+", ascii_text)
    parts = [p for p in parts if p]
    if not parts:
        return ""
    first, *rest = parts
    camel = first
    for piece in rest:
        camel += piece.capitalize()
    return camel


def _normalize_header(header: str) -> str:
    camel = _to_camel(header)
    return COLUMN_ALIASES.get(camel, camel)


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
    if text in {"1", "true", "sim", "yes", "y", "x"}:
        return True
    if text in {"0", "false", "nao", "não", "no", "n"}:
        return False
    return None


def _validate_headers(df, required_sets):
    missing = [req for req in required_sets if not any(col in df.columns for col in req)]
    if missing:
        return [
            {
                "codigo": "E010",
                "mensagem": f"Cabeçalho obrigatório em falta: {sorted(list(m))[0]}",
            }
            for m in missing
        ]
    return []


def _assign_value(instance, field, value, field_types):
    target_type = field_types.get(field)
    if target_type == "bool":
        parsed = _parse_bool(value)
        if parsed is None:
            return
        setattr(instance, field, parsed)
    elif target_type is float:
        setattr(instance, field, _parse_number(value, getattr(instance, field, 0) or 0))
    else:
        if pd.isna(value):
            return
        setattr(instance, field, str(value))


def _import_produtos(df, result):
    errors = _validate_headers(df, [{"codigo"}, {"produto"}])
    if errors:
        return errors

    for idx, row in df.iterrows():
        codigo = str(row.get("codigo", "")).strip()
        if not codigo:
            result["erros"].append({"codigo": "E020", "linha": idx + 2, "mensagem": "Linha sem código principal"})
            continue

        produto = Produto.query.filter_by(codigo=codigo).first()
        if not produto:
            produto = Produto(codigo=codigo, produto=str(row.get("produto") or codigo))
            db.session.add(produto)
            result["produtos"] += 1

        for field in PRODUTO_FIELD_TYPES:
            if field not in df.columns:
                continue
            _assign_value(produto, field, row.get(field), PRODUTO_FIELD_TYPES)

    return []


def _import_fichas(df, result):
    errors = _validate_headers(df, [{"produtoCodigo"}, {"componenteCodigo"}])
    if errors:
        return errors

    # agrupa por produto para recriar registos
    for codigo_ficha, group in df.groupby("produtoCodigo"):
        codigo_ficha = str(codigo_ficha or "").strip()
        if not codigo_ficha:
            continue

        Produto.query.filter_by(codigo=codigo_ficha).first() or db.session.add(
            Produto(codigo=codigo_ficha, produto=str(group.iloc[0].get("produtoNome") or codigo_ficha))
        )

        FichaTecnica.query.filter_by(codigo=codigo_ficha).delete()
        result["fichas"] += 0

        for _, row in group.iterrows():
            componente_codigo = str(row.get("componenteCodigo", "")).strip()
            if not componente_codigo:
                result["erros"].append({"codigo": "E020", "mensagem": "Linha sem componente", "linha": int(_ + 2)})
                continue

            ficha = FichaTecnica(codigo=codigo_ficha, componenteCodigo=componente_codigo)
            db.session.add(ficha)

            for field in FICHA_FIELD_TYPES:
                if field not in df.columns:
                    continue
                _assign_value(ficha, field, row.get(field), FICHA_FIELD_TYPES)

            result["fichas"] += 1

    return []


def _import_precos(df, result):
    errors = _validate_headers(df, [{"prodVenda"}, {"loja"}])
    if errors:
        return errors

    for idx, row in df.iterrows():
        codigo = str(row.get("prodVenda", "")).strip()
        loja = str(row.get("loja", "")).strip()

        if not codigo or not loja:
            result["erros"].append({"codigo": "E020", "linha": idx + 2, "mensagem": "Linha sem código principal"})
            continue

        produto = Produto.query.filter_by(codigo=codigo).first()
        if not produto:
            produto = Produto(codigo=codigo, produto=str(row.get("nomeProdVenda") or codigo))
            db.session.add(produto)
            db.session.flush()
            result["produtos"] += 1

        preco = PrecoTaxa.query.filter_by(produtoCodigo=codigo).first()
        if not preco:
            preco = PrecoTaxa(produtoCodigo=codigo, loja=loja)
            db.session.add(preco)

        for field in PRECO_FIELD_TYPES:
            if field not in df.columns:
                continue
            _assign_value(preco, field, row.get(field), PRECO_FIELD_TYPES)

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

    try:
        if tipo == "produtos":
            header_errors = _import_produtos(df, result)
        elif tipo == "fichas":
            header_errors = _import_fichas(df, result)
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
