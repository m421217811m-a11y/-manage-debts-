import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function AppHeader({
  title,
  subtitle,
  back = false,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.65 : 1 }]}
          >
            <Feather name="arrow-right" size={20} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.brandMark}>
            <Feather name="book-open" size={19} color={colors.primaryForeground} />
          </View>
        )}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
        </View>
        {action ? (
          <Pressable
            accessibilityLabel="إضافة"
            onPress={action}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 14 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F5B45' },
  titleBlock: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: 23, fontWeight: '700', textAlign: 'right' },
  subtitle: { marginTop: 3, fontSize: 13, textAlign: 'right' },
  iconButton: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
});