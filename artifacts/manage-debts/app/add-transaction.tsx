import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field, PrimaryButton, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatMoney, getBalanceForTransactions, parseAmount } from '@/lib/finance';
import { CURRENCIES, Currency, Direction, makeId } from '@/lib/types';

export default function AddTransactionScreen() {
  const colors = useColors();
  const { people, transactions, settings, addTransaction, updateTransaction } = useApp();
  const params = useLocalSearchParams<{ personId?: string; mode?: string; transactionId?: string }>();
  const existing = transactions.find((item) => item.id === params.transactionId);
  const [personId, setPersonId] = useState(existing?.personId ?? params.personId ?? people[0]?.id ?? '');
  const [type, setType] = useState<'debt' | 'payment'>(existing?.type ?? (params.mode === 'payment' ? 'payment' : 'debt'));
  const [direction, setDirection] = useState<Direction>(existing?.direction ?? 'receivable');
  const [amount, setAmount] = useState(existing ? String(existing.amountMinor / 100) : '');
  const [currency, setCurrency] = useState<Currency>(existing?.currency ?? settings.defaultCurrency);
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0, 10) ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const person = people.find((item) => item.id === personId);
  const currentBalance = personId ? Number(getBalanceForTransactions(transactions, personId, currency)) : 0;
  const amountMinor = parseAmount(amount);
  const paymentDirection = currentBalance > 0 ? 'receivable' : 'payable';
  const preview = currentBalance + (type === 'debt' ? (direction === 'receivable' ? amountMinor : -amountMinor) : (paymentDirection === 'receivable' ? -amountMinor : amountMinor));
  const canSave = !!personId && amountMinor > 0;

  async function save() {
    if (!canSave) {
      Alert.alert('بيانات ناقصة', people.length ? 'اختر الشخص واكتب مبلغًا أكبر من صفر.' : 'أضف شخصًا أولًا من صفحة الأشخاص.');
      return;
    }
    const now = new Date().toISOString();
    const transaction = { id: existing?.id ?? makeId('transaction'), personId, type, direction: type === 'payment' ? paymentDirection : direction, amountMinor, currency, date: existing?.date ?? now, dueDate: dueDate.trim() || undefined, note: note.trim() || undefined, createdAt: existing?.createdAt ?? now, updatedAt: now };
    if (existing) await updateTransaction(transaction);
    else await addTransaction(transaction);
    Alert.alert(existing ? 'تم تعديل العملية' : type === 'payment' ? 'تم تسجيل الدفعة' : 'تم تسجيل الدين', preview === 0 ? 'تمت تسوية الحساب.' : `الرصيد بعد العملية: ${formatMoney(preview, currency)}`, [{ text: 'حسنًا', onPress: () => router.back() }]);
  }

  return <Screen><AppHeader title={existing ? 'تعديل العملية' : type === 'payment' ? 'تسجيل دفعة' : 'إضافة دين'} subtitle="سجّل العملية خلال ثوانٍ" back /><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
    {people.length === 0 ? <View style={[styles.noPeople, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="users" size={24} color={colors.primary} /><Text style={[styles.noPeopleTitle, { color: colors.foreground }]}>أضف شخصًا أولًا</Text><Text style={[styles.noPeopleText, { color: colors.mutedForeground }]}>لا يمكن تسجيل عملية بدون شخص.</Text><PrimaryButton title="إضافة شخص" onPress={() => router.push('/add-person')} icon="user-plus" /></View> : <>
      <Text style={[styles.question, { color: colors.foreground }]}>{type === 'payment' ? 'لمن تم تسجيل الدفعة؟' : 'ما الذي حدث؟'}</Text>
      {type === 'debt' ? <View style={styles.choiceRow}><Choice title="هذا الشخص أصبح مدينًا لي" selected={direction === 'receivable'} onPress={() => setDirection('receivable')} /><Choice title="أصبحت مدينًا لهذا الشخص" selected={direction === 'payable'} onPress={() => setDirection('payable')} /></View> : null}
      <Text style={[styles.label, { color: colors.foreground }]}>الشخص</Text>
      <View style={styles.peopleWrap}>{people.map((item) => <Pressable key={item.id} onPress={() => setPersonId(item.id)} style={[styles.personChoice, { backgroundColor: personId === item.id ? colors.primary : colors.card, borderColor: personId === item.id ? colors.primary : colors.border }]}><Text style={{ color: personId === item.id ? colors.primaryForeground : colors.foreground, fontWeight: '700', fontSize: 13 }}>{item.name}</Text></Pressable>)}</View>
      <Field label="المبلغ" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Text style={[styles.label, { color: colors.foreground }]}>العملة</Text>
      <View style={styles.currencyRow}>{CURRENCIES.map((item) => <Pressable key={item.value} onPress={() => setCurrency(item.value)} style={[styles.currency, { backgroundColor: currency === item.value ? colors.secondary : colors.card, borderColor: currency === item.value ? colors.primary : colors.border }]}><Text style={{ color: currency === item.value ? colors.primary : colors.foreground, fontWeight: '700' }}>{item.symbol}</Text><Text style={{ color: currency === item.value ? colors.primary : colors.mutedForeground, fontSize: 11 }}>{item.label}</Text></Pressable>)}</View>
      {type === 'debt' ? <Field label="تاريخ الاستحقاق" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD · اختياري" /> : null}
      <Field label="ملاحظة" value={note} onChangeText={setNote} placeholder="اختيارية" multiline />
      <View style={[styles.preview, { backgroundColor: colors.secondary }]}><Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>الرصيد بعد العملية</Text><Text style={[styles.previewAmount, { color: preview > 0 ? colors.positive : preview < 0 ? colors.destructive : colors.primary }]}>{preview === 0 ? 'تمت تسوية الحساب' : formatMoney(preview, currency)}</Text>{person ? <Text style={[styles.previewPerson, { color: colors.mutedForeground }]}>{person.name}</Text> : null}</View>
      <PrimaryButton title={type === 'payment' ? 'تسجيل الدفعة' : 'حفظ العملية'} onPress={save} icon="check" />
    </>}
  </KeyboardAwareScrollViewCompat></Screen>;
}

function Choice({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={[styles.choice, { backgroundColor: selected ? colors.secondary : colors.card, borderColor: selected ? colors.primary : colors.border }]}><View style={[styles.radio, { borderColor: selected ? colors.primary : colors.input, backgroundColor: selected ? colors.primary : 'transparent' }]}>{selected ? <View style={styles.radioDot} /> : null}</View><Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' }}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 45 },
  question: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: 14 },
  choiceRow: { gap: 9, marginBottom: 20 },
  choice: { borderWidth: 1, borderRadius: 16, minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  label: { fontSize: 14, fontWeight: '700', textAlign: 'right', marginBottom: 9 },
  peopleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  personChoice: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 },
  currencyRow: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  currency: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 3 },
  preview: { borderRadius: 19, padding: 17, alignItems: 'center', marginBottom: 18 },
  previewLabel: { fontSize: 12 },
  previewAmount: { fontSize: 22, fontWeight: '800', marginTop: 7 },
  previewPerson: { fontSize: 12, marginTop: 4 },
  noPeople: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: 'center', gap: 10 },
  noPeopleTitle: { fontSize: 18, fontWeight: '800' },
  noPeopleText: { fontSize: 13, marginBottom: 6 },
});