import { Pressable, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';

interface Props {
  isFollowing: boolean;
  isLoading?: boolean;
  onPress: () => void;
}

export default function FollowButton({ isFollowing, isLoading, onPress }: Props) {
  const { colors, radii, text } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radii.full,
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: isFollowing ? 'transparent' : colors.primary,
          opacity: pressed || isLoading ? 0.75 : 1,
        },
      ]}
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? 'Dejar de seguir tienda' : 'Seguir tienda'}
      accessibilityState={{ busy: isLoading }}
    >
      <MaterialIcons
        name={isFollowing ? 'check' : 'add'}
        size={18}
        color={isFollowing ? colors.primary : colors.textOnPrimary}
      />
      <Text style={[text.button, { color: isFollowing ? colors.primary : colors.textOnPrimary }]}>
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
});
