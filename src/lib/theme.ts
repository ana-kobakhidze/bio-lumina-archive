/**
 * HEBRA exhibition themes.
 *
 * Each theme drives both the DOM (through the design-system tokens
 * --background / --foreground / --specimen) and the 3D scene (ground colour
 * and the scanner lighting), so the page and the specimen never drift apart.
 */

export type ThemeId = "void" | "vermilion" | "bone" | "umber" | "velvet";

export interface HebraTheme {
  id: ThemeId;
  label: string;
  swatch: string;
  /** design-system tokens, oklch */
  css: { background: string; foreground: string; specimen: string };
  /** three.js scene colours, hex */
  scene: {
    ground: string;
    key: string;
    fill: string;
    rim: string;
    point: string;
  };
}

export const THEMES: HebraTheme[] = [
  {
    id: "void",
    label: "Void",
    swatch: "#0C0827",
    css: {
      background: "oklch(0.164 0.061 283.4)",
      foreground: "oklch(0.930 0.024 293.6)",
      specimen: "oklch(0.930 0.024 293.6)",
    },
    scene: {
      ground: "#0C0827",
      key: "#8C85E8",
      fill: "#25387A",
      rim: "#2FE3B0",
      point: "#5950B8",
    },
  },
  {
    id: "vermilion",
    label: "Vermilion",
    swatch: "#F03800",
    css: {
      background: "oklch(0.624 0.225 33.9)",
      foreground: "oklch(0.201 0.058 38.4)",
      specimen: "oklch(0.201 0.058 38.4)",
    },
    scene: {
      ground: "#F03800",
      key: "#BFC4FF",
      fill: "#3026F4",
      rim: "#7FE9D2",
      point: "#5950B8",
    },
  },
  {
    id: "bone",
    label: "Bone",
    swatch: "#F0EDFA",
    css: {
      background: "oklch(0.952 0.018 296.6)",
      foreground: "oklch(0.247 0.095 273.1)",
      specimen: "oklch(0.247 0.095 273.1)",
    },
    scene: {
      ground: "#F0EDFA",
      key: "#FFFFFF",
      fill: "#3026F4",
      rim: "#1EA598",
      point: "#5950B8",
    },
  },
  {
    id: "umber",
    label: "Umber",
    swatch: "#5E4C3C",
    css: {
      background: "oklch(0.430 0.035 63.3)",
      foreground: "oklch(0.952 0.018 296.6)",
      specimen: "oklch(0.952 0.018 296.6)",
    },
    scene: {
      ground: "#5E4C3C",
      key: "#A7A3FF",
      fill: "#3026F4",
      rim: "#3FE7BE",
      point: "#5950B8",
    },
  },
  {
    id: "velvet",
    label: "Velvet",
    swatch: "#4E0722",
    css: {
      background: "oklch(0.296 0.116 351.2)",
      foreground: "oklch(0.920 0.045 345)",
      specimen: "oklch(0.920 0.045 345)",
    },
    scene: {
      ground: "#4E0722",
      key: "#9D2A80",
      fill: "#155D84",
      rim: "#D03F37",
      point: "#9D2A80",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "void";

export function themeById(id: string | null | undefined): HebraTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}
