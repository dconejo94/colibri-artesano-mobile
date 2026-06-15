// Image gallery with a main image and selectable thumbnails.
import { useState } from 'react';
import { View, Image, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@/src/theme';

interface Props {
  images: string[];
}

export default function DetailGallery({ images }: Props) {
  const { colors, radii, spacing } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mainHeight = screenWidth * 0.85;

  return (
    <View>
      {/* Main image */}
      <Image
        source={{ uri: images[selectedIndex] }}
        style={[styles.mainImage, { width: screenWidth, height: mainHeight }]}
        resizeMode="cover"
        accessibilityLabel={`Imagen principal del producto, vista ${selectedIndex + 1} de ${images.length}`}
      />

      {/* Thumbnails — only shown when more than 1 image exists */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.thumbnailRow,
            { paddingHorizontal: spacing[4], gap: spacing[2] },
          ]}
        >
          {images.map((uri, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Pressable
                key={index}
                onPress={() => setSelectedIndex(index)}
                accessibilityLabel={`Ver imagen ${index + 1}`}
                accessibilityRole="button"
              >
                <Image
                  source={{ uri }}
                  style={[
                    styles.thumbnail,
                    {
                      borderRadius: radii.md,
                      borderWidth:  isSelected ? 2 : 0.5,
                      borderColor:  isSelected ? colors.borderFocus : colors.border,
                    },
                  ]}
                  resizeMode="cover"
                  accessibilityLabel={`Miniatura ${index + 1}`}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainImage: {
    // width and height come as calculated props from the parent component
  },
  thumbnailRow: {
    paddingVertical: 12,
  },
  thumbnail: {
    width:  56,
    height: 56,
  },
});
