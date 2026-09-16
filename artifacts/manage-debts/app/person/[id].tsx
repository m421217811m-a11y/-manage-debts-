import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, PrimaryButton, Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatDate, formatMoney, getPrimaryBalance, sortNewest } from '@/lib/finance';

export default function PersonDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { people, transactions, settings, deletePerson } = useApp();
  const person = people.find((item) => item.id === String(id));
  if (!person) {
    return <Screen><AppHeader title="الشخص" back /><EmptyState icon="user-x" title="تعذر العثور على الشخص" onAction={() => router.back()} action="رجوع" /></Screen>;
  }
  const personTransactions = sortNewest(transactions.filter((item) => item.personId === person.id));
  const balance = getPrimaryBalance(personTransactions, settings.defaultCurrency).net;
  function remove() {
    const personId = person!.id;
    const personName = person!.name;
    Alert.alert('حذف الشخص؟', `لدى ${personName} ${personTransactions.length} عمليات مسجلة. سيؤثر الحذف على سجل حسابه.`, [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف الشخص', style: 'destructive', onPress: async () => { await deletePerson(personId); router.back(); } }]);
  }
  return <Screen><AppHeader title={person.name} subtitle={person.phone || 'تفاصيل الحساب'} back /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.balanceCard, { backgroundColor: balance >= 0 ? colors.primary : colors.secondary }]}><Text style={{ color: balance >= 0 ? '#D9E9DD' : colors.mutedForeground, fontSize: 13 }}>الرصيد الحالي</Text><Text style={[styles.balance, { color: balance >= 0 ? '#FFFFFF' : colors.foreground }]}>{balance === 0 ? 'تمت تسوية الحساب' : formatMoney(balance, settings.defaultCurrency)}</Text><Text style={{ color: balance >= 0 ? '#B9D5C2' : colors.mutedForeground, fontSize: 13 }}>{balance > 0 ? 'لك عند هذا الشخص' : balance < 0 ? 'عليك لهذا الشخص' : 'الحساب مسدد'}</Text></View>
    <View style={styles.actions}><PrimaryButton title="إضافة دين" onPress={() => router.push({ pathname: '/add-transaction', params: { personId: person.id } })} icon="plus" /><Pressable onPress={() => router.push({ pathname: '/add-transaction', params: { personId: person.id, mode: 'payment' } })} style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="repeat" size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}>تسجيل دفعة</Text></Pressable></View>
    <SectionTitle title="سجل الحساب" />
    {personTransactions.length ? personTransactions.map((item) => <View key={item.id} style={[styles.timelineRow, { borderBottomColor: colors.border }]}><View style={[styles.timelineDot, { backgroundColor: item.type === 'payment' ? colors.secondary : colors.accent }]}><Feather name={item.type === 'payment' ? 'repeat' : 'file-plus'} size={15} color={colors.primary} /></View><View style={styles.timelineCopy}><Text style={[styles.timelineTitle, { color: colors.foreground }]}>{item.type === 'payment' ? 'دفعة' : item.direction === 'receivable' ? 'دين جديد · لي' : 'دين جديد · عليّ'}</Text><Text style={[styles.timelineMeta, { color: colors.mutedForeground }]}>{formatDate(item.date)}{item.note ? ` · ${item.note}` : ''}</Text></View><Text style={[styles.timelineAmount, { color: item.type === 'debt' && item.direction === 'receivable' ? colors.positive : colors.destructive }]}>{item.type === 'debt' && item.direction === 'receivable' ? '+' : '−'}{formatMoney(item.amountMinor, item.currency)}</Text></View>) : <EmptyState icon="activity" title="لا توجد عمليات بعد" body="ابدأ بإضافة أول دين لهذا الشخص." />}
    <Pressable onPress={remove} style={styles.deleteButton}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={{ color: colors.destructive, fontWeight: '700' }}>حذف الشخص</Text></Pressable>
  </ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 45 },
  balanceCard: { borderRadius: 24, padding: 22, alignItems: 'center', marginBottom: 14 },
  balance: { fontSize: 28, fontWeight: '800', marginVertical: 11, textAlign: 'center' },
  actions: { gap: 10, marginBottom: 27 },
  secondaryButton: { minHeight: 52, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  timelineRow: { minHeight: 68, paddingVertical: 11, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineDot: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timelineCopy: { flex: 1, alignItems: 'flex-end' },
  timelineTitle: { fontSize: 14, fontWeight: '700' },
  timelineMeta: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  timelineAmount: { fontSize: 13, fontWeight: '800' },
  deleteButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
});