import axios from 'axios';

export const PRICING_POLICY_OPTIONS = [
  {
    key: 'classic',
    title: 'Arredondamento Comercial Clássico (.00 ou .50)',
    description: 'Arredonda o preço para valores como 10,00 €, 10,50 €, 11,00 €.',
    examples: 'Ex.: 10,32 → 10,50 · 10,66 → 11,00',
  },
  {
    key: 'psychological',
    title: 'Psychological Pricing (.90 / .99)',
    description: 'Usa preços psicológicos que parecem mais baixos, como 9,90 €, 9,95 €, 9,99 €.',
    examples: 'Ex.: 10,32 → 10,90 · 10,66 → 10,90 · 11,10 → 11,90',
  },
  {
    key: 'premium',
    title: 'Arredondamento Premium — termina em .00',
    description: 'Arredonda sempre para o euro inteiro superior, transmitindo imagem mais premium.',
    examples: 'Ex.: 10,32 → 11,00 · 14,71 → 15,00',
  },
  {
    key: 'strictEuro',
    title: 'Arredondamento rígido ao euro',
    description: 'Arredonda para o euro mais próximo (para cima ou para baixo), usado em cantinas/coletividades.',
    examples: 'Ex.: 10,32 → 10,00 · 10,66 → 11,00',
  },
  {
    key: 'nearestMultiple',
    title: 'Arredondamento ao múltiplo mais próximo (0,05 ou 0,10)',
    description: 'Arredonda ao múltiplo mais próximo de 0,05 € ou 0,10 €, típico em cafetarias e bares.',
    examples: 'Ex.: passo 0,05 → 10,32 → 10,30 · passo 0,10 → 10,36 → 10,40',
  },
  {
    key: 'minimumMargin',
    title: 'Arredondamento para garantir margem mínima',
    description:
      'Ajusta o preço ao valor mínimo que assegura o Food Cost máximo pretendido e arredonda para cima a partir daí.',
    examples: 'Ex.: preço mínimo 10,12 € → arredonda para 10,50 € ou 10,90 € conforme política interna.',
  },
  {
    key: 'corporate',
    title: 'Arredondamento corporativo (lista de finais permitidos)',
    description: 'Preço final termina com finais pré-definidos (ex.: .00, .50, .90, .95), usado em cadeias e grupos.',
    examples: 'Ex.: finais {0,00; 0,50; 0,90} → 10,32 → 10,50 · 10,76 → 10,90',
  },
];

export const DEFAULT_PRICING_POLICY_BY_COUNTRY = {
  Portugal: 'nearestMultiple',
  Angola: 'premium',
  'Cabo Verde': 'classic',
};

export async function fetchPricingPolicy() {
  const response = await axios.get('/api/pricing-policy');
  return response.data;
}

export async function savePricingPolicy(policyKey, country) {
  const response = await axios.put('/api/pricing-policy', {
    policyKey,
    country,
    manualOverride: true,
  });
  return response.data;
}

export async function applyPricingPolicyDefaultForCountry(country) {
  const response = await axios.post('/api/pricing-policy/apply-default', {
    country,
  });
  return response.data;
}

export function getPolicyDetails(policyKey) {
  return PRICING_POLICY_OPTIONS.find((option) => option.key === policyKey);
}

const DEFAULT_CORPORATE_ENDINGS = [0, 0.5, 0.9, 0.95];

const roundToStep = (value, step) => {
  const rounded = Math.round(value / step) * step;
  return Number.isFinite(rounded) ? Number(rounded.toFixed(2)) : null;
};

const roundUpToStep = (value, step) => {
  const rounded = Math.ceil(value / step) * step;
  return Number.isFinite(rounded) ? Number(rounded.toFixed(2)) : null;
};

const applyPsychologicalPricing = (value) => {
  const endings = [0.9, 0.99];
  const base = Math.floor(value);

  for (let offset = 0; offset < 3; offset += 1) {
    const currentBase = base + offset;
    const candidate = endings.map((ending) => currentBase + ending).find((price) => price >= value);

    if (candidate) {
      return Number(candidate.toFixed(2));
    }
  }

  return Number(Math.ceil(value).toFixed(2));
};

const applyCorporatePricing = (value, endings = DEFAULT_CORPORATE_ENDINGS) => {
  const normalizedEndings = endings
    .map((ending) => Number(ending))
    .filter((ending) => Number.isFinite(ending))
    .sort((a, b) => a - b);

  if (normalizedEndings.length === 0) return Number(value.toFixed(2));

  const base = Math.floor(value);

  for (let offset = 0; offset < 3; offset += 1) {
    const currentBase = base + offset;
    const candidate = normalizedEndings
      .map((ending) => currentBase + ending)
      .find((price) => price >= value);

    if (candidate) {
      return Number(candidate.toFixed(2));
    }
  }

  return Number((base + 1 + normalizedEndings[normalizedEndings.length - 1]).toFixed(2));
};

export function applyPricingPolicyToPrice(value, policyKey) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return null;

  switch (policyKey) {
    case 'classic':
      return roundToStep(numericValue, 0.5);
    case 'psychological':
      return applyPsychologicalPricing(numericValue);
    case 'premium':
      return Number(Math.ceil(numericValue).toFixed(2));
    case 'strictEuro':
      return Number(Math.round(numericValue).toFixed(2));
    case 'nearestMultiple':
      return roundToStep(numericValue, 0.05);
    case 'minimumMargin':
      return roundUpToStep(numericValue, 0.05);
    case 'corporate':
      return applyCorporatePricing(numericValue);
    default:
      return Number(numericValue.toFixed(2));
  }
}

