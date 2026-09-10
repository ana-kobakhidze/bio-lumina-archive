import type { FlowerMorphology, TepalSpec2 } from "./flower";
import { FLOWER } from "./flower";

/** deterministic pseudo-variation in [-1, 1] */
const vary = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** Build a whorl of tepals from one prototype, with organic variation. */
function whorl(count: number, base: Omit<TepalSpec2, "angle">, offset = 0, salt = 1): TepalSpec2[] {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    angle: (i / count) * Math.PI * 2 + offset + vary(i, salt) * 0.06,
    length: base.length * (1 + vary(i, salt + 1) * 0.04),
    width: base.width * (1 + vary(i, salt + 2) * 0.05),
    twist: base.twist * (i % 2 === 0 ? 1 : -1),
    tilt: base.tilt + vary(i, salt + 3) * 0.04,
  }));
}

/**
 * Lilium martagon — Turk's-cap lily. Six tepals in two whorls of three,
 * strongly revolute so the blade rolls right back on itself, with long
 * exserted stamens below a nodding flower.
 */
export const LILIUM: FlowerMorphology = {
  receptacle: { radius: 0.075, height: 0.1 },
  stem: { length: 1.0, radius: 0.015, flare: 1.35, flutes: 6 },
  inner: whorl(
    3,
    {
      length: 0.6,
      width: 0.15,
      out: 0.5,
      rise: 0.62,
      curl: 1.05,
      cup: 0.34,
      twist: 0.14,
      sweep: 0.05,
      tipRound: 0.66,
      attach: 0.035,
      tilt: -0.05,
    },
    1.05,
    5,
  ),
  outer: whorl(
    3,
    {
      length: 0.66,
      width: 0.17,
      out: 0.56,
      rise: 0.58,
      curl: 1.12,
      cup: 0.3,
      twist: 0.12,
      sweep: 0.06,
      tipRound: 0.62,
      attach: 0.05,
      tilt: 0.02,
    },
    0,
    9,
  ),
  basal: [],
  stamens: { count: 6, height: 0.44, spread: 0.035 },
};

/**
 * Galanthus woronowii — Colchic snowdrop. Three long spreading outer tepals
 * and three short notched inner tepals, carried on a slender pendulous scape.
 */
export const GALANTHUS: FlowerMorphology = {
  receptacle: { radius: 0.05, height: 0.06 },
  stem: { length: 0.7, radius: 0.011, flare: 1.2, flutes: 4 },
  inner: whorl(
    3,
    {
      length: 0.2,
      width: 0.09,
      out: 0.16,
      rise: 0.9,
      curl: 0.12,
      cup: 0.5,
      twist: 0.04,
      sweep: 0.02,
      tipRound: 0.42,
      attach: 0.018,
      tilt: 0.05,
    },
    0.9,
    13,
  ),
  outer: whorl(
    3,
    {
      length: 0.4,
      width: 0.13,
      out: 0.3,
      rise: 0.86,
      curl: 0.22,
      cup: 0.44,
      twist: 0.07,
      sweep: 0.04,
      tipRound: 0.5,
      attach: 0.032,
      tilt: 0.1,
    },
    0,
    17,
  ),
  basal: [],
  stamens: { count: 6, height: 0.11, spread: 0.02 },
};

/**
 * Papaver rhoeas — corn poppy. Four broad, thin, crumpled petals forming a
 * shallow bowl over a dense ring of stamens and a flat-topped capsule.
 */
export const PAPAVER: FlowerMorphology = {
  receptacle: { radius: 0.085, height: 0.075 },
  stem: { length: 0.95, radius: 0.013, flare: 1.25, flutes: 3 },
  inner: whorl(
    2,
    {
      length: 0.44,
      width: 0.3,
      out: 0.46,
      rise: 0.78,
      curl: 0.12,
      cup: 0.62,
      twist: 0.1,
      sweep: 0.05,
      tipRound: 0.4,
      attach: 0.03,
      tilt: -0.16,
    },
    1.5,
    21,
  ),
  outer: whorl(
    2,
    {
      length: 0.5,
      width: 0.34,
      out: 0.52,
      rise: 0.72,
      curl: 0.16,
      cup: 0.58,
      twist: 0.12,
      sweep: 0.06,
      tipRound: 0.36,
      attach: 0.04,
      tilt: -0.1,
    },
    0,
    27,
  ),
  basal: [],
  stamens: { count: 22, height: 0.13, spread: 0.075 },
};

export const MORPHOLOGY = {
  astromirabilis: FLOWER,
  lilium: LILIUM,
  galanthus: GALANTHUS,
  papaver: PAPAVER,
} as const;
