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
    text: "#F4F6F9",
    tint: "#0E7C66",
    background: "#07111A",
    foreground: "#F4F6F9",
    card: "#0E1629",
    cardForeground: "#F4F6F9",
    primary: "#0E7C66",
    primaryForeground: "#ECFAF7",
    secondary: "#172133",
    secondaryForeground: "#C8DBE8",
    muted: "#172133",
    mutedForeground: "#7A9BB5",
    accent: "#D4AF37",
    accentForeground: "#07111A",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#1E2D42",
    input: "#181F31",
    gold: "#D4AF37",
    emerald: "#0E7C66",
    emeraldBright: "#34d399",
    amber: "#F59E0B",
    violet: "#818CF8",
    rose: "#FB7185",
    blue: "#60A5FA",
  },
  radius: 12,
};

export default colors;
