export type PartId = "whole" | "flower" | "leaf" | "stem" | "fruit" | "seed";

export interface PartSpec {
  id: PartId;
  label: string;
  term: string;
  latin: string;
  note: string;
  /** camera position for this part */
  camera: [number, number, number];
  /** orbit target */
  target: [number, number, number];
  fig: string;
}

export type SpeciesId =
  | "astromirabilis"
  | "dionaea"
  | "lilium"
  | "galanthus"
  | "papaver";

export interface SpeciesRecord {
  hebra: string;
  family: string;
  genus: string;
  authority: string;
  origin: string;
  range: string;
  altitude: string;
  habit: string;
  flowering: string;
  collected: string;
  collector: string;
  coordinates: string;
  conservation: string;
  scan: string;
}

export interface Species {
  id: SpeciesId;
  slug: string;
  name: string;
  common: string;
  /** default orbit target for the idle view */
  home: [number, number, number];
  /** whole-model nod, radians about X — used for pendulous flowers */
  nod?: number;
  /** uniform model scale */
  scale?: number;
  parts: PartSpec[];
  record: SpeciesRecord;
  caption: string;
  /** one-line editorial summary for cards */
  summary: string;
  /** full botanical description, one paragraph per entry */
  description: string[];
  habitat: string;
}

/* ------------------------------------------------------------------ *
 * Part studies
 * ------------------------------------------------------------------ */

const ASTRO_PARTS: PartSpec[] = [
  {
    id: "whole",
    label: "Whole specimen",
    term: "Habit",
    latin: "Astromirabilis grandiflora",
    note: "Complete preserved individual, reconstructed at 0.02 mm resolution. Radial symmetry of six recurved tepals above a single fluted scape.",
    camera: [0.16, 0.66, 2.15],
    target: [0, 0.42, 0],
    fig: "FIG. 01",
  },
  {
    id: "flower",
    label: "Flower",
    term: "Corolla",
    latin: "Perianthium radiale",
    note: "Six translucent tepals surrounding a dense boss of filiform stamens. Tissue refracts incident light, producing the lens effect recorded in the scan.",
    camera: [0.13, 0.58, 1.9],
    target: [0, 0.44, 0],
    fig: "FIG. 02",
  },
  {
    id: "leaf",
    label: "Leaf",
    term: "Lamina",
    latin: "Folium lanceolatum",
    note: "Lanceolate blade with pinnate venation. Vein walls remain optically dense after clearing, rendering the vascular network legible in transmission.",
    camera: [1.2, -0.25, 2.2],
    target: [0.15, -0.42, 0],
    fig: "FIG. 03",
  },
  {
    id: "stem",
    label: "Stem",
    term: "Caulis",
    latin: "Scapus fistulosus",
    note: "Hollow erect scape, five longitudinal ridges. Internal node partitions are visible as faint transverse bands.",
    camera: [0.8, -0.1, 2.3],
    target: [0, -0.34, 0],
    fig: "FIG. 04",
  },
  {
    id: "fruit",
    label: "Fruit",
    term: "Capsula",
    latin: "Capsula trilocularis",
    note: "Pendent three-chambered capsule, dehiscing loculicidally. Wall thickness diminishes toward the suture lines.",
    camera: [-0.9, -0.3, 2.2],
    target: [-0.1, -0.5, 0.15],
    fig: "FIG. 05",
  },
  {
    id: "seed",
    label: "Seed",
    term: "Semen",
    latin: "Semen alatum",
    note: "Winged seed, ferromagnetic trace in the testa. Dispersal is anemochorous, assisted by the residual charge of the parent plant.",
    camera: [-0.8, -0.6, 1.8],
    target: [-0.12, -0.75, 0.2],
    fig: "FIG. 06",
  },
];

const DIONAEA_PARTS: PartSpec[] = [
  {
    id: "whole",
    label: "Whole specimen",
    term: "Habit",
    latin: "Dionaea muscipula",
    note: "Low rosette of winged petioles, each terminating in an open two-valved snap trap, with a bare flowering scape rising from the centre.",
    camera: [0.45, 1.35, 3.6],
    target: [0, 0.72, 0],
    fig: "FIG. 01",
  },
  {
    id: "flower",
    label: "Trap",
    term: "Folium bilobatum",
    latin: "Lamina biloba",
    note: "Two hinged lobes fringed with interlocking marginal cilia. Three trigger hairs on each inner face; two touches within twenty seconds close the valves.",
    camera: [0.5, 0.85, 2.1],
    target: [0.1, 0.38, 0.55],
    fig: "FIG. 02",
  },
  {
    id: "leaf",
    label: "Petiole",
    term: "Petiolus alatus",
    latin: "Lamina petiolaris",
    note: "Flattened photosynthetic petiole. The winged blade performs the plant's ordinary leaf work while the trap handles capture.",
    camera: [1.0, 0.7, 2.5],
    target: [0.05, 0.2, 0.22],
    fig: "FIG. 03",
  },
  {
    id: "stem",
    label: "Rhizome",
    term: "Rhizoma",
    latin: "Caudex bulbiformis",
    note: "Short subterranean stem storing reserves between growth cycles. Fibrous roots absorb water; nitrogen arrives through the traps instead.",
    camera: [0.7, 0.1, 2.3],
    target: [0, -0.22, 0],
    fig: "FIG. 04",
  },
];

