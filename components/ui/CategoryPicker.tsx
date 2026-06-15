import { useTheme } from "@/src/theme";
import type { Category } from "@/types/store";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
};

export default function CategoryPicker({ categories, selectedId, onSelect, loading }: Props) {
  //const isDark = useColorScheme() === "dark";
  const { colors } = useTheme();

  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary} />;
  }

  if (categories.length === 0) {
    return (
      <Text style={[styles.empty, {color: colors.textMuted}]}>
        No hay categorias disponibles
      </Text>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.label, {color: colors.textPrimary}]}>Categoria</Text>
      <View style={styles.grid}>
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <TouchableOpacity
            key={cat.id}
            style = {[
              styles.chip,{
                borderColor: isSelected ? colors.primary: colors.border,
                backgroundColor: isSelected ? colors.primary + '26' : colors.bgCard,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
          >
            <Text
              style = {[
                styles.chipText,{
                  color: isSelected ? colors.primary: colors.textPrimary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
            {cat.name}
            </Text>
          </TouchableOpacity>
          );
        })}    
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8},
  label: {fontSize: 14, fontWeight: '600'},
  empty: {fontSize: 13, fontStyle: 'italic'},
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1,
  },
  chipText: { fontSize: 13}
});
