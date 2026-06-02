import { ThemedText } from "@/components/themed-text";
import { getProductImage } from "@/utils/productImages";
import { ms, s, vs } from "@/utils/scale";

import { Image, StyleSheet, View } from "react-native";

type Props = {
  name: string;
  artisanName: string;
  imageUrl: string;
};

export function ProductDetailHeader({ name, artisanName, imageUrl }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={getProductImage(imageUrl)}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <ThemedText type="title" style={styles.name} numberOfLines={2}>
          {name}
        </ThemedText>
        <ThemedText style={styles.author}>por {artisanName}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: vs(280) },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: s(18),
    paddingBottom: vs(20),
    paddingTop: vs(40),
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  name: {
    color: "#fff",
    fontSize: ms(24),
    fontWeight: "800",
    lineHeight: ms(30),
  },
  author: {
    color: "rgba(255,255,255,0.75)",
    fontSize: ms(13),
    fontStyle: "italic",
    marginTop: vs(2),
  },
});