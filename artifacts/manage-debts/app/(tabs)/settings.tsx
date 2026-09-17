import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { Screen, SectionTitle } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';
import { CURRENCIES } from '@/lib/types';

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings, replaceData, people, transactions } = useApp();
  const [currencyModalVisible, setCurrencyModalVisible] = React.useState(false);
  function chooseCurrency() {
    setCurrencyModalVisible(true);
  }
  async function exportBackup() {
    try {
      if (!FileSystem.cacheDirectory) throw new Error('cache-unavailable');
      const uri = `${FileSystem.cacheDirectory}manage-debts-backup-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify({ people, transactions, settings }, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'مشاركة النسخة الاحتياطية' });
      else Alert.alert('تم تجهيز النسخة', 'تم حفظ ملف النسخة الاحتياطية مؤقتًا على الجهاز.');
    } catch {
      Alert.alert('تعذر التصدير', 'لم نتمكن من تجهيز ملف النسخة الاحتياطية.');
    }
  }
  async function importBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.people) || !Array.isArray(parsed.transactions) || !parsed.settings) throw new Error('invalid-backup');
      Alert.alert('استبدال البيانات؟', 'سيتم استبدال البيانات الحالية بمحتوى النسخة الاحتياطية.', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'استيراد', onPress: async () => {
          try {
            await replaceData({ people: parsed.people, transactions: parsed.transactions, settings: { ...settings, ...parsed.settings } });
            Alert.alert('تم الاستيراد', 'تمت استعادة بياناتك بنجاح.');
          } catch {
            Alert.alert('تعذر الاستيراد', 'حدث خطأ أثناء حفظ البيانات المستوردة.');
          }
        } },
      ]);
    } catch {
      Alert.alert('تعذر الاستيراد', 'الملف غير صالح أو لا يمكن قراءته.');
    }
  }
  return <Screen><AppHeader title="الإعدادات" subtitle="تحكم ببياناتك وتفضيلاتك" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <SectionTitle title="التخصيص" />
    <SettingRow icon="moon" title="الوضع الليلي" subtitle="ألوان مريحة للاستخدام في المساء" right={<Switch value={settings.darkMode} onValueChange={(value) => updateSettings({ darkMode: value })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.card} />} />
    <SettingRow icon="dollar-sign" title="العملة الافتراضية" subtitle={CURRENCIES.find((item) => item.value === settings.defaultCurrency)?.label} onPress={chooseCurrency} />
    <SectionTitle title="البيانات" />
    <SettingRow icon="download" title="تصدير نسخة احتياطية" subtitle={`${people.length} أشخاص · ${transactions.length} عملية`} onPress={exportBackup} />
    <SettingRow icon="upload" title="استيراد نسخة احتياطية" subtitle="استعادة بياناتك من ملف محفوظ" onPress={importBackup} />
    <View style={[styles.about, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.aboutMark, { backgroundColor: colors.primary }]}><Feather name="book-open" size={19} color={colors.primaryForeground} /></View><View style={styles.aboutCopy}><Text style={[styles.aboutTitle, { color: colors.foreground }]}>إدارة ديوني</Text><Text style={[styles.aboutText, { color: colors.mutedForeground }]}>كل ديونك، بوضوح.</Text><Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>الإصدار 1.0.0 · يعمل دون اتصال</Text></View></View>
    <Modal visible={currencyModalVisible} transparent animationType="fade" onRequestClose={() => setCurrencyModalVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.currencyModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>اختر العملة الافتراضية</Text>
          {CURRENCIES.map((item) => <Pressable key={item.value} onPress={() => { updateSettings({ defaultCurrency: item.value }); setCurrencyModalVisible(false); }} style={[styles.currencyOption, { borderBottomColor: colors.border }]}><Text style={[styles.currencySymbol, { color: colors.primary }]}>{item.symbol}</Text><Text style={[styles.currencyLabel, { color: colors.foreground }]}>{item.label}</Text>{settings.defaultCurrency === item.value ? <Feather name="check" size={18} color={colors.primary} /> : null}</Pressable>)}
          <Pressable onPress={() => setCurrencyModalVisible(false)} style={styles.modalCancel}><Text style={{ color: colors.destructive, fontWeight: '700' }}>إلغاء</Text></Pressable>
        </View>
      </View>
    </Modal>
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  currencyModal: { borderRadius: 22, borderWidth: 1, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: 8 },
  currencyOption: { minHeight: 52, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencySymbol: { fontSize: 17, fontWeight: '800', width: 34, textAlign: 'center' },
  currencyLabel: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  modalCancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});