import { useEffect, useState } from 'react';

export const CURRENCY_STORAGE_KEY = 'configuracao_moeda';
const COUNTRY_STORAGE_KEY = 'configuracao_regionalizacao_pais';
const CURRENCY_CHANGE_EVENT = 'currency_settings_updated';

export const DEFAULT_CURRENCY_BY_COUNTRY = {
  Portugal: {
    country: 'Portugal',
    symbol: '€',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandSeparator: '.',
    symbolSpacing: true,
  },
  Angola: {
    country: 'Angola',
    symbol: 'Kz',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandSeparator: '.',
    symbolSpacing: true,
  },
  'Cabo Verde': {
    country: 'Cabo Verde',
    symbol: 'CVE',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandSeparator: '.',
    symbolSpacing: true,
  },
};

export function getDefaultCurrencySettings(country) {
  return DEFAULT_CURRENCY_BY_COUNTRY[country] || DEFAULT_CURRENCY_BY_COUNTRY.Portugal;
}

function readCountryFromStorage() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(COUNTRY_STORAGE_KEY);
}

function parseStoredSettings(rawSettings) {
  if (!rawSettings) return null;

  try {
    const parsed = typeof rawSettings === 'string' ? JSON.parse(rawSettings) : rawSettings;
    if (!parsed || typeof parsed !== 'object') return null;

    const { symbol, symbolPosition, decimalSeparator, thousandSeparator, symbolSpacing } = parsed;
    if (!symbol || !symbolPosition || !decimalSeparator || typeof thousandSeparator === 'undefined') return null;

    return {
      country: parsed.country || undefined,
      symbol: String(symbol),
      symbolPosition: symbolPosition === 'before' ? 'before' : 'after',
      decimalSeparator: decimalSeparator === '.' ? '.' : ',',
      thousandSeparator: thousandSeparator === ' ' || thousandSeparator === '' ? thousandSeparator : '.',
      symbolSpacing: parsed.symbolSpacing !== undefined ? Boolean(symbolSpacing) : true,
    };
  } catch (error) {
    return null;
  }
}

export function getCurrencySettings() {
  if (typeof window === 'undefined') return getDefaultCurrencySettings();

  const storedSettings = parseStoredSettings(localStorage.getItem(CURRENCY_STORAGE_KEY));
  if (storedSettings) return storedSettings;

  const storedSymbol = localStorage.getItem('configuracao_moeda_simbolo');
  if (storedSymbol) {
    const migrated = {
      ...getDefaultCurrencySettings(readCountryFromStorage() || undefined),
      symbol: storedSymbol.trim(),
    };
    setCurrencySettings(migrated);
    return migrated;
  }

  const countryDefaults = getDefaultCurrencySettings(readCountryFromStorage() || undefined);
  setCurrencySettings(countryDefaults);
  return countryDefaults;
}

function notifyCurrencyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
  }
}

export function setCurrencySettings(settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(settings));
  notifyCurrencyChange();
}

export function resetCurrencySettings(country) {
  const targetCountry = country || readCountryFromStorage();
  const defaults = getDefaultCurrencySettings(targetCountry || undefined);
  setCurrencySettings(defaults);
  return defaults;
}

export function applyCurrencyDefaultsForCountry(country) {
  const defaults = getDefaultCurrencySettings(country);
  setCurrencySettings(defaults);
  return defaults;
}

export function formatCurrency(value, settings, decimals = 2) {
  const currencySettings = settings || getCurrencySettings();
  const safeNumber = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [integerPart, decimalPart = ''] = safeNumber.toFixed(decimals).split('.');

  const thousandSeparated = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currencySettings.thousandSeparator);
  const formattedNumber =
    decimals > 0
      ? `${thousandSeparated}${currencySettings.decimalSeparator}${decimalPart}`
      : thousandSeparated;

  const space = currencySettings.symbolSpacing ? ' ' : '';

  return currencySettings.symbolPosition === 'before'
    ? `${currencySettings.symbol}${space}${formattedNumber}`
    : `${formattedNumber}${space}${currencySettings.symbol}`;
}

export function useCurrencySettings() {
  const [settings, setSettings] = useState(getCurrencySettings);

  useEffect(() => {
    const syncSettings = () => setSettings(getCurrencySettings());

    syncSettings();

    const handleStorage = (event) => {
      if (!event || event.key === CURRENCY_STORAGE_KEY || event.key === COUNTRY_STORAGE_KEY) {
        syncSettings();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CURRENCY_CHANGE_EVENT, syncSettings);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CURRENCY_CHANGE_EVENT, syncSettings);
    };
  }, []);

  return settings;
}

export function useCurrencySymbol() {
  const settings = useCurrencySettings();
  return settings.symbol;
}

export function useCurrencyFormatter() {
  const settings = useCurrencySettings();

  const format = (value, decimals = 2) => formatCurrency(value, settings, decimals);

  return { settings, formatCurrency: format };
}
