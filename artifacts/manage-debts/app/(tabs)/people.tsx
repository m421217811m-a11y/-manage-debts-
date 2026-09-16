import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatMoney, getPersonBalances, getPrimaryBalance } from '@/lib/finance';
import { Currency } from '@/lib/types';

type Filter = 'all' | 'receivable' | 'payable' | 'settled';

export default function PeopleScreen() {
  const colors = useColors();
  const { people, transactions, settings } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = useMemo(() => people.filter((person) => {
    const balance = getPersonBalances(transactions, person.id).get(settings.defaultCurrency) ?? 0;
    const matchesQuery = person.name.includes(query) || person.phone?.includes(query);
    const matchesFilter = filter === 'all' || (filter === 'receivable' && balance > 0) || (filter === 'payable' && balance < 0) || (filter === 'settled' && balance === 0);
    return matchesQuery && matchesFilter;
  }), [people, transactions, settings.defaultCurrency, query, filter]);

  return <Screen><AppHeader title="الأشخاص" subtitle={`${people.length} أشخاص مسجلون`} action={() => router.push('/add-person')} /><View style={styles.content}>
    <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث عن شخص…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} textAlign="right" /></View>
    <View style={styles.filters}>{([{ value: 'all', label: 'الكل' }, { value: 'receivable', label: 'لي' }, { value: 'payable', label: 'عليّ' }, { value: 'settled', label: 'بدون رصيد' }] as { value: Filter; label: string }[]).map((item) => <Pressable key={item.value} onPress={() => setFilter(item.value)} style={[styles.filter, { backgroundColor: filter === item.value ? colors.primary : colors.card, borderColor: filter === item.value ? colors.primary : colors.border }]}><Text style={{ color: filter === item.value ? colors.primaryForeground : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>{item.label}</Text></Pressable>)}</View>
    {people.length === 0 ? <EmptyState icon="users" title="لم تضف أي شخص بعد" body="ابدأ بإضافة أول شخص لإدارة حسابه." action="+ إضافة شخص" onAction={() => router.push('/add-person')} /> : <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false} renderItem={({ item }) => <PersonRow personId={item.id} name={item.name} currency={settings.defaultCurrency} />} ListEmptyComponent={<EmptyState icon="search" title="لا توجد نتائج" body="جرّب اسمًا أو فلترًا مختلفًا." />} />}
  </View></Screen>;
}

function PersonRow({ personId, name, currency }: { personId: string; name: string; currency: Currency }) {
  const colors = useColors();
  const { transactions } = useApp();
  const balance = getPrimaryBalance(transactions.filter((item) => item.personId === personId), currency).net;
  return <Pressable onPress={() => router.push({ pathname: '/person/[id]', params: { id: personId } })} style={({ pressed }) => [styles.personRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{name.slice(0, 1)}</Text></View><View style={styles.personCopy}><Text style={[styles.personName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.personBalance, { color: balance > 0 ? colors.positive : balance < 0 ? colors.destructive : colors.mutedForeground }]}>{balance > 0 ? `لك عند ${name}: ${formatMoney(balance, currency)}` : balance < 0 ? `عليك لـ${name}: ${formatMoney(balance, currency)}` : 'تمت تسوية الحساب'}</Text></View><Feather name="chevron-left" size={18} color={colors.mutedForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 20 },
  search: { height: 50, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15 },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  filter: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  personRow: { minHeight: 75, borderRadius: 18, borderWidth: 1, marginBottom: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 19, fontWeight: '800' },
  personCopy: { flex: 1, alignItems: 'flex-end' },
  personName: { fontSize: 15, fontWeight: '700' },
  personBalance: { fontSize: 12, marginTop: 5 },
});