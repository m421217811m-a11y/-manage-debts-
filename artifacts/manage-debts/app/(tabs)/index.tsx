import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatDate, formatMoney, getPrimaryBalance, getSignedDelta, sortNewest } from '@/lib/finance';

export default function DashboardScreen() {
  const colors = useColors();
  const { people, transactions, settings, hydrated } = useApp();
  const primary = getPrimaryBalance(transactions, settings.defaultCurrency);
  const recent = sortNewest(transactions).slice(0, 5);
  const overdue = transactions.filter((item) => item.dueDate && new Date(item.dueDate) < new Date());
  if (!hydrated) return <Screen><View style={styles.loading}><Text style={{ color: colors.mutedForeground }}>جارٍ تجهيز بياناتك…</Text></View></Screen>;

  return (
    <Screen>
      <AppHeader title="إدارة ديوني" subtitle="كل ديونك، بوضوح." />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>صافي الرصيد</Text>
            <View style={styles.heroIcon}><Feather name="activity" size={18} color={colors.primaryForeground} /></View>
          </View>
          <Text style={styles.heroAmount}>{primary.net >= 0 ? '+' : '−'}{formatMoney(primary.net, settings.defaultCurrency)}</Text>
          <Text style={styles.heroHint}>يُحسب من جميع العمليات المسجلة</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard title="ما لي" subtitle="مستحق لي" amount={primary.receivable} currency={settings.defaultCurrency} tone="positive" />
          <SummaryCard title="ما عليّ" subtitle="مستحق عليّ" amount={primary.payable} currency={settings.defaultCurrency} tone="negative" />
        </View>

        <SectionTitle title="إجراءات سريعة" />
        <View style={styles.quickRow}>
          <QuickAction icon="plus-circle" title="إضافة دين" onPress={() => router.push('/add-transaction')} />
          <QuickAction icon="repeat" title="تسجيل دفعة" onPress={() => router.push({ pathname: '/add-transaction', params: { mode: 'payment' } })} />
          <QuickAction icon="user-plus" title="إضافة شخص" onPress={() => router.push('/add-person')} />
        </View>

        <View style={styles.sectionGap}>
          <SectionTitle title="الاستحقاقات" action={overdue.length ? 'عرض الكل' : undefined} onAction={() => router.push('/operations')} />
          <View style={[styles.dueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dueIcon, { backgroundColor: overdue.length ? '#F8E8E3' : colors.accent }]}>
              <Feather name="calendar" size={19} color={overdue.length ? colors.destructive : colors.primary} />
            </View>
            <View style={styles.dueCopy}>
              <Text style={[styles.dueTitle, { color: colors.foreground }]}>{overdue.length ? `${overdue.length} استحقاق يحتاج انتباهك` : 'لا توجد استحقاقات حاليًا'}</Text>
              <Text style={[styles.dueText, { color: colors.mutedForeground }]}>{overdue.length ? 'راجع العمليات المتأخرة وسجّل الدفعات.' : 'سجّل تاريخ استحقاق عند إضافة دين.'}</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="آخر العمليات" action={recent.length ? 'عرض الكل' : undefined} onAction={() => router.push('/operations')} />
        {recent.length ? recent.map((transaction) => {
          const person = people.find((item) => item.id === transaction.personId);
          const signed = getSignedDelta(transaction);
          return (
            <Pressable key={transaction.id} onPress={() => router.push('/operations')} style={({ pressed }) => [styles.activity, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.activityIcon, { backgroundColor: signed > 0 ? colors.accent : '#F7E8E7' }]}>
                <Feather name={transaction.type === 'payment' ? 'repeat' : 'arrow-down-left'} size={17} color={signed > 0 ? colors.primary : colors.destructive} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={[styles.activityName, { color: colors.foreground }]}>{person?.name ?? 'شخص محذوف'}</Text>
                <Text style={[styles.activityMeta, { color: colors.mutedForeground }]}>{transaction.type === 'payment' ? transaction.direction === 'receivable' ? 'دفعة استلمها الشخص' : 'دفعة سددتها' : 'دين جديد'} · {formatDate(transaction.date)}</Text>
              </View>
              <Text style={[styles.activityAmount, { color: signed > 0 ? colors.positive : colors.destructive }]}>{signed > 0 ? '+' : '−'}{formatMoney(transaction.amountMinor, transaction.currency)}</Text>
            </Pressable>
          );
        }) : <EmptyState icon="activity" title="لا توجد عمليات بعد" body="ابدأ بتسجيل أول دين أو دفعة." action="+ إضافة عملية" onAction={() => router.push('/add-transaction')} />}
      </ScrollView>
    </Screen>
  );
}

function SummaryCard({ title, subtitle, amount, currency, tone }: { title: string; subtitle: string; amount: number; currency: 'ILS' | 'USD' | 'EUR' | 'JOD'; tone: 'positive' | 'negative' }) {
  const colors = useColors();
  return <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.dot, { backgroundColor: tone === 'positive' ? colors.positive : colors.destructive }]} /><Text style={[styles.summaryTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.summaryAmount, { color: colors.foreground }]}>{formatMoney(amount, currency)}</Text><Text style={[styles.summarySubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text></View>;
}

function QuickAction({ icon, title, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.quickIcon, { backgroundColor: colors.accent }]}><Feather name={icon} size={21} color={colors.primary} /></View><Text style={[styles.quickTitle, { color: colors.foreground }]}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  hero: { borderRadius: 25, padding: 21, marginBottom: 14 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: '#D9E9DD', fontSize: 14, fontWeight: '600' },
  heroIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  heroAmount: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', textAlign: 'right', marginTop: 15 },
  heroHint: { color: '#B9D5C2', fontSize: 12, textAlign: 'right', marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14, minHeight: 117 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 11 },
  summaryTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  summaryAmount: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginTop: 8 },
  summarySubtitle: { fontSize: 11, textAlign: 'right', marginTop: 3 },
  quickRow: { flexDirection: 'row', gap: 9, marginBottom: 28 },
  quickAction: { flex: 1, minHeight: 96, borderRadius: 17, borderWidth: 1, padding: 11, alignItems: 'center', justifyContent: 'center', gap: 8 },
  quickIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  sectionGap: { marginBottom: 26 },
  dueCard: { borderWidth: 1, borderRadius: 19, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dueIcon: { width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dueCopy: { flex: 1 },
  dueTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  dueText: { fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 3 },
  activity: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, gap: 11 },
  activityIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activityCopy: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  activityMeta: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  activityAmount: { fontSize: 13, fontWeight: '800' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});