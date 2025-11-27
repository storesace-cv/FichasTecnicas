from models import db, create_tables_and_seed

def init_db():
    create_tables_and_seed()
    print("BD inicializada com sucesso!")