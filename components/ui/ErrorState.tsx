import { useTheme } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    message?: string;
    onRetry?: ()=> void;
};

export default function EmptyState({ message, onRetry }: Props){
    const {colors, text,radii } = useTheme();

    return (
        <View style = {styles.container}>
            <MaterialIcons name="error-outline" size={40} color={colors.errorText}/>
            <Text style={[text.body, { color:colors.errorText, textAlign: 'center' }]}>
                {message}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.button, { borderColor: colors.primary, borderRadius: radii.md }]}
                    onPress={onRetry}
                    accessibilityLabel='Reintentar'
                    accessibilityRole='button'
                >
                    <Text style={[text.button, { color: colors.primary }]}>Reintentar</Text>
                    </TouchableOpacity>
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
    padding:        24,
  },
  button: {
    marginTop:         8,
    paddingVertical:   10,
    paddingHorizontal: 24,
    borderWidth:       1,
  },
});