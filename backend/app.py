import os

from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, seed_alergenios_from_json
from routes.api_import import import_bp
from routes.api_fichas import fichas_bp
from routes.api_reset import reset_bp
from routes.api_referencias import referencias_bp
from routes.api_alergenios import alergenios_bp
from routes.api_pricing_policy import pricing_policy_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

app.register_blueprint(import_bp, url_prefix='/api')
app.register_blueprint(fichas_bp)   # já tem url_prefix dentro do ficheiro
app.register_blueprint(reset_bp)    # já tem url_prefix dentro do ficheiro
app.register_blueprint(referencias_bp)
app.register_blueprint(alergenios_bp)
app.register_blueprint(pricing_policy_bp)

with app.app_context():
    db.create_all()
    seed_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "resources", "allergens.json"))
    seed_alergenios_from_json(seed_file)
    print("BD pronta e rotas carregadas!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
