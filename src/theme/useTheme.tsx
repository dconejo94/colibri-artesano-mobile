import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { lightColors, darkColors, type AppColors } from './colors';
import { fonts, fontSizes, textStyles, tracking, weights } from './typography';
import { spacing, radii, shadows } from './spacing';

// ─── Tipo del objeto de tema completo ────────────────────────────────────────
interface Theme {
  colors:   AppColors;
  fonts:    typeof fonts;
  sizes:    typeof fontSizes;
  weights:  typeof weights;
  tracking: typeof tracking;
  text:     typeof textStyles;
  spacing:  typeof spacing;
  radii:    typeof radii;
  shadows:  typeof shadows;
  isDark:   boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext<Theme | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
// Debe envolver la app completa, antes del NavigationContainer.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark  = scheme === 'dark';

  const theme = useMemo<Theme>(() => ({
    colors:   isDark ? darkColors : lightColors,
    fonts,
    sizes:    fontSizes,
    weights,
    tracking,
    text:     textStyles,
    spacing,
    radii,
    shadows,
    isDark,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Uso: const { colors, spacing, radii, shadows, text, isDark } = useTheme();
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}
