import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import GlassCard from './GlassCard';

export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors, fonts } = useTheme();
  return (
    <View>
      <Text style={[styles.title, { fontFamily: fonts.serifSemi, color: colors.primaryDeep }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { fontFamily: fonts.sanRegular, color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export function Banner({ kind = 'error', children }: { kind?: 'error' | 'ok'; children: string }) {
  const { colors, fonts } = useTheme();
  const bg = kind === 'ok' ? colors.successBg : colors.errorBg;
  const fg = kind === 'ok' ? colors.successText : colors.errorText;
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <MaterialIcons name={kind === 'ok' ? 'check-circle' : 'error-outline'} size={16} color={fg} />
      <Text style={[styles.bannerText, { fontFamily: fonts.sanRegular, color: fg }]}>{children}</Text>
    </View>
  );
}

export function TextLink({
  children,
  onPress,
  align = 'left',
}: {
  children: string;
  onPress: () => void;
  align?: 'left' | 'right' | 'center';
}) {
  const { colors, fonts } = useTheme();
  const alignSelf = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  return (
    <Pressable onPress={onPress} style={{ alignSelf }} accessibilityRole="button">
      <Text style={[styles.link, { fontFamily: fonts.sanMedium, color: colors.primary }]}>{children}</Text>
    </Pressable>
  );
}

export function FooterSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.footer}>
      <GlassCard pill contentStyle={styles.footerPill}>
        <Text style={[styles.footerText, { fontFamily: fonts.sanRegular, color: colors.textPrimary }]}>
          {prompt}{' '}
          <Text
            onPress={onPress}
            style={[styles.footerAction, { fontFamily: fonts.sanBold, color: colors.primary }]}
          >
            {action}
          </Text>
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    fontSize: 13,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 28,
    alignItems: 'center',
  },
  footerPill: {
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerAction: {
    fontSize: 14,
  },
});
