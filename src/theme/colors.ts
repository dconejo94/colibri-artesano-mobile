// Layer 1: raw palette ───────────────────────────────────────────────────────
// These values are never used directly in components.
// Always use the semantic tokens from lightColors / darkColors.
const palette = {
  // Brand greens
  green100: '#EBF3ED',
  green200: '#C8DFD0',
  green300: '#A8CBB5',
  green400: '#8FAF7E',
  green500: '#6FA882',
  green600: '#4A7C59',
  green700: '#3A5E47',
  green800: '#2C3830',
  green900: '#1A1F1C',

  // Dark-mode green backgrounds
  greenNight:   '#1A1F1C',
  greenNight2:  '#222820',
  greenNight3:  '#2A3028',
  greenNight4:  '#3A4438',

  // Beige / linen
  beige100: '#FAFAF7',
  beige200: '#F5EFE6',
  beige300: '#ECDFD0',
  beige400: '#D4C9B8',
  beige500: '#C4B89A',
  beige600: '#B89A7A',
  beige700: '#A0876B',
  beige800: '#9A8E80',
  beige900: '#8C8074',

  // Text
  inkDark:  '#2C3830',
  inkMid:   '#5C6B5E',

  // Semantic states
  successBg:   '#D6ECD9',
  successText: '#2D6A35',
  successBgDk: '#1E3326',
  successTxtDk:'#7EC492',

  warningBg:   '#FDF0D5',
  warningText: '#8A5A1A',
  warningBgDk: '#2E2412',
  warningTxtDk:'#C49B55',

  errorBg:     '#FAE4E4',
  errorText:   '#8A2626',
  errorBgDk:   '#2E1818',
  errorTxtDk:  '#C47A7A',

  infoBg:      '#E3EEF7',
  infoText:    '#235580',
  infoBgDk:    '#162030',
  infoTxtDk:   '#6DA4CC',

  white: '#FFFFFF',
  black: '#000000',
} as const;

// Shape: all semantic color keys map to a plain string value.
// Declared before lightColors so darkColors can reuse it as its type.
export type AppColors = Record<string, string> & {
  bgPage: string; bgSection: string; bgCard: string; bgCardAlt: string; bgNavbar: string;
  bgInput: string;
  textPrimary: string; textSecondary: string; textMuted: string; textOnPrimary: string;
  primary: string; primaryDeep: string; primarySoft: string;
  accent: string; accentSoft: string;
  border: string; borderFocus: string;
  glassTint: string; glassBorder: string; glassShadow: string; inkShadow: string;
  btnPrimaryBg: string; btnPrimaryText: string;
  btnSecondaryBg: string; btnSecondaryText: string; btnSecondaryBorder: string;
  btnGhostText: string; btnGhostBorder: string;
  successBg: string; successText: string;
  warningBg: string; warningText: string;
  errorBg: string; errorText: string;
  infoBg: string; infoText: string;
};

