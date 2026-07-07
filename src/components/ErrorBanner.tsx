import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { ApiError } from '@/src/api/errors';

export type ErrorBannerProps = {
  error: ApiError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  /**
   * 'compact' (default): banner delgado con botón de cerrar, pensado para
   *   mostrarse arriba de contenido que ya existe (ej. falló paginar pero
   *   ya hay productos en pantalla).
   * 'centered': estado de error a pantalla completa (ícono grande + mensaje
   *   + botón Reintentar centrados), pensado para reemplazar el contenido
   *   cuando no hay nada que mostrar.
   */
  variant?: 'compact' | 'centered';
};

export default function ErrorBanner({ error, onRetry, onDismiss, variant = 'compact' }: ErrorBannerProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state whenever a new error object is passed
  useEffect(() => {
    setDismissed(false);
  }, [error]);

  if (!error || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (variant === 'centered') {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons
          name="error-outline"
          size={56}
          color={colors.errorText}
          style={styles.centeredIcon}
        />
        <Text style={[styles.centeredMessage, { fontFamily: fonts.sanRegular, color: colors.errorText }]}>
          {error.message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.centeredRetryButton,
              {
                borderColor: colors.errorText,
                borderRadius: radii.sm,
              },
            ]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text style={[styles.retryText, { fontFamily: fonts.sanBold, color: colors.errorText }]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.errorBg,
          borderColor: colors.border,
          borderRadius: radii.md,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <MaterialIcons name="error-outline" size={20} color={colors.errorText} style={styles.icon} />
        <Text style={[styles.message, { fontFamily: fonts.sanRegular, color: colors.errorText }]}>
          {error.message}
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={18} color={colors.errorText} />
        </TouchableOpacity>
      </View>

      {onRetry && (
        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              borderColor: colors.errorText,
              borderRadius: radii.sm,
            },
          ]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
        >
          <Text style={[styles.retryText, { fontFamily: fonts.sanBold, color: colors.errorText }]}>
            Reintentar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 12,
  },

  // Centered (full-screen empty state) variant
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  centeredIcon: {
    marginBottom: 12,
  },
  centeredMessage: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  centeredRetryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
  },
});