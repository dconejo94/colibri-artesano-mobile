// Cita/bio del artesano con borde izquierdo de acento cálido (patrón editorial).
import { View, Text } from 'react-native';
import { useTheme } from '@/src/theme';

interface Props {
  artisan:    string;
  artisanBio: string;
}

export default function DetailArtisanBio({ artisan, artisanBio }: Props) {
  const { colors, spacing, radii, text } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: spacing[4],
        marginBottom:     spacing[5],
        backgroundColor:  colors.bgSection,
        borderRadius:     radii.lg,
        borderLeftWidth:  3,
        borderLeftColor:  colors.accent,
        padding:          spacing[4],
      }}
      accessibilityLabel={`Sobre el artesano: ${artisan}`}
    >
      {/* Etiqueta de sección */}
      <Text style={[text.caption, { color: colors.accent, letterSpacing: 0.8, marginBottom: spacing[2] }]}>
        SOBRE EL ARTESANO
      </Text>

      {/* Nombre del artesano */}
      <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: spacing[2] }]}>
        {artisan}
      </Text>

      {/* Texto de bio en itálica editorial */}
      <Text style={[text.quote, { color: colors.textSecondary }]}>
        "{artisanBio}"
      </Text>
    </View>
  );
}
