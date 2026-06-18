import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const borderColor = error
    ? colors.errorText
    : focused
      ? colors.borderFocus
      : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[text.label, { color: colors.textPrimary }]}>{label}</Text>
      )}
      <View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor:   colors.bgInput,
              color:             colors.textPrimary,
              borderRadius:      radii.sm,
              borderWidth:       1,
              borderColor,
              paddingHorizontal: spacing[4],
              paddingRight:      secureTextEntry ? spacing[10] : spacing[4],
              fontSize:          15,
            },
            multiline && styles.multiline,
            disabled  && styles.disabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !reveal}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={!disabled}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setReveal((r) => !r)}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <MaterialIcons
              name={reveal ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      <Text style={[text.caption, styles.errorSlot, { color: colors.errorText }]}>
        {error ?? ' '}
      </Text>
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
  eye: {
    position:       'absolute',
    right:          12,
    top:            0,
    bottom:         0,
    justifyContent: 'center',
  },
  errorSlot: {
    minHeight: 16,
  },
});