/** Standard four-part study for the herbaceous flowering specimens. */
function flowerParts(o: {
  latin: string;
  whole: string;
  flower: { latin: string; note: string };
  leaf: { latin: string; note: string };
  stem: { term: string; latin: string; note: string };
  camera?: [number, number, number];
  target?: [number, number, number];
}): PartSpec[] {
  const cam = o.camera ?? [0.16, 0.62, 2.15];
  const tgt = o.target ?? [0, 0.4, 0];
  return [
    {
      id: "whole",
      label: "Whole specimen",
      term: "Habit",
      latin: o.latin,
      note: o.whole,
      camera: cam,
      target: tgt,
      fig: "FIG. 01",
    },
    {
      id: "flower",
      label: "Flower",
      term: "Perianthium",
      latin: o.flower.latin,
      note: o.flower.note,
      camera: [cam[0] * 0.8, cam[1] * 0.95, cam[2] * 0.86],
      target: [tgt[0], tgt[1] + 0.04, tgt[2]],
      fig: "FIG. 02",
    },
    {
      id: "leaf",
      label: "Leaf",
      term: "Lamina",
      latin: o.leaf.latin,
      note: o.leaf.note,
      camera: [1.15, -0.2, 2.2],
      target: [0.12, -0.38, 0],
      fig: "FIG. 03",
    },
    {
      id: "stem",
      label: "Stem",
      term: o.stem.term,
      latin: o.stem.latin,
      note: o.stem.note,
      camera: [0.8, -0.05, 2.3],
      target: [0, -0.32, 0],
      fig: "FIG. 04",
    },
  ];
}

/* ------------------------------------------------------------------ *
 * The collection
 * ------------------------------------------------------------------ */

