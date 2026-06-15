import { useTheme } from "@/src/theme";
import { ms } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

export default function SubHeader({ title, onBack, rightSlot }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container,{
      backgroundColor: colors.bgNavbar,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    ]}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <MaterialIcons name="arrow-back" size={ms(26)} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.title, {color: colors.textPrimary}]} numberOfLines={1}>
        {title}
      </Text>
      {rightSlot ?? <View style={{ width: ms(26) }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   10,
  },
  title: {
    fontSize: ms(16),
    fontWeight: '700',
  },
});
