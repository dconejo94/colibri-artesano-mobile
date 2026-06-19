import { useTheme } from "@/src/theme";
import { ms, s, vs } from "@/utils/scale";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { description: string };

export function ProductDescription({ description }: Props) {
  const { colors, text } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.box, { backgroundColor: colors.bgSection }]}>
      <Text style={[text.label, { color: colors.textPrimary, fontWeight: "600" }]}>
        Descripción
      </Text>

      <Text
        style={[text.body, { color: colors.textPrimary, opacity: 0.85 }]}
        numberOfLines={expanded ? undefined : 4}
      >
        {description}
      </Text>

      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={[text.label, { color: colors.primary, fontWeight: "600" }]}>
          {expanded ? "Ver menos" : "Ver más"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: ms(14), padding: s(14), gap: vs(6) },
});