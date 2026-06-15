// Artisan quote / bio with a warm-accent left border (editorial pattern).
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
      {/* Section label */}
      <Text style={[text.caption, { color: colors.accent, letterSpacing: 0.8, marginBottom: spacing[2] }]}>
        SOBRE EL ARTESANO
      </Text>

      {/* Artisan name */}
      <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: spacing[2] }]}>
        {artisan}
      </Text>

      {/* Bio text in editorial italic */}
      <Text style={[text.quote, { color: colors.textSecondary }]}>
        &quot;{artisanBio}&quot;
      </Text>
    </View>
  );
}
