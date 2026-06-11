import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { s, vs, ms } from '@/utils/scale';
import { useTheme } from '@/src/theme';

const CATEGORIES = [
  { id: '1', label: 'Cerámica',  image: require('@/assets/home/Ceramica.png')  },
  { id: '2', label: 'Téxtiles', image: require('@/assets/home/Textiles.png')  },
  { id: '3', label: 'Pinturas',  image: require('@/assets/home/Pinturas.png')  },
];

export default function CategoriesSection() {
  const { colors, spacing, radii, text } = useTheme();

  return (
    <View style={[styles.section, { paddingVertical: vs(16), paddingHorizontal: s(16) }]}>
      {/* Título con subrayado de acento cálido */}
      <View style={{ marginBottom: vs(12) }}>
        <Text style={[text.h3, { color: colors.primaryDeep }]}>Categorías</Text>
        <View style={[styles.underline, { backgroundColor: colors.accent }]} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.carousel, { gap: s(32) }]}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.id} style={[styles.card, { gap: vs(6) }]}>
            <Image
              source={cat.image}
              style={[
                styles.image,
                {
                  width:        s(98),
                  height:       vs(108),
                  borderRadius: radii.lg,
                  borderWidth:  0.5,
                  borderColor:  colors.border,
                },
              ]}
              resizeMode="cover"
              accessibilityLabel={`Categoría: ${cat.label}`}
            />
            <Text style={[text.caption, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
              {cat.label.toUpperCase()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section:    {},
  underline: {
    height:       3,
    width:        40,
    borderRadius: 2,
    marginTop:    6,
  },
  carousel: {
    paddingBottom: vs(4),
  },
  card: {
    alignItems: 'center',
  },
  image: {},
});
