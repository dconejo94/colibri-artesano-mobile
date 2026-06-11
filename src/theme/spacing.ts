// ─── Spacing (múltiplos de 4) ─────────────────────────────────────────────────
// Usá siempre spacing[N] en lugar de números hardcodeados.
export const spacing = {
  1:  4,   // separación mínima entre elementos relacionados
  2:  8,   // gap interno de un componente compacto
  3:  12,  // padding interno de cards pequeñas
  4:  16,  // padding horizontal estándar de pantalla
  5:  20,  // separación entre secciones dentro de un componente
  6:  24,  // separación entre secciones de pantalla
  8:  32,  // separación entre bloques grandes
  10: 40,  // padding bottom del último elemento en scroll
  12: 48,  // paddingBottom de SafeAreaView — encima de la action bar
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────
export const radii = {
  sm:   6,   // inputs, chips pequeños
  md:   10,  // cards pequeñas, thumbnails, botones
  lg:   14,  // ProductCard, contenedores principales
  xl:   20,  // modales, bottom sheets
  full: 999, // badges circulares (StatusBadge), avatares
} as const;

// ─── Sombras ─────────────────────────────────────────────────────────────────
// Usan #2C3830 (tinta verde oscura) en lugar de negro puro.
// Hacer spread directamente: style={[styles.card, { ...shadows.md }]}
export const shadows = {
  none: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  sm: {
    shadowColor:   '#2C3830',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   '#2C3830',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius:  6,
    elevation:     4,
  },
  lg: {
    shadowColor:   '#2C3830',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius:  12,
    elevation:     8,
  },
} as const;
