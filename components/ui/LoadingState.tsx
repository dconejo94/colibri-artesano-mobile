import { useTheme } from '@/src/theme';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
    message?: string;
};

export default function LoadingState({ message }: Props){
    const {colors, text } = useTheme();

    return (
        <View style = {styles.container}>
            <ActivityIndicator size="large" color={colors.primary}/>
            {message && (
                <Text style={[text.body, {color:colors.textMuted}]}>
                    {message}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            12,
  },
});