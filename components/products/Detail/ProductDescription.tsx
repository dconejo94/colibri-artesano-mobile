import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { ms, s, vs } from "@/utils/scale";
import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

type Props = { description: string };

export function ProductDescription({ description }: Props) {
  const isDark = useColorScheme() === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.box, { backgroundColor: C.contentBg }]}>
      <ThemedText
        type="defaultSemiBold"
        style={styles.title}
        lightColor={C.textDescription}
        darkColor={C.textDescription}
      >
        Descripción
      </ThemedText>

      <ThemedText
        style={styles.body}
        lightColor={C.textDescription}
        darkColor={C.textDescription}
        numberOfLines={expanded ? undefined : 4}
      >
        {description}
      </ThemedText>

      <Pressable onPress={() => setExpanded(!expanded)}>
        <ThemedText
          style={styles.link}
          lightColor={C.linkDescription}
          darkColor={C.linkDescription}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box:   { borderRadius: ms(14), padding: s(14), gap: vs(6) },
  title: { fontSize: ms(15) },
  body:  { fontSize: ms(13), lineHeight: ms(20), opacity: 0.85 },
  link:  { fontSize: ms(13), fontWeight: "600" },
});