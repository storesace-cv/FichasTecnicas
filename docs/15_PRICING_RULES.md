# 15 – Regras Oficiais de Cálculo — Rácio, Food Cost, Custos Operacionais, Preço de Venda (com IVA) e Política de Preços

---

# 1. Rácio de um Prato (Multiplicador de Custo)

O **Rácio** é o multiplicador aplicado ao custo total do prato (incluindo custos operacionais) para obter o **Preço de Venda Sem IVA (PVSI)**.

    Rácio = PreçoDeVendaSemIVA / CustoTotalDoPrato

Relação direta com o Food Cost:

    Rácio = 1 / FoodCostDecimal

Interpretação prática:

| Rácio | FC%  | Interpretação     |
|-------|------|-------------------|
| 3     | ~33% | Margem aceitável  |
| 4     | 25%  | Boa margem        |
| 5     | 20%  | Muito boa         |
| 6–7   | 14–17% | Excelente       |

---

# 2. Food Cost (%)

O **Food Cost** representa a percentagem do preço sem IVA que corresponde ao custo dos ingredientes.

    FoodCost% = (CustoTotal / PreçoDeVendaSemIVA) × 100

⚠️ O Food Cost é sempre calculado **sem IVA**.

Exemplos típicos:
- 25% → restauração tradicional  
- 30% → menus  
- 18–22% → pratos premium  

---

# 3. Custos Operacionais (Overhead Cost)

Incluem, entre outros:

- eletricidade  
- gás  
- água  
- mão de obra direta  
- desperdício natural  
- consumíveis (óleo, detergentes)  
- manutenção e equipamento  

Aplicação:

    CustoComOperacionais = CustoIngredientes × (1 + PercentualOperacionais)

Percentuais típicos:

- 10% → fast food  
- 15% → restauração generalista  
- 20% → premium  
- 25% → produtos de alta complexidade  

---

# 4. Cálculo Profissional do Preço de Venda (com IVA)

O cálculo profissional tem **4 etapas**.

## 4.1 Custo dos ingredientes

    CustoIngredientes = soma(Quantidade × PrecoUnitario)

## 4.2 Aplicação dos custos operacionais

    CustoComOperacionais = CustoIngredientes × (1 + PercentualOperacionais)

## 4.3 Preço de Venda Sem IVA (PVSI)

### Método A — Food Cost alvo

    PVSI = CustoComOperacionais / FoodCostAlvoDecimal

### Método B — Rácio

    PVSI = CustoComOperacionais × Rácio

## 4.4 Preço Final Com IVA

    PVP = PVSI × (1 + IVA/100)

---

# 5. Exemplos Profissionais

Os exemplos numéricos devem seguir sempre a sequência:

1. Calcular CustoIngredientes  
2. Aplicar PercentualOperacionais → CustoComOperacionais  
3. Calcular PVSI:
   - via Food Cost alvo, ou  
   - via Rácio  
4. Aplicar IVA → PVP  
5. Só depois aplicar a Política de Preços (arredondamento).

---

# 6. Política de Preços (Arredondamento)

A política de preços determina como o valor final (já com IVA) deve ser arredondado para apresentação comercial.

Ela é aplicada **depois** de:

1. cálculo dos custos,  
2. aplicação dos custos operacionais,  
3. cálculo do PVSI,  
4. aplicação do IVA.

---

# 7. Métodos Profissionais de Arredondamento

A aplicação suporta **sete** métodos de arredondamento. Cada método deve ser explicado de forma clara na UI.

### 7.1 Arredondamento Comercial Clássico (“.00” ou “.50”)

Arredonda o preço para valores como 10,00 €, 10,50 €, 11,00 €.

Exemplos:

- 10,32 → 10,50  
- 10,66 → 11,00  

### 7.2 Psychological Pricing (“.90” ou “.99”)

Usa preços psicológicos que “parecem mais baixos”, como 9,90 €, 9,95 €, 9,99 €.

Exemplos:

- 10,32 → 10,90  
- 10,66 → 10,90  
- 11,10 → 11,90  

### 7.3 Arredondamento Premium — termina em .00

