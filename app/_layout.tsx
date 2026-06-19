import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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
import { ThemeProvider, fonts } from '@/src/theme';
import { useAuthStore } from '@/src/auth/authStore';

SplashScreen.preventAutoHideAsync();

// Static color tokens for Stack screen options (cannot use hooks here)
const C = {
  primary: '#4A7C59',
  primaryDeep: '#3A5E47',
  bgNavbar: '#FAFAF7',
  textPrimary: '#2C3830',
  bgNavbarDk: '#1A1F1C',
};

const headerTheme = {
  headerStyle: { backgroundColor: C.bgNavbar },
  headerTintColor: C.primary,
  headerTitleStyle: {
    fontFamily: fonts.sanMedium,
    color: C.textPrimary,
    fontSize: 16,
  },
};

function useAuthRedirect() {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'anonymous' && !inAuthGroup) {
      router.replace('/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/');
    }
  }, [status, segments, router]);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_400Regular_Italic,
  });

  const bootstrap = useAuthStore((s) => s.bootstrap);
  const status = useAuthStore((s) => s.status);
  const splashHidden = useRef(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Hide the splash once; later status changes must not re-trigger hideAsync.
  useEffect(() => {
    if (fontsLoaded && status !== 'loading' && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, status]);

  useAuthRedirect();

  if (!fontsLoaded || status === 'loading') return null;

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(auth)"             options={{ headerShown: false }} />
        <Stack.Screen name="index"              options={{ headerShown: false }} />
        <Stack.Screen name="productos"          options={{ headerShown: false }} />
        <Stack.Screen name="producto/[id]"      options={{ ...headerTheme }} />
        <Stack.Screen name="store"              options={{ headerShown: false }} />
        <Stack.Screen name="eventos"            options={{ title: 'Eventos',    ...headerTheme }} />
        <Stack.Screen name="carrito"            options={{ title: 'Carrito',    ...headerTheme }} />
        <Stack.Screen name="favoritos"          options={{ title: 'Favoritos',  ...headerTheme }} />
      </Stack>
    </ThemeProvider>
  );
}
