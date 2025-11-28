export const FOOD_COST_BUSINESS_TYPE_STORAGE_KEY = 'configuracao_food_cost_tipo_negocio';
export const FOOD_COST_CONSULTANT_INTERVALS_STORAGE_KEY = 'configuracao_food_cost_intervalos_consultores';

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
