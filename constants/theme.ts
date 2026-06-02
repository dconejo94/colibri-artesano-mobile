/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text:           '#11181C',
    background:     '#fff',
    tint:           tintColorLight,
    icon:           '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    headerBg:   '#ACD4CD',
    contentBg:  '#FAE4E4',
    surfaceAlt: '#F0F5F5',
    divider:    '#EFEFEF',

    brand:      '#3E5F63',
    brandLight: '#82A8AC',
    brandDeep:  '#1A3336',

    // Texto sobre superficies de marca
    textOnBrand:      '#FFFFFF',
    textOnBrandMuted: 'rgba(255,255,255,0.75)',

    textDescription: '#5A1A1A',
    linkDescription: '#B91C1C',

    star:   '#F5C842',
    handle: '#D0D0D0',
  },
  dark: {
    text:           '#ECEDEE',
    background:     '#151718',
    tint:           tintColorDark,
    icon:           '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    headerBg:   '#4E7C74',
    contentBg:  '#3F1D23',
    surfaceAlt: '#2A2A2A',
    divider:    '#222222',

    brand:      '#3E5F63',
    brandLight: '#82A8AC',
    brandDeep:  '#1A3336',

    textOnBrand:      '#FFFFFF',
    textOnBrandMuted: 'rgba(255,255,255,0.75)',

    textDescription: '#F9C6C6',
    linkDescription: '#F87171',

    star:   '#F5C842',
    handle: '#444444',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
