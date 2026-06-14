// Spacing (multiples of 4) ────────────────────────────────────────────────────
// Always use spacing[N] instead of hard-coded numbers.
export const spacing = {
  1:  4,   // minimum gap between related elements
  2:  8,   // internal gap of a compact component
  3:  12,  // internal padding of small cards
  4:  16,  // standard horizontal screen padding
  5:  20,  // gap between sections inside a component
  6:  24,  // gap between screen sections
  8:  32,  // gap between large blocks
  10: 40,  // paddingBottom of the last element in a scroll view
  12: 48,  // paddingBottom of SafeAreaView — above the action bar
} as const;

// Border radius ───────────────────────────────────────────────────────────────
export const radii = {
  sm:   6,   // inputs, small chips
  md:   10,  // small cards, thumbnails, buttons
  lg:   14,  // ProductCard, main containers
  xl:   20,  // modals, bottom sheets
  full: 999, // circular badges (StatusBadge), avatars
} as const;

// Shadows ─────────────────────────────────────────────────────────────────────
// Uses #2C3830 (dark green ink) instead of pure black.
// Spread directly onto the style: style={[styles.card, { ...shadows.md }]}
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
