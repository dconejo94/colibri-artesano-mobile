import { View, Text, useColorScheme, TouchableOpacity } from "react-native";
import shared from "@/constants/shared-styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ms } from "@/utils/scale";

type Props = {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

export default function SubHeader({ title, onBack, rightSlot }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[shared.header, isDark && shared.headerDark]}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <MaterialIcons name="arrow-back" size={ms(26)} color={isDark ? "#fff" : "#000"} />
      </TouchableOpacity>
      <Text style={[shared.headerTitle, isDark && shared.textDark]} numberOfLines={1}>
        {title}
      </Text>
      {rightSlot ?? <View style={{ width: ms(26) }} />}
    </View>
  );
}
