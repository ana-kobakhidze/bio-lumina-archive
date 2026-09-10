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

export type SpeciesId = "astromirabilis" | "dionaea";

export interface Species {
  id: SpeciesId;
  name: string;
  common: string;
  /** default orbit target for the idle view */
  home: [number, number, number];
  parts: PartSpec[];
  meta: string[][];
  caption: string;
}

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
    note: "Low rosette of winged petioles, each terminating in an open two-valved snap trap. Carnivorous perennial of the Carolina wet savannas.",
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

export const SPECIES: Species[] = [
  {
    id: "astromirabilis",
    name: "Astromirabilis grandiflora",
    common: "Star mirabilis",
    home: [0, 0.33, 0],
    parts: ASTRO_PARTS,
    meta: [
      ["Hebra", "HEBRA / 000001"],
      ["Family", "ASTROMIRABILACEAE"],
      ["Genus", "ASTROMIRABILIS"],
      ["Origin", "SPECIMEN ARCHIVE"],
      ["Model", "03"],
      ["Scan", "DIGITAL RECONSTRUCTION"],
    ],
    caption:
      "A digital record of plant form. Tissue densities are mapped to refractive index and rendered without colour correction.",
  },
  {
    id: "dionaea",
    name: "Dionaea muscipula",
    common: "Venus flytrap",
    home: [0, 0.72, 0],
    parts: DIONAEA_PARTS,
    meta: [
      ["Hebra", "HEBRA / 000002"],
      ["Family", "DROSERACEAE"],
      ["Genus", "DIONAEA"],
      ["Origin", "CAROLINA SAVANNA"],
      ["Model", "01"],
      ["Scan", "DIGITAL RECONSTRUCTION"],
    ],
    caption:
      "Motion recorded at rest. The trap is modelled open; marginal cilia and trigger hairs are reconstructed at full density.",
  },
];

export const PARTS = ASTRO_PARTS;
