import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

// ─── Tipos ───────────────────────────────────────────────────────────────────
export type BadgeStatus = 'available' | 'pending' | 'sold_out' | 'new' | 'artisan';

interface Props {
  status: BadgeStatus;
}

// ─── Textos por estado ────────────────────────────────────────────────────────
const LABELS: Record<BadgeStatus, string> = {
  available: 'Disponible',
  pending:   'Bajo encargo',
  sold_out:  'Agotado',
  new:       'Nuevo',
  artisan:   'Artesanal',
};

// ─── Componente ──────────────────────────────────────────────────────────────
// El badge resuelve colores internamente según el tema actual.
// El texto siempre está presente junto al color — sin depender solo del color
// para comunicar el estado (accesibilidad WCAG 1.4.1).
export default function StatusBadge({ status }: Props) {
  const { colors, radii, text } = useTheme();

  // Colores semánticos por estado, tomados del sistema de tema
  const badgeColors = {
    available: { bg: colors.successBg,  fg: colors.successText },
    pending:   { bg: colors.warningBg,  fg: colors.warningText },
    sold_out:  { bg: colors.errorBg,    fg: colors.errorText   },
    new:       { bg: colors.infoBg,     fg: colors.infoText    },
    artisan:   { bg: colors.bgSection,  fg: colors.accent      },
  } satisfies Record<BadgeStatus, { bg: string; fg: string }>;

  const { bg, fg } = badgeColors[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderRadius: radii.full },
      ]}
      accessibilityLabel={`Estado: ${LABELS[status]}`}
    >
      <Text
        style={[text.caption, styles.label, { color: fg }]}
        numberOfLines={1}
      >
        {LABELS[status].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf:       'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  label: {
    fontWeight: '600',
  },
});
