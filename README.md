# Fichas Técnicas Web

Aplicação para gestão de fichas técnicas com:

- **Backend:** Python + Flask (API REST)
- **Frontend:** React (SPA)
- **Repo:** GitHub (código, issues, versionamento)

---

## 1. Arquitetura do projeto

Estrutura recomendada do repositório:

```bash
fichas-tecnicas-web/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── fichas/              # módulos de negócio (models, services, etc.)
│   └── ...                  
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...                  
├── docs/
│   ├── api.md               # documentação da API Flask
│   └── frontend.md          # notas de frontend
└── README.md


⸻

2. Pré-requisitos
	•	Git (para usar com GitHub)
	•	Python 3.10+
	•	Node.js 18+ e npm ou yarn
	•	Conta no GitHub

⸻

3. Criar o repositório no GitHub
	1.	Vai a github.com → New repository
	2.	Nome sugerido: fichas-tecnicas-web
	3.	Escolhe:
	•	Visibility: Private ou Public
	•	Sem template (Empty repo)
	4.	Clica em Create repository

No teu computador:

# Clonar o repo vazio
git clone https://github.com/<o_teu_utilizador>/fichas-tecnicas-web.git

cd fichas-tecnicas-web

# Criar as pastas base
mkdir backend frontend docs


⸻

4. Backend – Flask (API)

4.1. Criar ambiente virtual

Dentro da pasta backend:

cd backend

# Criar venv
python -m venv .venv

# Ativar venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

4.2. Instalar Flask

pip install Flask
pip freeze > requirements.txt

4.3. Criar ficheiro app.py

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # permitir pedidos do frontend (React)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "API Fichas Técnicas a correr!"})

# Exemplo de endpoint para listar fichas (placeholder)
@app.route("/api/fichas", methods=["GET"])
def listar_fichas():
    # TODO: substituir por dados reais (BD)
    fichas = [
        {"id": 1, "nome": "Ficha Exemplo 1"},
        {"id": 2, "nome": "Ficha Exemplo 2"},
    ]
    return jsonify(fichas)

if __name__ == "__main__":
    app.run(debug=True, port=5000)

4.4. Correr o backend

Na pasta backend (com venv ativo):

python app.py

A API fica disponível em:
http://localhost:5000/api/...

⸻

5. Frontend – React

5.1. Criar projeto React (com Vite, por exemplo)

Na raiz do repo (fichas-tecnicas-web/):

cd frontend

# com npm
npm create vite@latest . -- --template react

# Instalar dependências
npm install

5.2. Configurar chamada à API Flask

Editar src/App.jsx (exemplo simples):

import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [fichas, setFichas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then(setHealth)
      .catch(console.error);

    fetch("http://localhost:5000/api/fichas")
      .then((res) => res.json())
      .then(setFichas)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Fichas Técnicas Web</h1>

      <section>
        <h2>Estado da API</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>

      <section>
        <h2>Fichas</h2>
        <ul>
          {fichas.map((ficha) => (
            <li key={ficha.id}>{ficha.nome}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;

5.3. Correr o frontend

Na pasta frontend:

npm run dev

Por omissão, o React corre em http://localhost:5173.

⸻

6. Workflow de desenvolvimento
	1.	Terminal 1 – Backend

cd backend
source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
python app.py


	2.	Terminal 2 – Frontend

cd frontend
npm run dev


	3.	Abrir o browser em http://localhost:5173
O frontend React vai consumir a API Flask em http://localhost:5000.

⸻

7. Git e GitHub – fluxo recomendado

7.1. Primeiro commit

Na raiz do repositório:

git status
git add .
git commit -m "Setup inicial: backend Flask + frontend React"
git push origin main

7.2. Branches

Recomendação:
	•	main – versão estável
	•	dev – desenvolvimento
	•	branches por funcionalidade, por ex.:
	•	feature/backend-auth
	•	feature/frontend-listagem-fichas

Exemplo:

git checkout -b feature/frontend-listagem-fichas
# trabalhar...
git add .
git commit -m "Adicionar listagem básica de fichas no frontend"
git push origin feature/frontend-listagem-fichas

Depois, no GitHub, criar um Pull Request dessa branch para dev ou main.

⸻

8. Ficheiros de configuração úteis

8.1. .gitignore

Na raiz (fichas-tecnicas-web/.gitignore):

# Python
backend/.venv/
backend/__pycache__/
backend/*.pyc

# Node / React
frontend/node_modules/
frontend/dist/

# Outros
.DS_Store
.env

8.2. Variáveis de ambiente
	•	Backend (backend/.env – se usares, por ex. com python-dotenv):
	•	FLASK_ENV=development
	•	DATABASE_URL=...
	•	Frontend (frontend/.env):
	•	VITE_API_BASE_URL=http://localhost:5000

Depois no React:

const api = import.meta.env.VITE_API_BASE_URL;


⸻

9. Próximos passos
	•	Definir modelo de dados (fichas, ingredientes, custos, etc.)
	•	Integrar base de dados (PostgreSQL / MySQL / SQLite) no Flask
	•	Criar endpoints REST completos (CRUD de fichas, ingredientes, utilizadores, etc.)
	•	Criar layout e componentes React (tabelas, formulários, pesquisa)
	•	Autenticação (login, permissões)
	•	Deploy:
	•	Backend: por ex. Railway, Render, ou servidor próprio
	•	Frontend: por ex. GitHub Pages, Netlify, Vercel