Arredonda sempre para o euro inteiro superior, dando uma imagem mais premium.

Exemplos:

- 10,32 → 11,00  
- 14,71 → 15,00  

### 7.4 Arredondamento rígido ao euro

Arredonda para o euro mais próximo (para cima ou para baixo). Usado em cantinas e coletividades.

Exemplos:

- 10,32 → 10,00  
- 10,66 → 11,00  

### 7.5 Arredondamento ao múltiplo mais próximo (0,05 ou 0,10)

Arredonda ao múltiplo mais próximo de 0,05 € ou 0,10 €, típico em cafetarias e bares.

Exemplos:

- passo 0,05 → 10,32 → 10,30  
- passo 0,10 → 10,36 → 10,40  

(O passo concreto — 0,05 ou 0,10 — pode ser futuramente configurável.)

### 7.6 Garantia de margem mínima

Ajusta o preço ao valor mínimo que respeita um Food Cost máximo (por exemplo 30%), podendo depois aplicar um arredondamento adicional para cima.

Exemplo:

- Preço mínimo para FC máximo de 30% = 10,12 €  
- Sistema arredonda para o próximo preço que mantém ou melhora essa margem (por exemplo 10,50 € ou 10,90 €).

### 7.7 Arredondamento corporativo (lista de finais permitidos)

O preço final tem de terminar com um conjunto de finais predefinidos (por exemplo .00, .50, .90, .95), muito usado em cadeias e grupos.

Exemplo:

- finais permitidos: {0,00; 0,50; 0,90}  
- 10,32 → 10,50  
- 10,76 → 10,90  

---

# 8. Política de Preços por País (Valores por Defeito)

Quando o País é definido em `Configuração → Regionalização`, a aplicação pode sugerir uma política de preços por defeito, **apenas se o utilizador ainda não tiver escolhido nenhuma política manualmente**.

| País        | Política de Preços por Defeito                                           |
|------------|---------------------------------------------------------------------------|
| Portugal   | 5. Arredondamento ao múltiplo mais próximo (0,05 / 0,10)                 |
| Angola     | 3. Arredondamento Premium — termina em .00                               |
| Cabo Verde | 1. Arredondamento Comercial Clássico (“.00” ou “.50”)                    |

O utilizador pode sempre alterar a política de preços e escolher qualquer um dos sete métodos.

---

# 9. Tipos de Negócio e Defaults de Cálculo PVP

Consoante o tipo de negócio selecionado em `Configuração → Food Cost → Tipo de Negócio`, a aplicação sugere valores padrão para:

- Percentagem de custos operacionais (%)  
- Food cost alvo (%)  
- Food cost alvo (decimal)  
- Rácio de multiplicação  

Valores recomendados:

| Tipo de Negócio            | Custos Operacionais | FC alvo | FC decimal | Rácio |
|----------------------------|---------------------|---------|------------|-------|
| Hotéis                     | 18%                 | 30%     | 0,30       | 3,3   |
| Restauração Tradicional    | 15%                 | 30%     | 0,30       | 3,5   |
| Cadeias                    | 12%                 | 25%     | 0,25       | 4,0   |
| Consultores de F&B         | 15%                 | 27%     | 0,27       | 3,7   |

Em todos os ecrãs de configuração de cálculo PVP deve existir um botão:

> **Repor valores por defeito**

que volta a aplicar os valores acima para o tipo de negócio selecionado (sem afetar outras configurações, a menos que o utilizador o peça explicitamente).

---

# 10. Regras Obrigatórias para Implementação

1. O Food Cost e o Rácio são sempre calculados **sem IVA**.  
2. Os custos operacionais são aplicados **antes** do cálculo de PVSI.  
3. A ordem dos cálculos é fixa:

       Ingredientes → Operacionais → PVSI → IVA → Arredondamento

4. A Política de Preços (arredondamento) é sempre aplicada ao **PVP final** (já com IVA).  
5. Defaults por país só se aplicam quando ainda não existe escolha manual do utilizador.  
6. Qualquer alteração futura às regras de cálculo deve ser primeiro refletida neste documento e só depois implementada em código.
