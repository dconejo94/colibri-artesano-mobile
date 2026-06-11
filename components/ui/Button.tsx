import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title:     string;
  onPress:   () => void;
  variant?:  Variant;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  variant  = 'primary',
  disabled,
}: Props) {
  const { colors, radii, text } = useTheme();

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
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <Text style={[text.button, { color: textColor }]}>
        {title}
      </Text>
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
  disabled: {
    opacity: 0.5,
  },
});