import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { type BaseToastProps } from 'react-native-toast-message';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';

type BannerColors = {
    bg: string;
    border: string;
    fg: string;
    icon: keyof typeof MaterialIcons.glyphMap;
};

function ToastBanner({
    text1,
    text2,
    bg,
    border,
    fg,
    icon,
    fontRegular,
    fontBold,
    radius,
}: BaseToastProps & BannerColors & { fontRegular: string; fontBold: string; radius: number }) {
    return (
        <View style={[styles.container, { backgroundColor: bg, borderColor: border, borderRadius: radius }]}>
            <MaterialIcons name={icon} size={20} color={fg} style={styles.icon} />
            <View style={styles.textWrap}>
                {!!text1 && (
                    <Text style={[styles.text1, { color: fg, fontFamily: fontBold }]} numberOfLines={2}>
                        {text1}
                    </Text>
                )}
                {!!text2 && (
                    <Text style={[styles.text2, { color: fg, fontFamily: fontRegular }]} numberOfLines={3}>
                        {text2}
                    </Text>
                )}
            </View>
        </View>
    );
}

// Reemplaza el <Toast /> por defecto de react-native-toast-message con una
// versión que toma sus colores de src/theme/colors.ts, así hereda modo
// claro/oscuro y coincide visualmente con ErrorBanner (mismo par bg/text por
// tipo de estado).
export default function AppToast() {
    const { colors, fonts, radii } = useTheme();

    const toastConfig = React.useMemo(
        () => ({
            error: (props: BaseToastProps) => (
                <ToastBanner
                    {...props}
                    bg={colors.errorBg}
                    border={colors.errorText}
                    fg={colors.errorText}
                    icon="error-outline"
                    fontRegular={fonts.sanRegular}
                    fontBold={fonts.sanBold}
                    radius={radii.md}
                />
            ),
            success: (props: BaseToastProps) => (
                <ToastBanner
                    {...props}
                    bg={colors.successBg}
                    border={colors.successText}
                    fg={colors.successText}
                    icon="check-circle"
                    fontRegular={fonts.sanRegular}
                    fontBold={fonts.sanBold}
                    radius={radii.md}
                />
            ),
            info: (props: BaseToastProps) => (
                <ToastBanner
                    {...props}
                    bg={colors.infoBg}
                    border={colors.infoText}
                    fg={colors.infoText}
                    icon="info-outline"
                    fontRegular={fonts.sanRegular}
                    fontBold={fonts.sanBold}
                    radius={radii.md}
                />
            ),
        }),
        [colors, fonts, radii]
    );

    return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        borderWidth: 0.5,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    icon: {
        marginTop: 1,
    },
    textWrap: {
        flex: 1,
        gap: 2,
    },
    text1: {
        fontSize: 14,
    },
    text2: {
        fontSize: 13,
        lineHeight: 17,
    },
});