import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-super-secreto-123'
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'databases', 'ftv.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
    
    # Pastas
    UPLOAD_FOLDER = os.path.join(os.path.dirname(BASE_DIR), 'imports')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'history'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'databases', 'images'), exist_ok=True)
