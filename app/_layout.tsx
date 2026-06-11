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

// Mantiene el splash visible hasta que las fuentes carguen.
// Sin esto, React Native usa fuentes del sistema como fallback
// y el diseño causa un flash visual (FOUT) al montar.
SplashScreen.preventAutoHideAsync();

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

  // No renderizar nada hasta que las fuentes estén listas.
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}