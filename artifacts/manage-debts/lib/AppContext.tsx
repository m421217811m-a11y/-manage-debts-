import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppData, AppSettings, Currency, Person, Transaction } from './types';

const STORAGE_KEY = '@manage-debts/data-v1';

const initialData: AppData = {
  people: [],
  transactions: [],
  settings: { darkMode: false, defaultCurrency: 'ILS', onboardingComplete: false },
};

type AppContextValue = AppData & {
  hydrated: boolean;
  addPerson: (person: Person) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setData({ ...initialData, ...JSON.parse(value) });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPerson = useCallback(
    async (person: Person) => persist({ ...data, people: [...data.people, person] }),
    [data, persist],
  );
  const addTransaction = useCallback(
    async (transaction: Transaction) =>
      persist({ ...data, transactions: [...data.transactions, transaction] }),
    [data, persist],
  );
  const updateTransaction = useCallback(
    async (transaction: Transaction) =>
      persist({
        ...data,
        transactions: data.transactions.map((item) =>
          item.id === transaction.id ? transaction : item,
        ),
      }),
    [data, persist],
  );
  const updateSettings = useCallback(
    async (settings: Partial<AppSettings>) =>
      persist({ ...data, settings: { ...data.settings, ...settings } }),
    [data, persist],
  );
  const deletePerson = useCallback(
    async (id: string) =>
      persist({
        ...data,
        people: data.people.filter((person) => person.id !== id),
        transactions: data.transactions.filter((transaction) => transaction.personId !== id),
      }),
    [data, persist],
  );
  const deleteTransaction = useCallback(
    async (id: string) =>
      persist({ ...data, transactions: data.transactions.filter((transaction) => transaction.id !== id) }),
    [data, persist],
  );

  const value = useMemo(
    () => ({
      ...data,
      hydrated,
      addPerson,
      addTransaction,
      updateTransaction,
      updateSettings,
      deletePerson,
      deleteTransaction,
    }),
    [data, hydrated, addPerson, addTransaction, updateTransaction, updateSettings, deletePerson, deleteTransaction],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is missing');
  return context;
}

export function useAppColors() {
  const { settings } = useApp();
  return settings.darkMode;
}

export function currencyOption(currency: Currency) {
  return currency;
}