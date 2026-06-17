import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

const BIRD = require('@/assets/images/light_mode_logo.png');

export default function AuthLogo() {
  const { colors, isDark, fonts } = useTheme();

  const discColor = isDark ? 'rgba(244,237,226,0.96)' : '#FFFFFF';
  const captionColor = isDark ? colors.textMuted : colors.textSecondary;
  const textShadow = isDark
    ? {
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
      }
    : null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.disc, { backgroundColor: discColor, shadowColor: colors.inkShadow }]}>
        <Image source={BIRD} style={styles.bird} resizeMode="contain" />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.wordmark, { fontFamily: fonts.serifSemi, color: colors.primaryDeep }, textShadow]}>
          Colibrí Artesano
        </Text>
        <Text style={[styles.caption, { fontFamily: fonts.sanRegular, color: captionColor }, textShadow]}>
          HECHO A MANO · COSTA RICA
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  disc: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  bird: {
    width: 54,
    height: 42,
  },
  textWrap: {
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  caption: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 5,
  },
});
