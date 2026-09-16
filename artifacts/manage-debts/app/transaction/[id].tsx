import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatDate, formatMoney } from '@/lib/finance';

export default function TransactionDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, people, deleteTransaction } = useApp();
  const transaction = transactions.find((item) => item.id === String(id));
  if (!transaction) return <Screen><AppHeader title="تفاصيل العملية" back /><View style={styles.missing}><Text style={{ color: colors.mutedForeground }}>تعذر العثور على العملية.</Text></View></Screen>;
  const person = people.find((item) => item.id === transaction.personId);
  const positive = transaction.type === 'debt' && transaction.direction === 'receivable';
  function remove() {
    Alert.alert('حذف هذه العملية؟', 'سيتم إعادة حساب الرصيد تلقائيًا.', [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: async () => { await deleteTransaction(transaction!.id); router.back(); } }]);
  }
  return <Screen><AppHeader title="تفاصيل العملية" subtitle={person?.name ?? 'شخص محذوف'} back /><ScrollView contentContainerStyle={styles.content}>
    <View style={[styles.amountCard, { backgroundColor: positive ? colors.accent : colors.secondary }]}><Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{transaction.type === 'payment' ? 'دفعة' : positive ? 'دين لي' : 'دين عليّ'}</Text><Text style={[styles.amount, { color: positive ? colors.positive : colors.destructive }]}>{positive ? '+' : '−'}{formatMoney(transaction.amountMinor, transaction.currency)}</Text><Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{formatDate(transaction.date)}</Text></View>
    <InfoRow label="النوع" value={transaction.type === 'payment' ? 'دفعة' : 'دين جديد'} /><InfoRow label="الشخص" value={person?.name ?? 'شخص محذوف'} /><InfoRow label="المبلغ" value={formatMoney(transaction.amountMinor, transaction.currency)} /><InfoRow label="التاريخ" value={formatDate(transaction.date)} />{transaction.dueDate ? <InfoRow label="تاريخ الاستحقاق" value={formatDate(transaction.dueDate)} /> : null}{transaction.note ? <InfoRow label="الملاحظة" value={transaction.note} /> : null}
    <View style={styles.actions}><Pressable onPress={() => router.push({ pathname: '/add-transaction', params: { transactionId: transaction.id } })} style={[styles.edit, { backgroundColor: colors.primary }]}><Feather name="edit-2" size={16} color={colors.primaryForeground} /><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>تعديل</Text></Pressable><Pressable onPress={remove} style={[styles.delete, { borderColor: colors.border }]}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={{ color: colors.destructive, fontWeight: '700' }}>حذف</Text></Pressable></View>
  </ScrollView></Screen>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return <View style={[styles.info, { borderBottomColor: colors.border }]}><Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 45 },
  amountCard: { borderRadius: 23, padding: 22, alignItems: 'center', marginBottom: 18 },
  amount: { fontSize: 29, fontWeight: '800', marginVertical: 10 },
  info: { minHeight: 54, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 14, fontWeight: '700', textAlign: 'right', flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 28 },
  edit: { flex: 1, minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  delete: { flex: 1, minHeight: 52, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});