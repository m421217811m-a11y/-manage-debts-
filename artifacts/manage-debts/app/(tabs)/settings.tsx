import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { CURRENCIES } from '@/lib/types';

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings, people, transactions } = useApp();
  return <Screen><AppHeader title="الإعدادات" subtitle="تحكم ببياناتك وتفضيلاتك" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <SectionTitle title="التخصيص" />
    <SettingRow icon="moon" title="الوضع الليلي" subtitle="ألوان مريحة للاستخدام في المساء" right={<Switch value={settings.darkMode} onValueChange={(value) => updateSettings({ darkMode: value })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.card} />} />
    <SettingRow icon="dollar-sign" title="العملة الافتراضية" subtitle={CURRENCIES.find((item) => item.value === settings.defaultCurrency)?.label} onPress={() => Alert.alert('العملة الافتراضية', 'يمكن تغيير العملة الافتراضية من النسخة الكاملة للتطبيق.')} />
    <SectionTitle title="البيانات" />
    <SettingRow icon="download" title="تصدير نسخة احتياطية" subtitle={`${people.length} أشخاص · ${transactions.length} عملية`} onPress={() => Alert.alert('النسخ الاحتياطي', 'ستتوفر مشاركة ملف النسخة الاحتياطية في الخطوة التالية. بياناتك محفوظة حاليًا على هذا الجهاز.')} />
    <SettingRow icon="upload" title="استيراد نسخة احتياطية" subtitle="استعادة بياناتك من ملف محفوظ" onPress={() => Alert.alert('استيراد نسخة احتياطية', 'اختر ملفًا من جهازك لاستعادة البيانات.')} />
    <SectionTitle title="الأمان والتطبيق" />
    <SettingRow icon="lock" title="قفل التطبيق" subtitle="حماية اختيارية برمز أو بصمة" onPress={() => Alert.alert('قفل التطبيق', 'سيتم تفعيل القفل الاختياري في إعدادات الأمان القادمة.')} />
    <View style={[styles.about, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.aboutMark, { backgroundColor: colors.primary }]}><Feather name="book-open" size={19} color={colors.primaryForeground} /></View><View style={styles.aboutCopy}><Text style={[styles.aboutTitle, { color: colors.foreground }]}>إدارة ديوني</Text><Text style={[styles.aboutText, { color: colors.mutedForeground }]}>كل ديونك، بوضوح.</Text><Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>الإصدار 1.0.0 · يعمل دون اتصال</Text></View></View>
  </ScrollView></Screen>;
}

function SettingRow({ icon, title, subtitle, right, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }) {
  const colors = useColors();
  return <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.icon, { backgroundColor: colors.accent }]}><Feather name={icon} size={18} color={colors.primary} /></View><View style={styles.copy}><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>{subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}</View>{right ?? <Feather name="chevron-left" size={18} color={colors.mutedForeground} />}</Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  row: { borderWidth: 1, borderRadius: 18, minHeight: 70, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  subtitle: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  about: { marginTop: 12, borderWidth: 1, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutMark: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  aboutCopy: { flex: 1, alignItems: 'flex-end' },
  aboutTitle: { fontSize: 15, fontWeight: '800' },
  aboutText: { fontSize: 12, marginTop: 3 },
  aboutVersion: { fontSize: 11, marginTop: 9 },
});