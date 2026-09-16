import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/lib/AppContext';

const slides = [
  { icon: 'bar-chart-2' as const, title: 'اعرف ما لك وما عليك', body: 'تابع ديونك وأرصدة الأشخاص بسهولة.' },
  { icon: 'repeat' as const, title: 'سجّل كل دفعة', body: 'احتفظ بسجل واضح لكل دين ودفعة.' },
  { icon: 'shield' as const, title: 'بياناتك تحت سيطرتك', body: 'بياناتك محفوظة على جهازك ويمكنك إنشاء نسخة احتياطية متى شئت.' },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateSettings } = useApp();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  async function finish() {
    await updateSettings({ onboardingComplete: true });
    router.replace('/(tabs)');
  }
  return <Screen><View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}><View style={styles.top}><View style={[styles.logo, { backgroundColor: colors.primary }]}><Feather name="book-open" size={25} color={colors.primaryForeground} /></View><Pressable onPress={finish}><Text style={[styles.skip, { color: colors.mutedForeground }]}>تخطي</Text></Pressable></View><View style={styles.center}><View style={[styles.illustration, { backgroundColor: colors.accent }]}><Feather name={slide.icon} size={58} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>{slide.body}</Text></View><View><View style={styles.dots}>{slides.map((item, dotIndex) => <View key={item.title} style={[styles.dot, { backgroundColor: dotIndex === index ? colors.primary : colors.border }]} />)}</View><PrimaryButton title={index === slides.length - 1 ? 'ابدأ الآن' : 'التالي'} onPress={() => index === slides.length - 1 ? finish() : setIndex((current) => current + 1)} icon="arrow-left" /></View></View></Screen>;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  skip: { fontSize: 14, fontWeight: '600' },
  center: { alignItems: 'center', paddingHorizontal: 12 },
  illustration: { width: 142, height: 142, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  title: { fontSize: 25, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 12, maxWidth: 280 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});