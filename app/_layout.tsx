import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_400Regular_Italic,
} from '@expo-google-fonts/lora';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/src/theme';

SplashScreen.preventAutoHideAsync();

// Tokens de color del sistema de tema (estáticos para las opciones del Stack)
const C = {
  primary:     '#4A7C59',
  primaryDeep: '#3A5E47',
  bgNavbar:    '#FAFAF7',
  textPrimary: '#2C3830',
  bgNavbarDk:  '#1A1F1C',
};

const headerTheme = {
  headerStyle:      { backgroundColor: C.bgNavbar },
  headerTintColor:  C.primary,
  headerTitleStyle: {
    fontFamily: 'DMSans_500Medium',
    color:      C.textPrimary,
    fontSize:   16,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_400Regular_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index"              options={{ headerShown: false }} />
        <Stack.Screen name="productos"          options={{ headerShown: false }} />
        <Stack.Screen name="producto/[id]"      options={{ ...headerTheme }} />
        <Stack.Screen name="tienda"             options={{ title: 'Mi Tienda',  ...headerTheme }} />
        <Stack.Screen name="eventos"            options={{ title: 'Eventos',    ...headerTheme }} />
        <Stack.Screen name="carrito"            options={{ title: 'Carrito',    ...headerTheme }} />
        <Stack.Screen name="favoritos"          options={{ title: 'Favoritos',  ...headerTheme }} />
      </Stack>
    </ThemeProvider>
  );
}

