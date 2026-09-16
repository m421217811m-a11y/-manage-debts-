import { CURRENCIES, Currency, Direction, Person, Transaction } from './types';

export type Balance = {
  currency: Currency;
  amountMinor: number;
};

export function currencySymbol(currency: Currency) {
  return CURRENCIES.find((item) => item.value === currency)?.symbol ?? currency;
}

export function formatMoney(amountMinor: number, currency: Currency) {
  const amount = Math.abs(amountMinor) / 100;
  const value = new Intl.NumberFormat('ar', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${value} ${currencySymbol(currency)}`;
}

export function formatSignedMoney(amountMinor: number, currency: Currency) {
  return `${amountMinor > 0 ? '+' : amountMinor < 0 ? '−' : ''}${formatMoney(amountMinor, currency)}`;
}

export function parseAmount(value: string) {
  const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 100);
}

export function getBalanceForTransactions(
  transactions: Transaction[],
  personId: string,
  currency?: Currency,
) {
  const balances = new Map<Currency, number>();
  const personTransactions = transactions
    .filter((transaction) => transaction.personId === personId)
    .filter((transaction) => !currency || transaction.currency === currency)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  for (const transaction of personTransactions) {
    const previous = balances.get(transaction.currency) ?? 0;
    const signedAmount = getSignedDelta(transaction);
    balances.set(transaction.currency, previous + signedAmount);
  }

  return currency ? balances.get(currency) ?? 0 : balances;
}

export function getSignedDelta(transaction: Transaction) {
  if (transaction.type === 'debt') {
    return transaction.direction === 'receivable'
      ? transaction.amountMinor
      : -transaction.amountMinor;
  }
  return transaction.direction === 'receivable'
    ? -transaction.amountMinor
    : transaction.amountMinor;
}

export function getPersonBalances(transactions: Transaction[], personId: string) {
  return getBalanceForTransactions(transactions, personId) as Map<Currency, number>;
}

export function getTotals(transactions: Transaction[]) {
  const totals = new Map<Currency, { receivable: number; payable: number }>();
  for (const transaction of transactions) {
    const current = totals.get(transaction.currency) ?? { receivable: 0, payable: 0 };
    if (transaction.type === 'debt') {
      if (transaction.direction === 'receivable') current.receivable += transaction.amountMinor;
      else current.payable += transaction.amountMinor;
    }
    totals.set(transaction.currency, current);
  }
  return totals;
}

export function getPrimaryBalance(
  transactions: Transaction[],
  currency: Currency,
) {
  const totals = getTotals(transactions).get(currency) ?? { receivable: 0, payable: 0 };
  return {
    net: totals.receivable - totals.payable,
    receivable: totals.receivable,
    payable: totals.payable,
  };
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' }).format(date);
}

export function dueState(dueDate?: string) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dueDate);
  date.setHours(0, 0, 0, 0);
  const difference = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (difference < 0) return { label: 'متأخر', tone: 'danger' as const };
  if (difference === 0) return { label: 'اليوم', tone: 'warning' as const };
  if (difference <= 7) return { label: 'قريبًا', tone: 'warning' as const };
  return { label: 'مستحق', tone: 'neutral' as const };
}

export function getPersonLabel(balance: number, personName: string, currency: Currency) {
  if (balance > 0) return `لك عند ${personName}: ${formatMoney(balance, currency)}`;
  if (balance < 0) return `عليك لـ${personName}: ${formatMoney(balance, currency)}`;
  return 'تمت تسوية الحساب';
}

export function getDirectionLabel(direction: Direction) {
  return direction === 'receivable' ? 'هذا الشخص أصبح مدينًا لي' : 'أصبحت مدينًا لهذا الشخص';
}

export function sortNewest(transactions: Transaction[]) {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt),
  );
}