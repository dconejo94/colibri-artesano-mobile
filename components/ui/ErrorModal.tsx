import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Button from './Button';
import { spacing, useTheme } from '@/src/theme';

type ErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  title?: string;
};

export default function ErrorModal({
  visible,
  message,
  onClose,
  title = 'Ocurrió un error',
}: ErrorModalProps) {
  const { colors, text, radii } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.modal,
            {
              backgroundColor: colors.bgPage,
              borderRadius: radii.lg,
            },
          ]}
        >
          <MaterialIcons
            name="error-outline"
            size={56}
            color={colors.error}
          />

          <Text
            style={[
              text.h3,
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              text.body,
              styles.message,
              { color: colors.textSecondary },
            ]}
          >
            {message}
          </Text>

          <Button
            title="Aceptar"
            onPress={onClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: spacing[5],
  },
  modal: {
    width: '100%',
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[4],
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
