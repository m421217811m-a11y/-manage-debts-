import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState, Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { formatMoney, getPrimaryBalance } from '@/lib/finance';

export default function ReportsScreen() {
  const colors = useColors();
  const { transactions, people, settings } = useApp();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [printing, setPrinting] = useState(false);
  const periodLabel = period === 'month' ? 'هذا الشهر' : period === 'quarter' ? 'آخر 3 أشهر' : 'هذه السنة';
  const periodTransactions = useMemo(() => {
    const start = new Date();
    if (period === 'month') start.setDate(1);
    if (period === 'quarter') start.setMonth(start.getMonth() - 2, 1);
    if (period === 'year') start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    return transactions.filter((item) => new Date(item.date).getTime() >= start.getTime());
  }, [transactions, period]);
  const primary = getPrimaryBalance(periodTransactions, settings.defaultCurrency);
  const settled = people.filter((person) => getPrimaryBalance(transactions.filter((item) => item.personId === person.id), settings.defaultCurrency).net === 0).length;
  async function printReport() {
    setPrinting(true);
    try {
      const html = `<html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:24px;color:#18352a}h1{color:#1f5b45}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #d7e2db;padding:10px;text-align:right}</style></head><body><h1>تقرير إدارة ديوني</h1><p>${periodLabel} · العملة: ${settings.defaultCurrency}</p><table><tr><th>البيان</th><th>القيمة</th></tr><tr><td>ما لي</td><td>${formatMoney(primary.receivable, settings.defaultCurrency)}</td></tr><tr><td>ما عليّ</td><td>${formatMoney(primary.payable, settings.defaultCurrency)}</td></tr><tr><td>صافي الرصيد</td><td>${formatMoney(primary.net, settings.defaultCurrency)}</td></tr><tr><td>العمليات</td><td>${periodTransactions.length}</td></tr><tr><td>الأشخاص بدون رصيد</td><td>${settled}</td></tr></table></body></html>`;
      await Print.printAsync({ html });
    } catch {
      Alert.alert('تعذر طباعة التقرير', 'تأكد من توفر خدمة الطباعة على الجهاز ثم حاول مرة أخرى.');
    } finally {
      setPrinting(false);
    }
  }
  return <Screen><AppHeader title="التقارير" subtitle="صورة أوضح لحركتك المالية" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.period, { backgroundColor: colors.secondary }]}>{([{ value: 'month', label: 'هذا الشهر' }, { value: 'quarter', label: 'آخر 3 أشهر' }, { value: 'year', label: 'هذه السنة' }] as const).map((item) => <Pressable key={item.value} onPress={() => setPeriod(item.value)} style={[styles.periodOption, period === item.value && styles.periodActive]}><Text style={{ color: period === item.value ? colors.primary : colors.mutedForeground, fontWeight: period === item.value ? '700' : '500', fontSize: 12 }}>{item.label}</Text></Pressable>)}</View>
    <Pressable disabled={printing} onPress={printReport} style={[styles.printButton, { backgroundColor: colors.primary, opacity: printing ? 0.55 : 1 }]}><Feather name="printer" size={17} color={colors.primaryForeground} /><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>{printing ? 'جارٍ تجهيز التقرير…' : 'طباعة التقرير'}</Text></Pressable>
    <View style={styles.grid}><Metric title="إجمالي ما لي" value={formatMoney(primary.receivable, settings.defaultCurrency)} icon="arrow-down-left" /><Metric title="إجمالي ما عليّ" value={formatMoney(primary.payable, settings.defaultCurrency)} icon="arrow-up-right" /><Metric title="عدد الأشخاص ذوي الأرصدة" value={String(people.length - settled)} icon="users" /><Metric title="العمليات في الفترة" value={String(periodTransactions.length)} icon="activity" /></View>
    <SectionTitle title="ملخص العملات" />
    {periodTransactions.length === 0 ? <EmptyState icon="bar-chart-2" title="لا توجد بيانات في الفترة" body="جرّب فترة زمنية أخرى أو أضف عملية جديدة." /> : <View style={[styles.insight, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.insightIcon, { backgroundColor: colors.accent }]}><Feather name="pie-chart" size={20} color={colors.primary} /></View><View style={styles.insightCopy}><Text style={[styles.insightTitle, { color: colors.foreground }]}>تحليل بسيط وواضح</Text><Text style={[styles.insightText, { color: colors.mutedForeground }]}>يتم عرض كل عملة منفصلة بدون تحويل أو جمع بين العملات.</Text></View></View>}
  </ScrollView></Screen>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: colors.accent }]}><Feather name={icon} size={16} color={colors.primary} /></View><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricTitle, { color: colors.mutedForeground }]}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  period: { borderRadius: 16, padding: 5, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  periodOption: { borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  periodActive: { backgroundColor: '#FFFFFF' },
  printButton: { minHeight: 48, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
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