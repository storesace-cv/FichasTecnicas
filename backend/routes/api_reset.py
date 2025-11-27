from flask import Blueprint, jsonify
from models import db
import os

reset_bp = Blueprint('reset', __name__, url_prefix='/api')

@reset_bp.route('/reset-db', methods=['POST'])
def reset_database():
    try:
        db.session.close_all()
        db.engine.dispose()
        db.drop_all()
        db.create_all()

        # Limpa imagens
        images_path = os.path.join(os.path.dirname(__file__), '..', 'databases', 'images')
        if os.path.exists(images_path):
            import shutil
            for f in os.listdir(images_path):
                os.unlink(os.path.join(images_path, f))

        return jsonify({"message": "Base de dados apagada e recriada! Tudo limpo."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
