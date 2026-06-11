// ─── Fuentes ─────────────────────────────────────────────────────────────────
// DM Sans → interfaz funcional (botones, precios, etiquetas, cuerpo)
// Lora    → display editorial (títulos de sección, hero, citas de artesano)
export const fonts = {
  sanRegular:  'DMSans_400Regular',
  sanMedium:   'DMSans_500Medium',
  sanBold:     'DMSans_700Bold',
  serifRegular:'Lora_400Regular',
  serifSemi:   'Lora_600SemiBold',
  serifItalic: 'Lora_400Regular_Italic',
} as const;

// ─── Escala tipográfica (px) ─────────────────────────────────────────────────
export const fontSizes = {
  xs:  11,  // categorías uppercase, labels de estado
  sm:  13,  // precios en lista, metadatos, etiquetas secundarias
  md:  15,  // cuerpo principal, descripción corta
  lg:  17,  // nombre del producto en card, subtítulos
  xl:  20,  // H3 interior de sección
  '2xl': 24, // H2, nombre en detalle, precio en detalle
  '3xl': 28, // H1, título de pantalla principal
  '4xl': 34, // hero display
} as const;

// ─── Multiplicadores de lineHeight ──────────────────────────────────────────
// React Native necesita valores absolutos en px, no multiplicadores.
const lineHeights = {
  tight:  1.2,
  snug:   1.35,
  normal: 1.5,
  relaxed:1.65,
} as const;

// ─── Letter spacing ──────────────────────────────────────────────────────────
export const tracking = {
  wide:    0.8,   // categorías uppercase
  normal:  0,
  tight:  -0.3,   // títulos display
} as const;

// ─── Pesos tipográficos ──────────────────────────────────────────────────────
export const weights = {
  regular: '400' as const,
  medium:  '500' as const,
  bold:    '700' as const,
} as const;

// ─── Estilos compuestos (listos para usar con [text.h2, { color }]) ──────────
export const textStyles = {
  hero: {
    fontFamily:   fonts.serifSemi,
    fontSize:     fontSizes['4xl'],
    lineHeight:   fontSizes['4xl'] * lineHeights.tight,
    letterSpacing:tracking.tight,
  },
  h2: {
    fontFamily:   fonts.serifSemi,
    fontSize:     fontSizes['2xl'],
    lineHeight:   fontSizes['2xl'] * lineHeights.snug,
    letterSpacing:tracking.tight,
  },
  h3: {
    fontFamily:   fonts.serifRegular,
    fontSize:     fontSizes.xl,
    lineHeight:   fontSizes.xl * lineHeights.snug,
    letterSpacing:tracking.normal,
  },
  body: {
    fontFamily:  fonts.sanRegular,
    fontSize:    fontSizes.md,
    lineHeight:  fontSizes.md * lineHeights.normal,
    letterSpacing:tracking.normal,
  },
  bodyLong: {
    fontFamily:  fonts.sanRegular,
    fontSize:    fontSizes.md,
    lineHeight:  fontSizes.md * lineHeights.relaxed,
    letterSpacing:tracking.normal,
  },
  label: {
    fontFamily:  fonts.sanMedium,
    fontSize:    fontSizes.sm,
    lineHeight:  fontSizes.sm * lineHeights.normal,
    letterSpacing:tracking.normal,
  },
  caption: {
    fontFamily:  fonts.sanRegular,
    fontSize:    fontSizes.xs,
    lineHeight:  fontSizes.xs * lineHeights.normal,
    letterSpacing:tracking.wide,
  },
  quote: {
    fontFamily:  fonts.serifItalic,
    fontSize:    fontSizes.md,
    lineHeight:  fontSizes.md * lineHeights.relaxed,
    letterSpacing:tracking.normal,
  },
  button: {
    fontFamily:  fonts.sanMedium,
    fontSize:    fontSizes.md,
    lineHeight:  fontSizes.md * lineHeights.tight,
    letterSpacing:tracking.normal,
  },
  productName: {
    fontFamily:  fonts.sanMedium,
    fontSize:    fontSizes.lg,
    lineHeight:  fontSizes.lg * lineHeights.snug,
    letterSpacing:tracking.normal,
  },
  price: {
    fontFamily:  fonts.sanBold,
    fontSize:    fontSizes.sm,
    lineHeight:  fontSizes.sm * lineHeights.tight,
    letterSpacing:tracking.normal,
  },
  priceDetail: {
    fontFamily:  fonts.sanBold,
    fontSize:    fontSizes['2xl'],
    lineHeight:  fontSizes['2xl'] * lineHeights.tight,
    letterSpacing:tracking.tight,
  },
} as const;
