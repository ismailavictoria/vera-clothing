import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStoredValue, writeStoredValue } from '../../lib/storage';
import { CURRENCY_STORAGE_KEY, CURRENCY_STORAGE_VERSION, DEFAULT_CURRENCY, formatCurrencyAmount, isCurrencyCode, type CurrencyCode } from '../../config/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amount: number) => string;
}
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function loadCurrency(): CurrencyCode {
  const saved = readStoredValue<unknown>(CURRENCY_STORAGE_KEY, CURRENCY_STORAGE_VERSION, DEFAULT_CURRENCY);
  return isCurrencyCode(saved) ? saved : DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(loadCurrency);
  useEffect(() => writeStoredValue(CURRENCY_STORAGE_KEY, CURRENCY_STORAGE_VERSION, currency), [currency]);
  const setCurrency = useCallback((next: CurrencyCode) => setCurrencyState(next), []);
  const formatPrice = useCallback((amount: number) => formatCurrencyAmount(amount, currency), [currency]);
  const value = useMemo(() => ({ currency, setCurrency, formatPrice }), [currency, setCurrency, formatPrice]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used inside CurrencyProvider');
  return context;
}
