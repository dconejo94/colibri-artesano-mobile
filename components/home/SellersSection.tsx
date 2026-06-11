import { View, Text, Image, StyleSheet } from 'react-native';
import { s, vs, ms } from '@/utils/scale';
import { useTheme } from '@/src/theme';

const PLACEHOLDER_TEXT =
  'Los productos que distribuimos son más que solo objetos decorativos, son el reflejo de las manos que los crean. Conoce a los artesanos que, con paciencia y destreza, dan forma a la tradición y cultura local. Como don Juan, quien lleva más de 30 años trabajando la cerámica en su pequeño taller.';

export default function SellersSection() {
  const { colors, spacing, radii, shadows, text } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor:   colors.bgSection,
          marginVertical:    vs(8),
          paddingVertical:   vs(16),
          paddingHorizontal: s(16),
          gap:               vs(12),
          // Sombra con tinta verde — no negro genérico
          ...shadows.sm,
        },
      ]}
    >
      {/* Título con subrayado de acento cálido */}
      <View>
        <Text style={[text.h3, { color: colors.primaryDeep }]}>Nuestros vendedores</Text>
        <View style={[styles.underline, { backgroundColor: colors.accent }]} />
      </View>

      {/* Layout: imagen izquierda, texto derecha */}
      <View style={[styles.card, { gap: s(12) }]}>
        <Image
          source={require('@/assets/home/Vendedor.png')}
          style={[
            styles.image,
            {
              width:        s(155),
              height:       vs(148),
              borderRadius: radii.lg,
            },
          ]}
          resizeMode="cover"
          accessibilityLabel="Foto de artesano vendedor"
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
