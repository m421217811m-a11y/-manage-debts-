import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function Screen({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  icon = 'arrow-left',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 },
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{title}</Text>
      <Feather name={icon} size={17} color={colors.primaryForeground} />
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionText, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction}><Text style={[styles.actionText, { color: colors.primary }]}>{action}</Text></Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = 'users', title, body, action, onAction }: { icon?: keyof typeof Feather.glyphMap; title: string; body?: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      {body ? <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text> : null}
      {action && onAction ? <PrimaryButton title={action} onPress={onAction} icon="plus" /> : null}
    </View>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'phone-pad' | 'decimal-pad'; multiline?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign="right"
        style={[styles.input, { color: colors.foreground, borderColor: colors.input, backgroundColor: colors.card }, multiline && styles.multiline]}
      />
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  primaryButton: { minHeight: 52, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 18 },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionText: { fontSize: 17, fontWeight: '700' },
  actionText: { fontSize: 13, fontWeight: '600' },
  empty: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: 'center', gap: 9 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 6 },
  fieldWrap: { gap: 8, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  input: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  multiline: { minHeight: 98, paddingTop: 14, textAlignVertical: 'top' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});