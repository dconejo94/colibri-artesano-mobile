import { ReactNode } from 'react';
import {
  ImageBackground,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';

const BG = require('@/assets/images/login_background_light.png');

export default function AuthShell({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      {isDark && <View style={styles.darkWash} />}
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  darkWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,20,15,0.67)',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