// Layer 2: semantic tokens — Light mode
// Values are narrowed via `satisfies` so autocomplete works on palette members,
// but the inferred type stays `AppColors` (string), not a union of literals.
const lightColors = {
  // Backgrounds
  bgPage:    palette.beige200,       // #F5EFE6 — main background
  bgSection: palette.beige300,       // #ECDFD0 — alternate sections, bio
  bgCard:    palette.white,          // #FFFFFF — product cards
  bgCardAlt: palette.beige400,       // #D4C9B8 — featured cards
  bgNavbar:  palette.beige100,       // #FAFAF7 — navigation bar
  bgInput:   palette.beige100,       // #FAFAF7 — form inputs (warm, not rosy)

  // Text
  textPrimary:   palette.inkDark,    // #2C3830 — primary text
  textSecondary: palette.inkMid,     // #5C6B5E — artisan name, labels
  textMuted:     palette.beige800,   // #9A8E80 — uppercase categories
  textOnPrimary: palette.white,      // #FFFFFF — text on green buttons

  // Brand greens
  primary:     palette.green600,     // #4A7C59 — CTA, price, focus border
  primaryDeep: palette.green700,     // #3A5E47 — artisan name, headings
  primarySoft: palette.green400,     // #8FAF7E — hover, decorative icons

  // Warm accent
  accent:     palette.beige700,      // #A0876B — bio border, title underline
  accentSoft: palette.beige600,      // #B89A7A — softened accent

  // Borders
  border:       palette.beige500,    // #C4B89A — cards, dividers
  borderFocus:  palette.green600,    // #4A7C59 — active input, selected thumbnail

  // Glass capsule (frosted glassmorphism over the auth background)
  glassTint:   'rgba(250,250,247,0.72)', // warm linen wash
  glassBorder: 'rgba(255,255,255,0.55)', // hairline highlight
  glassShadow: 'rgba(44,56,48,0.16)',    // soft ink-green drop
  inkShadow:   'rgba(44,56,48,0.12)',    // logo disc / chrome shadow

  // Buttons
  btnPrimaryBg:       palette.green600,  // #4A7C59
  btnPrimaryText:     palette.white,     // #FFFFFF
  btnSecondaryBg:     palette.beige200,  // #F5EFE6
  btnSecondaryText:   palette.green600,  // #4A7C59
  btnSecondaryBorder: palette.beige500,  // #C4B89A
  btnGhostText:       palette.green600,  // #4A7C59
  btnGhostBorder:     palette.green600,  // #4A7C59

  // Product states
  successBg:   palette.successBg,
  successText: palette.successText,
  warningBg:   palette.warningBg,
  warningText: palette.warningText,
  errorBg:     palette.errorBg,
  errorText:   palette.errorText,
  infoBg:      palette.infoBg,
  infoText:    palette.infoText,
} satisfies AppColors;

// Layer 2: semantic tokens — Dark mode
// Not a mechanical inversion: backgrounds inherit the brand green tint.
const darkColors: AppColors = {
  // Backgrounds — green-tinted, not generic grays
  bgPage:    palette.greenNight,     // #1A1F1C — night green
  bgSection: palette.greenNight2,    // #222820 — dark moss
  bgCard:    palette.greenNight3,    // #2A3028 — dark sage
  bgCardAlt: palette.greenNight3,
  bgNavbar:  palette.greenNight,
  bgInput:   palette.greenNight2,    // #222820 — form inputs

  // Text — beige tones take over the ink role
  textPrimary:   palette.beige400,   // #D4C9B8 — replaces inkDark
  textSecondary: palette.beige900,   // #8C8074 — secondary text
  textMuted:     palette.beige800,   // #9A8E80 — muted
  textOnPrimary: palette.greenNight, // #1A1F1C — text on light green

  // Greens — lightened to maintain contrast on dark backgrounds
  primary:     palette.green500,     // #6FA882
  primaryDeep: palette.green300,     // #A8CBB5
  primarySoft: palette.green400,     // #8FAF7E

  // Warm accent — slightly lightened
  accent:     palette.beige600,      // #B89A7A
  accentSoft: palette.beige700,      // #A0876B

  // Borders
  border:      palette.greenNight4,  // #3A4438 — dark green border
  borderFocus: palette.green500,     // #6FA882 — light green focus

  // Glass capsule — deep night-green wash
  glassTint:   'rgba(26,31,28,0.70)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassShadow: 'rgba(0,0,0,0.5)',
  inkShadow:   'rgba(0,0,0,0.45)',

  // Buttons
  btnPrimaryBg:       palette.green500,
  btnPrimaryText:     palette.greenNight,
  btnSecondaryBg:     palette.greenNight2,
  btnSecondaryText:   palette.green500,
  btnSecondaryBorder: palette.greenNight4,
  btnGhostText:       palette.green500,
  btnGhostBorder:     palette.green500,

  // Product states — muted dark variants
  successBg:   palette.successBgDk,
  successText: palette.successTxtDk,
  warningBg:   palette.warningBgDk,
  warningText: palette.warningTxtDk,
  errorBg:     palette.errorBgDk,
  errorText:   palette.errorTxtDk,
  infoBg:      palette.infoBgDk,
  infoText:    palette.infoTxtDk,
};

export { lightColors, darkColors };
