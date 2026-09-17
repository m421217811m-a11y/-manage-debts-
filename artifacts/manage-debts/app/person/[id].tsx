import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, PrimaryButton, Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatDate, formatMoney, getPrimaryBalance, getSignedDelta, sortNewest } from '@/lib/finance';
import { makeId } from '@/lib/types';

export default function PersonDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { people, transactions, settings, addTransaction, deletePerson } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [settling, setSettling] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const person = people.find((item) => item.id === String(id));
  if (!person) {
    return <Screen><AppHeader title="الشخص" back /><EmptyState icon="user-x" title="تعذر العثور على الشخص" onAction={() => router.back()} action="رجوع" /></Screen>;
  }
  const currentPersonId = person.id;
  const personTransactions = sortNewest(transactions.filter((item) => item.personId === person.id));
  const balance = getPrimaryBalance(personTransactions, settings.defaultCurrency).net;
  function remove() {
    setDeleteModalVisible(true);
  }
  async function confirmDelete() {
    setDeleting(true);
    try {
      await deletePerson(currentPersonId);
      setDeleteModalVisible(false);
      router.back();
    } catch {
      setDeleting(false);
      Alert.alert('تعذر الحذف', 'حدث خطأ أثناء حذف الشخص. حاول مرة أخرى.');
    }
  }
  function settle() {
    if (balance === 0) {
      Alert.alert('الحساب مسدد', 'لا يوجد رصيد مفتوح لهذا الشخص.');
      return;
    }
    Alert.alert('تسوية الحساب؟', `سيتم تسجيل دفعة بقيمة ${formatMoney(Math.abs(balance), settings.defaultCurrency)} للوصول إلى رصيد صفر.`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تسوية الحساب', onPress: async () => {
        setSettling(true);
        const now = new Date().toISOString();
        try {
          await addTransaction({
            id: makeId('transaction'),
            personId: currentPersonId,
            type: 'payment',
            direction: balance > 0 ? 'receivable' : 'payable',
            amountMinor: Math.abs(balance),
            currency: settings.defaultCurrency,
            date: now,
            createdAt: now,
            updatedAt: now,
            note: 'تسوية الحساب',
          });
          Alert.alert('تمت التسوية', 'أصبح رصيد هذا الشخص صفرًا.');
        } catch {
          Alert.alert('تعذر التسوية', 'حدث خطأ أثناء تسجيل التسوية. حاول مرة أخرى.');
        } finally {
          setSettling(false);
        }
      } },
    ]);
  }
  return <Screen><AppHeader title={person.name} subtitle={person.phone || 'تفاصيل الحساب'} back /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.balanceCard, { backgroundColor: balance >= 0 ? colors.primary : colors.secondary }]}><Text style={{ color: balance >= 0 ? '#D9E9DD' : colors.mutedForeground, fontSize: 13 }}>الرصيد الحالي</Text><Text style={[styles.balance, { color: balance >= 0 ? '#FFFFFF' : colors.foreground }]}>{balance === 0 ? 'تمت تسوية الحساب' : formatMoney(balance, settings.defaultCurrency)}</Text><Text style={{ color: balance >= 0 ? '#B9D5C2' : colors.mutedForeground, fontSize: 13 }}>{balance > 0 ? 'لك عند هذا الشخص' : balance < 0 ? 'عليك لهذا الشخص' : 'الحساب مسدد'}</Text></View>
    <View style={styles.actions}><PrimaryButton title="إضافة دين" onPress={() => router.push({ pathname: '/add-transaction', params: { personId: person.id } })} icon="plus" /><Pressable onPress={() => router.push({ pathname: '/add-transaction', params: { personId: person.id, mode: 'payment', direction: balance < 0 ? 'payable' : 'receivable' } })} style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="repeat" size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}>تسجيل دفعة</Text></Pressable><Pressable disabled={settling || balance === 0} onPress={settle} style={[styles.secondaryButton, { backgroundColor: colors.secondary, borderColor: colors.border, opacity: settling || balance === 0 ? 0.5 : 1 }]}><Feather name="check-circle" size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}>{settling ? 'جارٍ التسوية…' : 'تسوية الحساب'}</Text></Pressable></View>
    <SectionTitle title="سجل الحساب" />
    {personTransactions.length ? personTransactions.map((item) => { const signed = getSignedDelta(item); return <View key={item.id} style={[styles.timelineRow, { borderBottomColor: colors.border }]}><View style={[styles.timelineDot, { backgroundColor: item.type === 'payment' ? colors.secondary : colors.accent }]}><Feather name={item.type === 'payment' ? 'repeat' : 'file-plus'} size={15} color={colors.primary} /></View><View style={styles.timelineCopy}><Text style={[styles.timelineTitle, { color: colors.foreground }]}>{item.type === 'payment' ? item.direction === 'receivable' ? 'دفعة استلمها الشخص' : 'دفعة سددتها' : item.direction === 'receivable' ? 'دين جديد · لي' : 'دين جديد · عليّ'}</Text><Text style={[styles.timelineMeta, { color: colors.mutedForeground }]}>{formatDate(item.date)}{item.note ? ` · ${item.note}` : ''}</Text></View><Text style={[styles.timelineAmount, { color: signed >= 0 ? colors.positive : colors.destructive }]}>{signed >= 0 ? '+' : '−'}{formatMoney(signed, item.currency)}</Text></View>; }) : <EmptyState icon="activity" title="لا توجد عمليات بعد" body="ابدأ بإضافة أول دين لهذا الشخص." />}
    <Pressable disabled={deleting} onPress={remove} style={[styles.deleteButton, { opacity: deleting ? 0.5 : 1 }]}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={{ color: colors.destructive, fontWeight: '700' }}>{deleting ? 'جارٍ الحذف…' : 'حذف الشخص'}</Text></Pressable>
  </ScrollView><Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="trash-2" size={25} color={colors.destructive} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>حذف الشخص؟</Text><Text style={[styles.modalText, { color: colors.mutedForeground }]}>سيتم حذف {person.name} وكل العمليات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.</Text><View style={styles.modalActions}><Pressable disabled={deleting} onPress={() => setDeleteModalVisible(false)} style={[styles.modalButton, { borderColor: colors.border, opacity: deleting ? 0.5 : 1 }]}><Text style={{ color: colors.foreground, fontWeight: '700' }}>إلغاء</Text></Pressable><Pressable disabled={deleting} onPress={confirmDelete} style={[styles.modalButton, { backgroundColor: colors.destructive, opacity: deleting ? 0.5 : 1 }]}><Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{deleting ? 'جارٍ الحذف…' : 'حذف الشخص'}</Text></Pressable></View></View></View></Modal></Screen>;
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalCard: { borderWidth: 1, borderRadius: 22, padding: 22, alignItems: 'center' },
  modalTitle: { fontSize: 19, fontWeight: '800', marginTop: 12 },
  modalText: { fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  modalActions: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 20 },
  modalButton: { flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});