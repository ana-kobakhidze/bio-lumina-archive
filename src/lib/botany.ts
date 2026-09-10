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

export const PARTS: PartSpec[] = [
  {
    id: "whole",
    label: "Whole specimen",
    term: "Habit",
    latin: "Astromirabilis grandiflora",
    note: "Complete preserved individual, scanned at 0.02 mm resolution. Radial symmetry of six recurved tepals above a single fluted scape.",
    camera: [0.22, 0.92, 2.95],
    target: [0, 0.44, 0],
    fig: "FIG. 01",
  },
  {
    id: "flower",
    label: "Flower",
    term: "Corolla",
    latin: "Perianthium radiale",
    note: "Six translucent tepals surrounding a dense boss of filiform stamens. Tissue refracts incident light, producing the lens effect recorded in the scan.",
    camera: [0.18, 0.78, 2.55],
    target: [0, 0.46, 0],
    fig: "FIG. 02",
  },
  {
    id: "leaf",
    label: "Leaf",
    term: "Lamina",
    latin: "Folium lanceolatum",
    note: "Lanceolate blade with pinnate venation. Vein walls remain optically dense after clearing, rendering the vascular network legible in transmission.",
    camera: [1.6, -1.0, 3.2],
    target: [0.2, -1.1, 0],
    fig: "FIG. 03",
  },
  {
    id: "stem",
    label: "Stem",
    term: "Caulis",
    latin: "Scapus fistulosus",
    note: "Hollow erect scape, five longitudinal ridges. Internal node partitions are visible as faint transverse bands.",
    camera: [1.0, -0.5, 3.4],
    target: [0, -0.7, 0],
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

export const SPECIMEN_META = [
  ["Kingdom", "Plantae"],
  ["Clade", "Astrophyta"],
  ["Family", "Mirabiliaceae"],
  ["Genus", "Astromirabilis"],
  ["Collected", "Aurora Z-VIII"],
  ["Accession", "EXO·2095·0631"],
];
