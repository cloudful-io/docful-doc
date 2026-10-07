export interface ThemeConfig {
  primary: string;
  secondary: string;
}

export const defaultTheme: ThemeConfig = {
  primary: "#2457D6",
  secondary: "#16A085",
};

export function isHexColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value);
}

function rgb(hex: string): [number, number, number] {
  const normalized = hex.slice(1);
  return [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  ) as [number, number, number];
}

function luminance(hex: string): number {
  const [red, green, blue] = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastingText(hex: string): "#000000" | "#ffffff" {
  return contrastRatio(hex, "#000000") >= contrastRatio(hex, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

function blend(
  hex: string,
  target: "#000000" | "#ffffff",
  amount: number,
): string {
  const from = rgb(hex);
  const to = rgb(target);
  const channels = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * amount),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function accessibleAccent(
  hex: string,
  surface: "#ffffff" | "#111827",
): string {
  if (contrastRatio(hex, surface) >= 4.5) return hex;
  const candidates = ["#000000", "#ffffff"] as const;
  const valid: Array<{ color: string; amount: number }> = [];
  for (const target of candidates) {
    for (let step = 1; step <= 100; step += 1) {
      const amount = step / 100;
      const color = blend(hex, target, amount);
      if (contrastRatio(color, surface) >= 4.5) {
        valid.push({ color, amount });
        break;
      }
    }
  }
  return valid.sort((a, b) => a.amount - b.amount)[0]?.color ?? hex;
}

export function validateTheme(theme: Partial<ThemeConfig> = {}): ThemeConfig {
  const resolved = {
    primary: theme.primary ?? defaultTheme.primary,
    secondary: theme.secondary ?? defaultTheme.secondary,
  };
  for (const [name, value] of Object.entries(resolved)) {
    if (!isHexColor(value)) {
      throw new Error(
        `Invalid ${name} theme color "${value}". Use a six-digit hexadecimal color such as #2457D6.`,
      );
    }
  }
  return resolved;
}

export function themeStyle(theme: Partial<ThemeConfig> = {}): string {
  const config = validateTheme(theme);
  const primaryText = contrastingText(config.primary);
  const secondaryText = contrastingText(config.secondary);
  return [
    `--theme-primary:${config.primary}`,
    `--theme-primary-text:${primaryText}`,
    `--theme-secondary:${config.secondary}`,
    `--theme-secondary-text:${secondaryText}`,
    `--theme-primary-link-light:${accessibleAccent(config.primary, "#ffffff")}`,
    `--theme-secondary-link-light:${accessibleAccent(config.secondary, "#ffffff")}`,
    `--theme-primary-link-dark:${accessibleAccent(config.primary, "#111827")}`,
    `--theme-secondary-link-dark:${accessibleAccent(config.secondary, "#111827")}`,
  ].join(";");
}
