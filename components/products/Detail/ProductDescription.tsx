import { ThemedText } from "@/components/themed-text";
import { ms, s, vs } from "@/utils/scale";

import { StyleSheet, View } from "react-native";

type Props = { text: string };

export function ProductDescription({ text }: Props) {
  return (
    <View style={styles.box}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Descripción
      </ThemedText>
      <ThemedText style={styles.body}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#FDE8E8",
    borderRadius: ms(14),
    padding: s(14),
    gap: vs(6),
  },
  title: { fontSize: ms(15), color: "#5A1A1A" },
  body: { fontSize: ms(13), lineHeight: ms(20), color: "#5A1A1A", opacity: 0.85 },
});