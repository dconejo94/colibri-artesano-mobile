import { View, Text, useColorScheme } from "react-native";
import shared from "@/constants/shared-styles";
import Button from "@/components/ui/Button";

type Props = {
  title: string;
  backLabel?: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

export default function SubHeader({ title, backLabel = "Volver", onBack, rightSlot }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[shared.header, isDark && shared.headerDark]}>
      <Button title={backLabel} variant="outline" onPress={onBack} />
      <Text style={[shared.headerTitle, isDark && shared.textDark]} numberOfLines={1}>
        {title}
      </Text>
      {rightSlot ?? <View style={shared.headerSpacer} />}
    </View>
  );
}
