import { useEffect, useState } from 'react';

export const CURRENCY_STORAGE_KEY = 'configuracao_moeda_simbolo';
export const DEFAULT_CURRENCY_SYMBOL = '€';

export function getCurrencySymbol() {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY_SYMBOL;
  const storedSymbol = localStorage.getItem(CURRENCY_STORAGE_KEY)?.trim();
  return storedSymbol || DEFAULT_CURRENCY_SYMBOL;
}

export function useCurrencySymbol() {
  const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol);

  useEffect(() => {
    const syncCurrencySymbol = () => setCurrencySymbol(getCurrencySymbol());

    syncCurrencySymbol();

    const handleStorage = (event) => {
      if (!event || event.key === CURRENCY_STORAGE_KEY) {
        syncCurrencySymbol();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return currencySymbol;
}
