// Fonts ───────────────────────────────────────────────────────────────────────
// DM Sans → functional UI (buttons, prices, labels, body)
// Lora    → editorial display (section titles, hero, artisan quotes)
export const fonts = {
  sanRegular:  'DMSans_400Regular',
  sanMedium:   'DMSans_500Medium',
  sanBold:     'DMSans_700Bold',
  serifRegular:'Lora_400Regular',
  serifSemi:   'Lora_600SemiBold',
  serifItalic: 'Lora_400Regular_Italic',
} as const;

// Type scale (px) ─────────────────────────────────────────────────────────────
export const fontSizes = {
  xs:  11,  // uppercase categories, status labels
  sm:  13,  // list prices, metadata, secondary labels
  md:  15,  // main body, short description
  lg:  17,  // product name in card, subtitles
  xl:  20,  // H3 inside a section
  '2xl': 24, // H2, name in detail view, detail price
  '3xl': 28, // H1, main screen title
  '4xl': 34, // hero display
} as const;

// Line-height multipliers ─────────────────────────────────────────────────────
// React Native requires absolute px values, not multipliers.
const lineHeights = {
  tight:  1.2,
  snug:   1.35,
  normal: 1.5,
  relaxed:1.65,
} as const;

// Letter spacing ──────────────────────────────────────────────────────────────
export const tracking = {
  wide:    0.8,   // uppercase categories
  normal:  0,
  tight:  -0.3,   // display titles
} as const;

// Font weights ────────────────────────────────────────────────────────────────
export const weights = {
  regular: '400' as const,
  medium:  '500' as const,
  bold:    '700' as const,
} as const;

// Composite text styles (ready to use with [text.h2, { color }]) ──────────────
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
