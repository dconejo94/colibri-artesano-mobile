import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/src/theme';

type Props = {
  children: ReactNode;
  pill?: boolean; // fully rounded capsule (e.g. the footer switch)
  style?: ViewStyle; // outer wrapper — margins, layout
  contentStyle?: ViewStyle; // inner padding override
};

// Shadow on the outer View so it isn't clipped by the BlurView's overflow.
export default function GlassCard({ children, pill = false, style, contentStyle }: Props) {
  const { colors, radii, isDark } = useTheme();
  const radius = pill ? radii.full : radii.xl;

  return (
    <View style={[styles.shadow, { borderRadius: radius, shadowColor: colors.glassShadow }, style]}>
      <BlurView
        intensity={30}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.fill,
          { borderRadius: radius, borderColor: colors.glassBorder, backgroundColor: colors.glassTint },
          !pill && styles.padded,
          contentStyle,
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  fill: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 24,
  },
});
