import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatMoney, getPrimaryBalance } from '@/lib/finance';

export default function ReportsScreen() {
  const colors = useColors();
  const { transactions, people, settings } = useApp();
  const primary = getPrimaryBalance(transactions, settings.defaultCurrency);
  const settled = people.filter((person) => getPrimaryBalance(transactions.filter((item) => item.personId === person.id), settings.defaultCurrency).net === 0).length;
  return <Screen><AppHeader title="التقارير" subtitle="صورة أوضح لحركتك المالية" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.period, { backgroundColor: colors.secondary }]}><Text style={[styles.periodActive, { color: colors.primary }]}>هذا الشهر</Text><Text style={{ color: colors.mutedForeground }}>آخر 3 أشهر</Text><Text style={{ color: colors.mutedForeground }}>هذه السنة</Text></View>
    <View style={styles.grid}><Metric title="إجمالي ما لي" value={formatMoney(primary.receivable, settings.defaultCurrency)} icon="arrow-down-left" /><Metric title="إجمالي ما عليّ" value={formatMoney(primary.payable, settings.defaultCurrency)} icon="arrow-up-right" /><Metric title="عدد الأشخاص ذوي الأرصدة" value={String(people.length - settled)} icon="users" /><Metric title="العمليات المسجلة" value={String(transactions.length)} icon="activity" /></View>
    <SectionTitle title="ملخص العملات" />
    {transactions.length === 0 ? <EmptyState icon="bar-chart-2" title="لا توجد بيانات كافية بعد" body="أضف بعض العمليات لتظهر التقارير والملخصات هنا." /> : <View style={[styles.insight, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.insightIcon, { backgroundColor: colors.accent }]}><Feather name="pie-chart" size={20} color={colors.primary} /></View><View style={styles.insightCopy}><Text style={[styles.insightTitle, { color: colors.foreground }]}>تحليل بسيط وواضح</Text><Text style={[styles.insightText, { color: colors.mutedForeground }]}>يتم عرض كل عملة منفصلة بدون تحويل أو جمع بين العملات.</Text></View></View>}
  </ScrollView></Screen>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: colors.accent }]}><Feather name={icon} size={16} color={colors.primary} /></View><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricTitle, { color: colors.mutedForeground }]}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  period: { borderRadius: 16, padding: 5, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  periodActive: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 9, fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  metric: { width: '48.3%', minHeight: 125, borderWidth: 1, borderRadius: 18, padding: 14 },
  metricIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metricValue: { fontSize: 17, fontWeight: '800', textAlign: 'right' },
  metricTitle: { fontSize: 11, textAlign: 'right', lineHeight: 17, marginTop: 5 },
  insight: { borderWidth: 1, borderRadius: 19, padding: 16, flexDirection: 'row', gap: 11, alignItems: 'center' },
  insightIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  insightCopy: { flex: 1, alignItems: 'flex-end' },
  insightTitle: { fontSize: 14, fontWeight: '700' },
  insightText: { fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 4 },
});