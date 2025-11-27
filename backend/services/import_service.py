import os
import shutil
import pandas as pd
from datetime import datetime
from flask import current_app
from models import db, Produto, Ingrediente, FichaTecnica, FichaIngrediente, Localizacao

def process_import(file_path):
    result = {"fichas": 0, "ingredientes": 0, "produtos": 0, "erros": []}

    try:
        df = pd.read_excel(file_path, sheet_name=0)
        df.columns = [
            'familia_subfamilia', 'fichas_tecnicas_produto_codigo', 'fichas_tecnicas_produto_nome',
            'fichas_tecnicas_componente_codigo', 'fichas_tecnicas_componente_nome', 'fichas_tecnicas_qtd',
            'fichas_tecnicas_unidade', 'fichas_tecnicas_ppu', 'fichas_tecnicas_preco', 'fichas_tecnicas_peso'
        ]

        df = df.dropna(subset=['fichas_tecnicas_produto_codigo'])
        loc_pt = Localizacao.query.filter_by(codigo="PT").first()

        for codigo_ficha, group in df.groupby('fichas_tecnicas_produto_codigo'):
            codigo_ficha = str(codigo_ficha).strip()
            first_row = group.iloc[0]

            # === OVERWRITE TOTAL: se existir, apaga tudo relacionado ===
            existing = FichaTecnica.query.filter_by(codigo=codigo_ficha).first()
            if existing:
                FichaIngrediente.query.filter_by(ficha_id=existing.id).delete()
                db.session.delete(existing)
                db.session.flush()

            # === Cria nova ficha ===
            ficha = FichaTecnica(
                codigo=codigo_ficha,
                nome=str(first_row['fichas_tecnicas_produto_nome']).strip(),
                porcoes=1,
                custo_total=0,
                localizacao=loc_pt
            )
            db.session.add(ficha)
            db.session.flush()
            result["fichas"] += 1

            custo_total = 0

            for _, row in group.iterrows():
                comp_codigo = str(row['fichas_tecnicas_componente_codigo']).strip()

                # Produto (ingrediente bruto)
                produto = Produto.query.filter_by(codigo=comp_codigo).first()
                if not produto:
                    produto = Produto(
                        codigo=comp_codigo,
                        nome=str(row['fichas_tecnicas_componente_nome']).strip(),
                        unidade_medida=str(row['fichas_tecnicas_unidade']),
                        preco_unitario=float(row['fichas_tecnicas_ppu'] or 0),
                        localizacao=loc_pt
                    )
                    db.session.add(produto)
                    db.session.flush()
                    result["produtos"] += 1

                # Ingrediente
                ingrediente = Ingrediente(
                    produto=produto,
                    quantidade=float(row['fichas_tecnicas_qtd'] or 0),
                    unidade=str(row['fichas_tecnicas_unidade'])
                )
                db.session.add(ingrediente)
                db.session.flush()

                # FichaIngrediente
                custo_parcial = float(row['fichas_tecnicas_qtd'] or 0) * float(row['fichas_tecnicas_ppu'] or 0)
                custo_total += custo_parcial

                ficha_ing = FichaIngrediente(
                    ficha=ficha,
                    ingrediente=ingrediente,
                    quantidade_ficha=float(row['fichas_tecnicas_qtd'] or 0),
                    custo_parcial=custo_parcial
                )
                db.session.add(ficha_ing)
                result["ingredientes"] += 1

            ficha.custo_total = custo_total
            db.session.flush()

        db.session.commit()
        result["status"] = "sucesso"

        # Move para history
        history_path = os.path.join(current_app.config['UPLOAD_FOLDER'], "history")
        os.makedirs(history_path, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        shutil.move(file_path, os.path.join(history_path, f"{timestamp}_{os.path.basename(file_path)}"))

    except Exception as e:
        db.session.rollback()
        result["status"] = "erro"
        result["erros"].append(str(e))

    return result
