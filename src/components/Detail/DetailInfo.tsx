// Description, materials, dimensions, and lead time.
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

interface Props {
  description: string;
  materials?:  string[];
  dimensions?: string;
  leadTime?:   string;
}

export default function DetailInfo({
  description,
  materials,
  dimensions,
  leadTime,
}: Props) {
  const { colors, spacing, radii, text } = useTheme();

  const hasMetadata = materials?.length || dimensions || leadTime;

  return (
    <View style={{ paddingHorizontal: spacing[4] }}>
      {/* Description */}
      <View style={{ marginBottom: spacing[5] }}>
        <SectionTitle label="Descripción" />
        <Text style={[text.bodyLong, { color: colors.textPrimary, marginTop: spacing[2] }]}>
          {description}
        </Text>
      </View>

      {/* Tech sheet — only shown when at least one field is present */}
      {hasMetadata && (
        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: colors.bgSection,
              borderRadius:    radii.lg,
              padding:         spacing[4],
              marginBottom:    spacing[5],
            },
          ]}
        >
          <SectionTitle label="Ficha técnica" />

          {materials && materials.length > 0 && (
            <MetaRow label="Materiales" value={materials.join(', ')} />
          )}
          {dimensions && (
            <MetaRow label="Dimensiones" value={dimensions} />
          )}
          {leadTime && (
            <MetaRow label="Tiempo de entrega" value={leadTime} />
          )}
        </View>
      )}
    </View>
  );
}

// Internal sub-components ─────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  const { colors, text } = useTheme();
  return (
    <Text style={[text.h3, { color: colors.primaryDeep }]}>{label}</Text>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const { colors, spacing, text } = useTheme();
  return (
    <View style={[styles.metaRow, { marginTop: spacing[2] }]}>
      <Text style={[text.label, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
      <Text style={[text.body, { color: colors.textPrimary, flex: 2 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metaCard: {},
  metaRow: {
    flexDirection: 'row',
    gap:           8,
  },
});
