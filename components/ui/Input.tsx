import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme';

type Props = {
  value:          string;
  onChangeText:   (text: string) => void;
  placeholder?:   string;
  label?:         string;
  secureTextEntry?:boolean;
  keyboardType?:  KeyboardTypeOptions;
  multiline?:     boolean;
  error?:         string;
  disabled?:      boolean;
  style?:         ViewStyle;
};

export default function Input({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry,
  keyboardType,
  multiline,
  error,
  disabled,
  style,
}: Props) {
  const { colors, spacing, radii, text } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[text.label, { color: colors.textPrimary }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:  colors.bgSection,
            color:            colors.textPrimary,
            borderRadius:     radii.sm,
            borderWidth:      1,
            borderColor:      error ? colors.errorText : colors.border,
            paddingHorizontal: spacing[4],
            fontSize:         15,
          },
          multiline && styles.multiline,
          disabled  && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && (
        <Text style={[text.caption, { color: colors.errorText }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  input: {
    height: 44,
  },
  multiline: {
    height:    100,
    paddingTop: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
