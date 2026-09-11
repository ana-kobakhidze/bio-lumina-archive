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
      width: 0.13,
      out: 0.72,
      rise: 0.52,
      curl: 0.92,
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
      width: 0.15,
      out: 0.78,
      rise: 0.5,
      curl: 0.98,
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
      length: 0.21,
      width: 0.08,
      out: 0.13,
      rise: 0.9,
      curl: 0.08,
      cup: 0.55,
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
      length: 0.42,
      width: 0.115,
      out: 0.3,
      rise: 0.88,
      curl: 0.18,
      cup: 0.4,
      twist: 0.05,
      sweep: 0.03,
      tipRound: 0.46,
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
      width: 0.23,
      out: 0.55,
      rise: 0.7,
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
      width: 0.26,
      out: 0.6,
      rise: 0.66,
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


/**
 * Gentiana verna — spring gentian. A short salverform tube opening into five
 * flat, broadly ovate lobes held almost horizontally above a basal rosette.
 */
export const GENTIANA: FlowerMorphology = {
  receptacle: { radius: 0.055, height: 0.16 },
  stem: { length: 0.5, radius: 0.012, flare: 1.15, flutes: 4 },
  inner: [],
  outer: whorl(
    5,
    {
      length: 0.3,
      width: 0.15,
      out: 0.85,
      rise: 0.2,
      curl: 0.06,
      cup: 0.2,
      twist: 0.06,
      sweep: 0.04,
      tipRound: 0.5,
      attach: 0.028,
      tilt: -0.02,
    },
    0,
    31,
  ),
  basal: [],
  stamens: { count: 5, height: 0.07, spread: 0.022 },
};

/**
 * Crocus speciosus — autumn crocus. Six upright tepals in two whorls forming a
 * deep goblet, carried on a long white perianth tube with no true stem.
 */
export const CROCUS: FlowerMorphology = {
  receptacle: { radius: 0.05, height: 0.1 },
  stem: { length: 0.55, radius: 0.017, flare: 1.1, flutes: 3 },
  inner: whorl(
    3,
    {
      length: 0.42,
      width: 0.105,
      out: 0.2,
      rise: 0.95,
      curl: 0.1,
      cup: 0.5,
      twist: 0.05,
      sweep: 0.02,
      tipRound: 0.52,
      attach: 0.02,
      tilt: 0.08,
    },
    1.05,
    37,
  ),
  outer: whorl(
    3,
    {
      length: 0.48,
      width: 0.12,
      out: 0.26,
      rise: 0.93,
      curl: 0.14,
      cup: 0.46,
      twist: 0.06,
      sweep: 0.03,
      tipRound: 0.5,
      attach: 0.03,
      tilt: 0.12,
    },
    0,
    41,
  ),
  basal: [],
  stamens: { count: 3, height: 0.24, spread: 0.02 },
};

/**
 * Fritillaria meleagris — snake's-head fritillary. A single nodding bell of
 * six broad tepals, barely flared at the mouth, on a slender arching stem.
 */
export const FRITILLARIA: FlowerMorphology = {
  receptacle: { radius: 0.06, height: 0.08 },
  stem: { length: 0.95, radius: 0.012, flare: 1.2, flutes: 4 },
  inner: whorl(
    3,
    {
      length: 0.38,
      width: 0.115,
      out: 0.22,
      rise: 0.92,
      curl: 0.22,
      cup: 0.62,
      twist: 0.04,
      sweep: 0.02,
      tipRound: 0.55,
      attach: 0.024,
      tilt: 0.06,
    },
    1.05,
    47,
  ),
  outer: whorl(
    3,
    {
      length: 0.4,
      width: 0.125,
      out: 0.26,
      rise: 0.9,
      curl: 0.26,
      cup: 0.6,
      twist: 0.05,
      sweep: 0.03,
      tipRound: 0.52,
      attach: 0.032,
      tilt: 0.09,
    },
    0,
    53,
  ),
  basal: [],
  stamens: { count: 6, height: 0.2, spread: 0.022 },
};

export const MORPHOLOGY = {
  astromirabilis: FLOWER,
  lilium: LILIUM,
  galanthus: GALANTHUS,
  papaver: PAPAVER,
  gentiana: GENTIANA,
  crocus: CROCUS,
  fritillaria: FRITILLARIA,
} as const;
