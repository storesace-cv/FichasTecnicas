export const FOOD_COST_BUSINESS_TYPE_STORAGE_KEY = 'configuracao_food_cost_tipo_negocio';
export const FOOD_COST_CONSULTANT_INTERVALS_STORAGE_KEY = 'configuracao_food_cost_intervalos_consultores';
export const OPERACIONAL_COST_STORAGE_KEY = 'configuracao_food_cost_operacionais';
export const PVP_FOOD_COST_TARGETS_STORAGE_KEY = 'configuracao_pvp_food_cost_alvos';
export const PVP_FOOD_COST_TARGETS_DECIMALS_STORAGE_KEY = 'configuracao_pvp_food_cost_alvos_decimais';
export const PVP_VARIATIONS_COUNT = 5;

const fillArrayWithDefault = (value) => Array.from({ length: PVP_VARIATIONS_COUNT }, () => value);

export const DEFAULT_PVP_PARAMETERS_BY_BUSINESS = {
  Hotéis: {
    operacionaisPercent: 18,
    foodCostPercent: 30,
    ratio: 3.3,
  },
  'Restauração tradicional': {
    operacionaisPercent: 15,
    foodCostPercent: 30,
    ratio: 3.5,
  },
  Cadeias: {
    operacionaisPercent: 12,
    foodCostPercent: 25,
    ratio: 4.0,
  },
  'Consultores de F&B': {
    operacionaisPercent: 15,
    foodCostPercent: 27,
    ratio: 3.7,
  },
};

export const BUSINESS_TYPES = [
  'Hotéis',
  'Restauração tradicional',
  'Cadeias',
  'Consultores de F&B',
];

export const DEFAULT_INTERVALS_BY_BUSINESS = {
  'Restauração tradicional': { bomMax: 25, normalMax: 30 },
  Hotéis: { bomMax: 28, normalMax: 32 },
  Cadeias: { bomMax: 23, normalMax: 28 },
  'Consultores de F&B': { bomMax: 25, normalMax: 30 },
};

export const getBusinessType = () => {
  return localStorage.getItem(FOOD_COST_BUSINESS_TYPE_STORAGE_KEY) || 'Restauração tradicional';
};

export const setBusinessType = (tipoNegocio) => {
  if (!tipoNegocio || !BUSINESS_TYPES.includes(tipoNegocio)) return;
  localStorage.setItem(FOOD_COST_BUSINESS_TYPE_STORAGE_KEY, tipoNegocio);
};

export const canEditIntervals = (tipoNegocio) => tipoNegocio === 'Consultores de F&B';

export const getConsultantIntervals = () => {
  const guardados = localStorage.getItem(FOOD_COST_CONSULTANT_INTERVALS_STORAGE_KEY);

  if (guardados) {
    try {
      const valores = JSON.parse(guardados);
      if (
        typeof valores?.bomMax === 'number' &&
        Number.isFinite(valores.bomMax) &&
        typeof valores?.normalMax === 'number' &&
        Number.isFinite(valores.normalMax)
      ) {
        return valores;
      }
    } catch (error) {
      // Se o JSON estiver inválido, ignoramos e retornamos os defaults.
    }
  }

  return DEFAULT_INTERVALS_BY_BUSINESS['Consultores de F&B'];
};

export const saveConsultantIntervals = ({ bomMax, normalMax }) => {
  const valoresNormalizados = {
    bomMax: Number(bomMax),
    normalMax: Number(normalMax),
  };

  localStorage.setItem(
    FOOD_COST_CONSULTANT_INTERVALS_STORAGE_KEY,
    JSON.stringify(valoresNormalizados)
  );

  return valoresNormalizados;
};

export const getIntervalsForBusinessType = (tipoNegocio) => {
  if (tipoNegocio === 'Consultores de F&B') {
    return getConsultantIntervals();
  }

  return DEFAULT_INTERVALS_BY_BUSINESS[tipoNegocio] || DEFAULT_INTERVALS_BY_BUSINESS['Restauração tradicional'];
};

export const getDefaultPvpParameters = (tipoNegocio) => {
  const defaults =
    DEFAULT_PVP_PARAMETERS_BY_BUSINESS[tipoNegocio] || DEFAULT_PVP_PARAMETERS_BY_BUSINESS['Restauração tradicional'];

  const foodCostPercents = fillArrayWithDefault(defaults.foodCostPercent);
  const foodCostDecimals = foodCostPercents.map((percent) => Number(percent / 100));
  const ratios = fillArrayWithDefault(defaults.ratio);

  return {
    operacionaisPercent: defaults.operacionaisPercent,
    foodCostPercents,
    foodCostDecimals,
    ratios,
  };
};

const normalizeDecimal = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const parseJsonArray = (value) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};

const ensureArraySize = (values) => {
  const normalized = Array.isArray(values) ? [...values].slice(0, PVP_VARIATIONS_COUNT) : [];

  while (normalized.length < PVP_VARIATIONS_COUNT) {
    normalized.push(null);
  }

  return normalized;
};

export const getOperationalCostPercent = () => {
  const stored = Number(localStorage.getItem(OPERACIONAL_COST_STORAGE_KEY));

  if (Number.isFinite(stored) && stored >= 0) {
    return Math.min(100, Math.max(0, stored));
  }

  return getDefaultPvpParameters(getBusinessType()).operacionaisPercent;
};

export const getFoodCostTargetDecimals = () => {
  const storedDecimals = parseJsonArray(localStorage.getItem(PVP_FOOD_COST_TARGETS_DECIMALS_STORAGE_KEY));

  if (storedDecimals) {
    return ensureArraySize(storedDecimals).map((value) => normalizeDecimal(value));
  }

  const storedPercents = parseJsonArray(localStorage.getItem(PVP_FOOD_COST_TARGETS_STORAGE_KEY));

  if (storedPercents) {
    return ensureArraySize(storedPercents).map((value) => {
      const percent = normalizeDecimal(value);
      return percent ? percent / 100 : null;
    });
  }

  return getDefaultPvpParameters(getBusinessType()).foodCostDecimals;
};
