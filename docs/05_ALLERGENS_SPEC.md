# 05 – Especificação de Alergénios

## 1. Fonte oficial de alergénios

A lista canónica de alergénios usada pela aplicação é definida em:

- `docs/resources/allergens.json`

Formato de cada registo:

```json
{
  "id": <inteiro>,
  "nome": "<nome em PT>",
  "nome_ingles": "<nome em EN>",
  "descricao": "<texto opcional>",
  "exemplos": ["<exemplo1>", "<exemplo2>", "..."],
  "notas": "<texto opcional>"
}
