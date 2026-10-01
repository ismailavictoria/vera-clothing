export const currencies = {
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: '$', locale: 'en-CA' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', locale: 'en-GH' },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE' },
} as const;

export type CurrencyCode = keyof typeof currencies;
export type CurrencyConfig = (typeof currencies)[CurrencyCode];
export const DEFAULT_CURRENCY: CurrencyCode = 'NGN';
export const CURRENCY_STORAGE_KEY = 'vera.store-currency';
export const CURRENCY_STORAGE_VERSION = 1;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(currencies, value);
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const config = currencies[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(amount);
}
