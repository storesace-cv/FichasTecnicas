import { useEffect, useState } from 'react';

export const COUNTRY_STORAGE_KEY = 'configuracao_regionalizacao_pais';
export const COUNTRY_OPTIONS = ['Portugal', 'Angola', 'Cabo Verde'];
export const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

export function getCountry() {
  if (typeof window === 'undefined') return DEFAULT_COUNTRY;
  const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
  return COUNTRY_OPTIONS.includes(storedCountry) ? storedCountry : DEFAULT_COUNTRY;
}

export function setCountry(country) {
  if (!COUNTRY_OPTIONS.includes(country)) return;
  localStorage.setItem(COUNTRY_STORAGE_KEY, country);
}

export function useCountry() {
  const [country, setCountryState] = useState(getCountry);

  useEffect(() => {
    const syncCountry = () => setCountryState(getCountry());

    syncCountry();

    const handleStorage = (event) => {
      if (!event || event.key === COUNTRY_STORAGE_KEY) {
        syncCountry();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return country;
}