export const SPECIES: Species[] = [
  {
    id: "astromirabilis",
    slug: "astromirabilis-grandiflora",
    name: "Astromirabilis grandiflora",
    common: "Star mirabilis",
    home: [0, 0.33, 0],
    parts: ASTRO_PARTS,
    record: {
      hebra: "HEBRA / 000001",
      family: "Astromirabilaceae",
      genus: "Astromirabilis",
      authority: "Hort. ex HEBRA",
      origin: "Reference model",
      range: "No wild population",
      altitude: "—",
      habit: "Erect perennial herb, scapose",
      flowering: "Not applicable",
      collected: "2025-11-04",
      collector: "HEBRA Studio",
      coordinates: "—",
      conservation: "Not evaluated · constructed taxon",
      scan: "Procedural reconstruction",
    },
    summary:
      "The archive's reference specimen: a constructed taxon used to calibrate tissue density, refraction and scan resolution.",
    description: [
      "Astromirabilis grandiflora is not a wild plant. It is the reference object HEBRA uses to calibrate the archive: every tissue class, refractive index and mesh density in the collection is measured against it before a real specimen is reconstructed.",
      "The flower is radially symmetrical, with six recurved tepals arranged around a compact receptacle and a dense boss of filiform stamens. Tepal thickness falls off continuously from base to margin, which is what produces the lens effect visible when the model is rotated through the key light.",
    ],
    habitat:
      "None. The specimen exists only as geometry; its habitat fields are left empty so it can never be mistaken for a field record.",
    caption:
      "A digital record of plant form. Tissue densities are mapped to refractive index and rendered without colour correction.",
  },
  {
    id: "lilium",
    slug: "lilium-martagon",
    name: "Lilium martagon",
    common: "Martagon lily",
    home: [0, 0.38, 0],
    nod: 0.5,
    parts: flowerParts({
      latin: "Lilium martagon",
      whole: "Erect stem carrying nodding turk's-cap flowers. Six revolute tepals roll back on themselves, exposing long stamens beneath.",
      flower: {
        latin: "Perianthium revolutum",
        note: "Six tepals in two whorls of three, strongly recurved; anthers held well clear of the perianth on filaments up to 20 mm.",
      },
      leaf: {
        latin: "Folia verticillata",
        note: "Elliptic leaves in whorls around the mid-stem, the uppermost alternate and reduced. Venation parallel, typical of Liliaceae.",
      },
      stem: {
        term: "Caulis",
        latin: "Caulis bulbosus",
        note: "Unbranched stem from a yellow scaly bulb; the bulb persists between seasons while the aerial shoot dies back.",
      },
      camera: [0.18, 0.6, 2.1],
      target: [0, 0.38, 0],
    }),
    record: {
      hebra: "HEBRA / 000003",
      family: "Liliaceae",
      genus: "Lilium",
      authority: "L., 1753",
      origin: "Greater Caucasus, Georgia",
      range: "Europe to Mongolia; Caucasus, Anatolia",
      altitude: "300–2,000 m",
      habit: "Bulbous perennial, 60–150 cm",
      flowering: "June – July",
      collected: "2024-07-06",
      collector: "HEBRA field survey · Kazbegi",
      coordinates: "42.6572 N, 44.6417 E",
      conservation: "Least Concern (IUCN)",
      scan: "Photogrammetry + procedural reconstruction",
    },
    summary:
      "The turk's-cap lily of Caucasian beech and spruce woodland: six tepals rolled fully back over long, exserted stamens.",
    description: [
      "Lilium martagon is a bulbous perennial reaching 60–150 cm, growing from a yellow bulb of loosely overlapping scales. The stem carries whorls of elliptic leaves at mid-height and bears from three to more than twenty nodding flowers in a loose raceme.",
      "The flowers are the diagnostic feature: six dull pink to purplish tepals, usually dark-spotted, revolute to the point of touching the pedicel, with six long stamens and a projecting style below. The form is moth-pollinated and strongly scented after dusk.",
    ],
    habitat:
      "Montane deciduous and mixed woodland, forest margins and subalpine tall-herb meadows, most often on calcareous or base-rich soils. In Georgia it is widespread through the Greater and Lesser Caucasus between roughly 300 and 2,000 m.",
    caption:
      "Tepal recurve modelled to the herbarium sheet; stamens reconstructed at full extension.",
  },
  {
    id: "galanthus",
    slug: "galanthus-woronowii",
    name: "Galanthus woronowii",
    common: "Green snowdrop",
    home: [0, 0.3, 0],
    nod: 1.15,
    scale: 1.25,
    parts: flowerParts({
      latin: "Galanthus woronowii",
      whole: "Single pendulous flower on a slender scape between two bright, glossy, strap-shaped leaves.",
      flower: {
        latin: "Perianthium pendulum",
        note: "Three long spreading outer tepals over three short notched inner tepals, each marked with a green patch at the apex.",
      },
      leaf: {
        latin: "Folia applanata",
        note: "Two broad, glossy, bright green leaves, flat in bud rather than folded — the character separating this species from G. nivalis.",
      },
      stem: {
        term: "Scapus",
        latin: "Scapus bulbosus",
        note: "Slender scape from a small tunicate bulb, arching at the apex so the flower hangs clear of the spathe.",
      },
      camera: [0.14, 0.5, 1.65],
      target: [0, 0.3, 0],
    }),
    record: {
      hebra: "HEBRA / 000004",
      family: "Amaryllidaceae",
      genus: "Galanthus",
      authority: "Losinsk., 1935",
      origin: "Colchis, western Georgia",
      range: "Western Transcaucasia, NE Turkey, NW Caucasus",
      altitude: "0–1,400 m",
      habit: "Bulbous perennial, 10–20 cm",
      flowering: "February – April",
      collected: "2025-03-12",
      collector: "HEBRA field survey · Samegrelo",
      coordinates: "42.5088 N, 41.8709 E",
      conservation: "CITES Appendix II · Near Threatened",
      scan: "Photogrammetry + procedural reconstruction",
    },
    summary:
      "A Colchic endemic snowdrop, flowering through late-winter leaf litter on limestone slopes near the Black Sea.",
    description: [
      "Galanthus woronowii is a small bulbous perennial of 10–20 cm, distinguished from other snowdrops by its two broad, glossy, bright green leaves, which are flat rather than folded as they emerge.",
      "Each bulb produces one nodding flower: three long white outer tepals spreading away from three short inner tepals, the inner ones notched and marked with a single green patch at the apex. Seeds carry an elaiosome and are dispersed by ants.",
    ],
    habitat:
      "Damp deciduous woodland, ravine sides, limestone screes and shaded stream banks in the Colchic lowlands and foothills, from sea level to about 1,400 m. Heavy wild collection for the bulb trade is the main pressure on the species.",
    caption:
      "Recorded in flower; the pendulous attitude of the scape is preserved rather than corrected upright.",
  },
  {
    id: "papaver",
    slug: "papaver-rhoeas",
    name: "Papaver rhoeas",
    common: "Corn poppy",
    home: [0, 0.36, 0],
    parts: flowerParts({
      latin: "Papaver rhoeas",
      whole: "Slender bristly stem carrying a single shallow-bowled flower of four thin, crumpled petals.",
      flower: {
        latin: "Corolla tetrapetala",
        note: "Four broad petals, often with a dark basal blotch, over a dense ring of dark stamens and a flat-topped capsule with radiating stigmatic rays.",
      },
      leaf: {
        latin: "Folia pinnatisecta",
        note: "Deeply pinnately lobed leaves with coarsely toothed segments, the whole plant covered in spreading bristles.",
      },
      stem: {
        term: "Caulis",
        latin: "Caulis hispidus",
        note: "Wiry branched stem exuding white latex when cut; flower buds nod and lift as the petals expand.",
      },
      camera: [0.16, 0.58, 2.0],
      target: [0, 0.36, 0],
    }),
    record: {
      hebra: "HEBRA / 000005",
      family: "Papaveraceae",
      genus: "Papaver",
      authority: "L., 1753",
      origin: "Kakheti, eastern Georgia",
      range: "Europe, North Africa, West and Central Asia; widely naturalised",
      altitude: "0–1,800 m",
      habit: "Annual herb, 20–70 cm",
      flowering: "May – July",
      collected: "2024-06-18",
      collector: "HEBRA field survey · Sighnaghi",
      coordinates: "41.6200 N, 45.9217 E",
      conservation: "Least Concern (IUCN)",
      scan: "Photogrammetry + procedural reconstruction",
    },
    summary:
      "An annual of disturbed ground whose petals open crumpled from the bud and last a single day.",
    description: [
      "Papaver rhoeas is an annual herb of 20–70 cm with wiry bristly stems, deeply pinnately lobed leaves and white latex throughout. Each flower is borne singly on a long peduncle that nods in bud and straightens as the flower opens.",
      "The four petals are thin, broad and overlapping, crumpled on emergence and shed within a day or two. Beneath them sits a dense ring of dark stamens and a smooth flat-topped capsule bearing eight to eighteen stigmatic rays; the seed remains viable in soil for decades.",
    ],
    habitat:
      "Arable field margins, roadsides, fallow ground and any recently disturbed soil, from sea level to about 1,800 m. Populations appear in quantity the first season after ground is broken and thin out as the sward closes.",
    caption:
      "Petal surface modelled thin enough to transmit; the crumple of the opening bud is retained.",
  },
  {
    id: "dionaea",
    slug: "dionaea-muscipula",
    name: "Dionaea muscipula",
    common: "Venus flytrap",
    home: [0, 0.72, 0],
    parts: DIONAEA_PARTS,
    record: {
      hebra: "HEBRA / 000002",
      family: "Droseraceae",
      genus: "Dionaea",
      authority: "J.Ellis, 1768",
      origin: "Carolina wet savanna, USA",
      range: "Endemic to coastal North and South Carolina",
      altitude: "0–200 m",
      habit: "Carnivorous rosette perennial, 5–15 cm",
      flowering: "May – June",
      collected: "2025-05-22",
      collector: "HEBRA loan · cultivated stock",
      coordinates: "34.2104 N, 77.8868 W",
      conservation: "Vulnerable (IUCN) · wild collection illegal",
      scan: "Procedural reconstruction",
    },
    summary:
      "A carnivorous rosette of hinged snap traps, restricted in the wild to a narrow band of Carolina wet savanna.",
    description: [
      "Dionaea muscipula grows as a low rosette from a short bulb-like rhizome. Each leaf is divided into a flat winged petiole, which does the ordinary photosynthetic work, and a terminal two-lobed trap fringed with interlocking marginal cilia.",
      "Three trigger hairs on each inner lobe face fire the trap: two touches within about twenty seconds close the valves in under a second, and continued struggling seals them into a digestive chamber. The flowering scape is held well above the traps so pollinators are not caught.",
    ],
    habitat:
      "Seasonally wet, nutrient-poor sandy savannas and pocosin margins within roughly 120 km of Wilmington, North Carolina. The habitat depends on frequent fire; without it, shading shrubs displace the population.",
    caption:
      "Motion recorded at rest. The trap is modelled open; marginal cilia and trigger hairs are reconstructed at full density.",
  },
];

export function speciesBySlug(slug: string) {
  return SPECIES.find((s) => s.slug === slug);
}

/** Sidebar record rows, derived from the scientific record. */
export function recordRows(s: Species): [string, string][] {
  return [
    ["Hebra", s.record.hebra],
    ["Family", s.record.family],
    ["Origin", s.record.origin],
    ["Altitude", s.record.altitude],
    ["Collected", s.record.collected],
    ["Status", s.record.conservation],
  ];
}

export const PARTS = ASTRO_PARTS;
