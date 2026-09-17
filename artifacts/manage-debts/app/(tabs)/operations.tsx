import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatDate, formatMoney, getSignedDelta, sortNewest } from '@/lib/finance';
import { TransactionType } from '@/lib/types';

type Filter = 'all' | 'debt' | 'payment';

export default function OperationsScreen() {
  const colors = useColors();
  const { transactions, people } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = useMemo(() => sortNewest(transactions).filter((item) => filter === 'all' || item.type === filter), [transactions, filter]);
  return <Screen><AppHeader title="العمليات" subtitle={`${transactions.length} عملية مسجلة`} action={() => router.push('/add-transaction')} /><View style={styles.content}>
    <View style={styles.filters}>{([{ value: 'all', label: 'كل العمليات' }, { value: 'debt', label: 'ديون' }, { value: 'payment', label: 'دفعات' }] as { value: Filter; label: string }[]).map((item) => <Pressable key={item.value} onPress={() => setFilter(item.value)} style={[styles.filter, { backgroundColor: filter === item.value ? colors.primary : colors.card, borderColor: filter === item.value ? colors.primary : colors.border }]}><Text style={{ color: filter === item.value ? colors.primaryForeground : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>{item.label}</Text></Pressable>)}</View>
    {transactions.length === 0 ? <EmptyState icon="list" title="لا توجد عمليات بعد" body="ابدأ بتسجيل أول دين أو دفعة." action="+ إضافة عملية" onAction={() => router.push('/add-transaction')} /> : <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false} renderItem={({ item }) => <OperationRow transaction={item} personName={people.find((person) => person.id === item.personId)?.name ?? 'شخص محذوف'} />} ListEmptyComponent={<EmptyState icon="filter" title="لا توجد نتائج" />} />}
  </View></Screen>;
}

function OperationRow({ transaction, personName }: { transaction: { id: string; type: TransactionType; direction: 'receivable' | 'payable'; amountMinor: number; currency: 'ILS' | 'USD' | 'EUR' | 'JOD'; date: string }; personName: string }) {
  const colors = useColors();
  const signed = getSignedDelta(transaction);
  const positive = signed >= 0;
  return <Pressable onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: transaction.id } })} style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.icon, { backgroundColor: positive ? colors.accent : '#F7E8E7' }]}><Feather name={transaction.type === 'payment' ? 'repeat' : 'arrow-down-left'} size={17} color={positive ? colors.primary : colors.destructive} /></View><View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>{personName}</Text><Text style={[styles.meta, { color: colors.mutedForeground }]}>{transaction.type === 'payment' ? transaction.direction === 'receivable' ? 'دفعة استلمها الشخص' : 'دفعة سددتها' : positive ? 'دين لي' : 'دين عليّ'} · {formatDate(transaction.date)}</Text></View><Text style={[styles.amount, { color: positive ? colors.positive : colors.destructive }]}>{positive ? '+' : '−'}{formatMoney(signed, transaction.currency)}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 20 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filter: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9 },
  row: { minHeight: 75, borderWidth: 1, borderRadius: 18, marginBottom: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, alignItems: 'flex-end' },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 11, marginTop: 5 },
  amount: { fontSize: 13, fontWeight: '800' },
});