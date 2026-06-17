import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title:     string;
  onPress:   () => void;
  variant?:  Variant;
  disabled?: boolean;
  loading?:  boolean;
};

export default function Button({
  title,
  onPress,
  variant  = 'primary',
  disabled,
  loading,
}: Props) {
  const { colors, radii, text } = useTheme();
  const isOff = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.btnPrimaryBg,
      borderWidth:     0,
      borderColor:     'transparent',
    },
    secondary: {
      backgroundColor: colors.btnSecondaryBg,
      borderWidth:     1,
      borderColor:     colors.btnSecondaryBorder,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth:     1,
      borderColor:     colors.btnGhostBorder,
    },
  }[variant];

  const textColor = {
    primary:   colors.btnPrimaryText,
    secondary: colors.btnSecondaryText,
    ghost:     colors.btnGhostText,
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderRadius: radii.md, ...variantStyles },
        isOff && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isOff}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isOff, busy: loading }}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={textColor} />}
        <Text style={[text.button, { color: textColor }]}>
          {loading ? 'Procesando…' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical:   10,
    paddingHorizontal: 24,
    alignItems:        'center',
    justifyContent:    'center',
    height:            44,
    minWidth:          141,
  },
  content: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  },
  disabled: {
    opacity: 0.5,
  },
});