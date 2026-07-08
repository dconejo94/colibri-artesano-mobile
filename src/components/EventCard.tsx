import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import type { EventItem } from '@/types/event';

// Deterministic cover color fallback for events without a cover_image_url.
function coverColor(seed: string, palette: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' });
}

export function formatEventDateLong(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatEventTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
}

interface Props {
  event: EventItem;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: Props) {
  const { colors, radii, text } = useTheme();
  const palette = [colors.primary, colors.primaryDeep, colors.accent, colors.accentSoft, colors.primarySoft];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}
    >
      {event.cover_image_url ? (
        <Image source={{ uri: event.cover_image_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, { backgroundColor: coverColor(event.id, palette) }]}>
          <MaterialIcons name="event" size={34} color="rgba(255,255,255,0.85)" />
        </View>
      )}
      <View style={styles.body}>
        <Text style={[text.h3, { color: colors.textPrimary }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={13} color={colors.primary} />
          <Text style={[text.caption, { color: colors.primaryDeep, fontWeight: '600' }]}>
            {formatEventDate(event.event_date)} · {formatEventTime(event.event_date)}
          </Text>
        </View>
        {!!event.location && (
          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={13} color={colors.textMuted} />
            <Text style={[text.caption, { color: colors.textMuted }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
        <View style={[styles.storesRow, { borderTopColor: colors.border }]}>
          <MaterialIcons name="storefront" size={14} color={colors.accent} />
          <Text style={[text.caption, { color: colors.textSecondary }]}>
            {event.participants.length} {event.participants.length === 1 ? 'tienda participante' : 'tiendas participantes'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 0.5, overflow: 'hidden' },
  cover: { height: 96, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 14, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    paddingTop: 11,
    borderTopWidth: 0.5,
  },
});
