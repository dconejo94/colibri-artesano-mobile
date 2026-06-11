// ─── Capa 1: paleta cruda ────────────────────────────────────────────────────
// Estos valores nunca se usan directamente en componentes.
// Siempre usá los tokens semánticos de lightColors / darkColors.
const palette = {
  // Verdes de marca
  green100: '#EBF3ED',
  green200: '#C8DFD0',
  green300: '#A8CBB5',
  green400: '#8FAF7E',
  green500: '#6FA882',
  green600: '#4A7C59',
  green700: '#3A5E47',
  green800: '#2C3830',
  green900: '#1A1F1C',

  // Fondos verdes oscuros (dark mode)
  greenNight:   '#1A1F1C',
  greenNight2:  '#222820',
  greenNight3:  '#2A3028',
  greenNight4:  '#3A4438',

  // Beige / lino
  beige100: '#FAFAF7',
  beige200: '#F5EFE6',
  beige300: '#ECDFD0',
  beige400: '#D4C9B8',
  beige500: '#C4B89A',
  beige600: '#B89A7A',
  beige700: '#A0876B',
  beige800: '#9A8E80',
  beige900: '#8C8074',

  // Texto
  inkDark:  '#2C3830',
  inkMid:   '#5C6B5E',

  // Estados semánticos
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

// ─── Capa 2: tokens semánticos — Modo claro ───────────────────────────────────
const lightColors = {
  // Fondos
  bgPage:    palette.beige200,       // #F5EFE6 — fondo principal
  bgSection: palette.beige300,       // #ECDFD0 — secciones alternas, bio
  bgCard:    palette.white,          // #FFFFFF — cards de producto
  bgCardAlt: palette.beige400,       // #D4C5B0 — cards de destaque
  bgNavbar:  palette.beige100,       // #FAFAF7 — barra de navegación

  // Textos
  textPrimary:   palette.inkDark,    // #2C3830 — texto principal
  textSecondary: palette.inkMid,     // #5C6B5E — artesano, etiquetas
  textMuted:     palette.beige800,   // #9A8E80 — categorías uppercase
  textOnPrimary: palette.white,      // #FFFFFF — texto sobre botones verdes

  // Verdes de marca
  primary:     palette.green600,     // #4A7C59 — CTA, precio, borde focus
  primaryDeep: palette.green700,     // #3A5E47 — nombre artesano, títulos
  primarySoft: palette.green400,     // #8FAF7E — hover, íconos decorativos

  // Acento cálido
  accent:     palette.beige700,      // #A0876B — borde bio, underline títulos
  accentSoft: palette.beige600,      // #B89A7A — versión suavizada

  // Bordes
  border:       palette.beige500,    // #C4B89A — cards, separadores
  borderFocus:  palette.green600,    // #4A7C59 — input activo, miniatura seleccionada

  // Botones
  btnPrimaryBg:       palette.green600,  // #4A7C59
  btnPrimaryText:     palette.white,     // #FFFFFF
  btnSecondaryBg:     palette.beige200,  // #F5EFE6
  btnSecondaryText:   palette.green600,  // #4A7C59
  btnSecondaryBorder: palette.beige500,  // #C4B89A
  btnGhostText:       palette.green600,  // #4A7C59
  btnGhostBorder:     palette.green600,  // #4A7C59

  // Estados de producto
  successBg:   palette.successBg,
  successText: palette.successText,
  warningBg:   palette.warningBg,
  warningText: palette.warningText,
  errorBg:     palette.errorBg,
  errorText:   palette.errorText,
  infoBg:      palette.infoBg,
  infoText:    palette.infoText,
} as const;

// ─── Capa 2: tokens semánticos — Modo oscuro ──────────────────────────────────
// No es una inversión mecánica: los fondos heredan el tinte verde de marca.
const darkColors: typeof lightColors = {
  // Fondos — teñidos de verde, no grises genéricos
  bgPage:    palette.greenNight,     // #1A1F1C — verde noche
  bgSection: palette.greenNight2,    // #222820 — limo oscuro
  bgCard:    palette.greenNight3,    // #2A3028 — verde topo
  bgCardAlt: palette.greenNight3,
  bgNavbar:  palette.greenNight,

  // Textos — los beige toman el rol del texto
  textPrimary:   palette.beige400,   // #D4C9B8 — reemplaza al inkDark
  textSecondary: palette.beige900,   // #8C8074 — texto secundario
  textMuted:     palette.beige800,   // #9A8E80 — muted
  textOnPrimary: palette.greenNight, // #1A1F1C — texto sobre verde claro

  // Verdes — se aclaran para mantener contraste sobre fondos oscuros
  primary:     palette.green500,     // #6FA882
  primaryDeep: palette.green300,     // #A8CBB5
  primarySoft: palette.green400,     // #8FAF7E

  // Acento cálido — se aclara ligeramente
  accent:     palette.beige600,      // #B89A7A
  accentSoft: palette.beige700,      // #A0876B

  // Bordes
  border:      palette.greenNight4,  // #3A4438 — borde verde oscuro
  borderFocus: palette.green500,     // #6FA882 — foco verde claro

  // Botones
  btnPrimaryBg:       palette.green500,
  btnPrimaryText:     palette.greenNight,
  btnSecondaryBg:     palette.greenNight2,
  btnSecondaryText:   palette.green500,
  btnSecondaryBorder: palette.greenNight4,
  btnGhostText:       palette.green500,
  btnGhostBorder:     palette.green500,

  // Estados de producto — versiones oscuras empolvadas
  successBg:   palette.successBgDk,
  successText: palette.successTxtDk,
  warningBg:   palette.warningBgDk,
  warningText: palette.warningTxtDk,
  errorBg:     palette.errorBgDk,
  errorText:   palette.errorTxtDk,
  infoBg:      palette.infoBgDk,
  infoText:    palette.infoTxtDk,
} as const;

export type AppColors = typeof lightColors;
export { lightColors, darkColors };
