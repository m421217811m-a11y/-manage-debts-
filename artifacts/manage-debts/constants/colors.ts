/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#17231D',
    tint: '#1F5B45',
    background: '#F8F6F1',
    foreground: '#17231D',
    card: '#FFFFFF',
    cardForeground: '#17231D',
    primary: '#1F5B45',
    primaryForeground: '#FFFFFF',
    secondary: '#E7EFE8',
    secondaryForeground: '#1F5B45',
    muted: '#F0EEE8',
    mutedForeground: '#7B817C',
    accent: '#DCEADF',
    accentForeground: '#1F5B45',
    destructive: '#B95C59',
    destructiveForeground: '#ffffff',
    border: '#E4E5DF',
    input: '#D6DAD3',
    positive: '#2D8060',
    warning: '#B8833F',
  },
  dark: {
    text: '#F1F4EE',
    tint: '#8DC5A5',
    background: '#111A15',
    foreground: '#F1F4EE',
    card: '#1A271F',
    cardForeground: '#F1F4EE',
    primary: '#8DC5A5',
    primaryForeground: '#112018',
    secondary: '#24372B',
    secondaryForeground: '#DDEDE1',
    muted: '#223027',
    mutedForeground: '#A8B5AA',
    accent: '#2D4937',
    accentForeground: '#DDEDE1',
    destructive: '#DB817C',
    destructiveForeground: '#201312',
    border: '#304237',
    input: '#45584A',
    positive: '#8DC5A5',
    warning: '#D6A761',
  },
  radius: 8,
};

export default colors;
