import { useTheme } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    message?: string;
    icon?:   React.ComponentProps<typeof MaterialIcons>['name'];
};

export default function EmptyState({ message, icon = 'inbox' }: Props){
    const {colors, text } = useTheme();

    return (
        <View style = {styles.container}>
            <MaterialIcons name={icon} size={48} color={colors.textMuted}/>
            {message && (
                <Text style={[text.body, {color:colors.textMuted, textAlign: 'center'}]}>
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
    padding:        24,
  },
});