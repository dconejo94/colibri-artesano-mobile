import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import type { Notification } from '@/types/notification';

const TYPE_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  order_confirmed: 'receipt-long',
  new_product: 'storefront',
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' });
}

interface Props {
  notification: Notification;
  onPress: () => void;
}

export default function NotificationRow({ notification, onPress }: Props) {
  const { colors, radii, text } = useTheme();
  const icon = TYPE_ICON[notification.type] ?? 'notifications';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderRadius: radii.lg,
          backgroundColor: notification.is_read ? 'transparent' : colors.bgSection,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '26', borderRadius: radii.md }]}>
        <MaterialIcons name={icon} size={21} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[text.label, { color: colors.textPrimary, fontWeight: '700', flex: 1 }]} numberOfLines={2}>
            {notification.title}
          </Text>
          <Text style={[text.caption, { color: colors.textMuted }]}>
            {relativeTime(notification.created_at)}
          </Text>
        </View>
        {!!notification.body && (
          <Text style={[text.caption, { color: colors.textMuted, marginTop: 3, lineHeight: 18 }]} numberOfLines={3}>
            {notification.body}
          </Text>
        )}
      </View>
      {!notification.is_read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 13,
    padding: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});
