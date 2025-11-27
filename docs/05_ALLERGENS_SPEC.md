# 05 – Especificação de Alergénios

## 1. Fonte oficial de dados

A lista oficial de alergénios existe em duas camadas:

1. **Ficheiro de seed/documentação**  
   - `docs/resources/allergens.json`  
   - Estrutura por registo (em snake_case):

   ```json
   {
     "id": 1,
     "nome": "Glúten",
     "nome_ingles": "Gluten",
     "descricao": "…",
     "exemplos": ["…"],
     "notas": "…"
   }
