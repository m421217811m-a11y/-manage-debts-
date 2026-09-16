export type Currency = 'ILS' | 'USD' | 'EUR' | 'JOD';
export type Direction = 'receivable' | 'payable';
export type TransactionType = 'debt' | 'payment';

export type Person = {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  personId: string;
  type: TransactionType;
  direction: Direction;
  amountMinor: number;
  currency: Currency;
  date: string;
  dueDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  darkMode: boolean;
  defaultCurrency: Currency;
  onboardingComplete: boolean;
};

export type AppData = {
  people: Person[];
  transactions: Transaction[];
  settings: AppSettings;
};

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'ILS', label: 'شيكل', symbol: '₪' },
  { value: 'USD', label: 'دولار', symbol: '$' },
  { value: 'EUR', label: 'يورو', symbol: '€' },
  { value: 'JOD', label: 'دينار أردني', symbol: 'د.أ' },
];

export function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}