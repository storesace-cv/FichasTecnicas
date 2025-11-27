from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from services.import_service import process_import
from config import Config

import_bp = Blueprint('import', __name__)

@import_bp.route('/import', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum ficheiro enviado"}), 400

    tipo = request.form.get('tipo')
    if not tipo:
        return jsonify({"error": "Tipo de importação em falta (produtos, fichas ou precos)"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nenhum ficheiro selecionado"}), 400

    if not file.filename.lower().endswith(('.xlsx', '.xls')):
        return jsonify({"error": "Apenas ficheiros Excel"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)

    result = process_import(filepath, tipo)
    status_code = 200 if result.get("status") == "sucesso" else 400

    return jsonify({
        "message": "Importação concluída",
        "detalhes": result
    }), status_code
