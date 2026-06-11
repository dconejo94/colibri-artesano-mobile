import { View, Text, Image, StyleSheet } from 'react-native';
import { s, vs } from '@/utils/scale';
import { useTheme } from '@/src/theme';

const PLACEHOLDER_TEXT =
  'Conoce los próximos eventos en los que participaremos. Ferias, exposiciones y encuentros culturales donde podrás ver de cerca el trabajo de nuestros artesanos, conectar con su historia y llevarte una pieza única a casa. ¡No te los pierdas!';

export default function EventsSection() {
  const { colors, radii, shadows, text } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          // bgCard para contrastar con la bgSection de SellersSection
          backgroundColor:   colors.bgCard,
          marginVertical:    vs(8),
          paddingVertical:   vs(16),
          paddingHorizontal: s(16),
          gap:               vs(12),
          ...shadows.sm,
        },
      ]}
    >
      {/* Título con subrayado de acento cálido */}
      <View>
        <Text style={[text.h3, { color: colors.primaryDeep }]}>Próximos eventos</Text>
        <View style={[styles.underline, { backgroundColor: colors.accent }]} />
      </View>

      {/* Layout: imagen izquierda, texto derecha */}
      <View style={[styles.card, { gap: s(12) }]}>
        <Image
          source={require('@/assets/home/Evento.png')}
          style={[
            styles.image,
            {
              width:        s(155),
              height:       vs(148),
              borderRadius: radii.lg,
            },
          ]}
          resizeMode="cover"
          accessibilityLabel="Foto de evento artesanal"
        />
        <Text style={[text.quote, { flex: 1, color: colors.textSecondary }]}>
          {PLACEHOLDER_TEXT}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section:   {},
  underline: {
    height:       3,
    width:        40,
    borderRadius: 2,
    marginTop:    6,
  },
  card: {
    flexDirection: 'row',
    alignItems:    'flex-start',
  },
  image: {
    flexShrink: 0,
  },
});
