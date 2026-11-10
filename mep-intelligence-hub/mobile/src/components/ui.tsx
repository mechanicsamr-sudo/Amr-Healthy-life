import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ar } from '../i18n/ar';
import { colors, fonts, space } from '../theme';

// React Native swaps 'left'/'right' when the layout is RTL. This always
// resolves to visually right-aligned text, whether or not RTL is active yet.
const alignRight = I18nManager.isRTL ? 'left' : 'right';

type Variant = 'body' | 'title' | 'heading' | 'muted' | 'small';

export function AppText({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[styles.textBase, textStyles[variant], style]} />;
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const body = <View style={styles.screenInner}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? <AppText variant="heading" style={{ marginBottom: space.sm }}>{title}</AppText> : null}
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  kind = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'danger';
}) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.button,
        kind === 'secondary' && styles.buttonSecondary,
        kind === 'danger' && styles.buttonDanger,
        (pressed || off) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={kind === 'secondary' ? colors.primary : '#fff'} />
      ) : (
        <AppText style={[styles.buttonText, kind === 'secondary' && { color: colors.primary }]}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function Field({ label, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <AppText variant="small" style={{ marginBottom: space.xs }}>{label}</AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        {...input}
        style={[styles.input, input.style]}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <AppText variant="small" style={{ color: selected ? '#fff' : colors.text }}>{label}</AppText>
    </Pressable>
  );
}

export function EmptyState({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={36} color={colors.muted} />
      <AppText variant="muted" style={{ textAlign: 'center', marginTop: space.sm }}>{text}</AppText>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={colors.primary} />
      <AppText variant="muted" style={{ marginTop: space.sm }}>{ar.common.loading}</AppText>
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.error}>
      <AppText style={{ color: colors.danger }}>{message}</AppText>
      {onRetry ? <Button kind="secondary" label={ar.common.retry} onPress={onRetry} /> : null}
    </View>
  );
}

export function Disclaimer() {
  return (
    <View style={styles.disclaimer}>
      <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
      <AppText variant="small" style={{ flex: 1, marginStart: space.xs }}>{ar.common.recommendationOnly}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  textBase: { fontFamily: fonts.regular, color: colors.text, writingDirection: 'rtl', textAlign: alignRight },
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: space.xl },
  screenInner: { padding: space.lg, gap: space.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: space.md,
    alignItems: 'center',
    marginTop: space.sm,
  },
  buttonSecondary: { backgroundColor: colors.primarySoft },
  buttonDanger: { backgroundColor: colors.danger },
  buttonText: { color: '#fff', fontFamily: fonts.bold },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
    textAlign: alignRight,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    backgroundColor: '#fff',
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  empty: { alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.md },
  error: { gap: space.sm },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    padding: space.md,
  },
});

const textStyles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 24 },
  title: { fontSize: 22, lineHeight: 32, fontFamily: fonts.bold },
  heading: { fontSize: 17, lineHeight: 26, fontFamily: fonts.medium },
  muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  small: { fontSize: 13, lineHeight: 20, color: colors.muted },
});
