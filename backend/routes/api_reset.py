from flask import Blueprint, jsonify
from models import db
from config import Config
import os
import shutil

reset_bp = Blueprint('reset', __name__, url_prefix='/api')

@reset_bp.route('/reset-db', methods=['POST'])
def reset_database():
    try:
        db.session.remove()
        db.drop_all()
        db.engine.dispose()

        db_path = Config.SQLALCHEMY_DATABASE_URI.replace("sqlite:///", "", 1)
        if db_path and os.path.exists(db_path):
            os.remove(db_path)

        images_path = os.path.join(os.path.dirname(__file__), '..', 'databases', 'images')
        uploads_path = Config.UPLOAD_FOLDER

        for folder in [images_path, uploads_path, os.path.join(uploads_path, 'history')]:
            if os.path.exists(folder):
                for item in os.listdir(folder):
                    target = os.path.join(folder, item)
                    if os.path.isfile(target):
                        os.unlink(target)
                    else:
                        shutil.rmtree(target)

        db.create_all()

        return jsonify({"message": "Base de dados apagada e recriada! Tudo limpo."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
