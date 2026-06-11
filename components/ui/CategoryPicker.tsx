import { View, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import shared from "@/constants/shared-styles";
import type { Category } from "@/types/store";

type Props = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
};

export default function CategoryPicker({ categories, selectedId, onSelect, loading }: Props) {
  const isDark = useColorScheme() === "dark";

  if (loading) {
    return <ActivityIndicator size="small" color="#6B9E98" />;
  }

  if (categories.length === 0) {
    return (
      <Text style={[shared.catEmpty, isDark && shared.textMuted]}>
        No hay categorias disponibles
      </Text>
    );
  }

  return (
    <View style={shared.catSection}>
      <Text style={[shared.catLabel, isDark && shared.textDark]}>Categoria</Text>
      <View style={shared.catGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              shared.catChip,
              isDark ? shared.catChipDark : shared.catChipLight,
              selectedId === cat.id && shared.catChipSelected,
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                shared.catChipText,
                isDark && shared.textDark,
                selectedId === cat.id && shared.catChipTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
