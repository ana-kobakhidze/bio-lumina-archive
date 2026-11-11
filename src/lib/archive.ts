/**
 * HEBRA archive model — regions and the specimen index that hangs off them.
 *
 * A region is deliberately loose: a country, a botanical region, a mountain
 * range or an ecosystem. Specimens reference regions by id, never the other
 * way round, so cards stay ignorant of region behaviour.
 */

import { SPECIES } from "@/lib/botany";

export type RegionType = "country" | "botanical-region" | "ecosystem" | "natural-region";

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  /** secondary line shown under the name in the selector */
  description?: string;
  /** archive statistics, editorial */
  speciesCount: number;
  familyCount: number;
  /** ISO country codes used to query real occurrence data */
  countries: string[];
}

export type SpecimenForm =
  | "tree"
  | "shrub"
  | "herb"
  | "vine"
  | "fern"
  | "carnivorous"
  | "aquatic";

export type SpecimenStatus = "3d" | "photographic" | "processing";

export interface Specimen {
  id: string;
  hebraId: string;
  scientificName: string;
  commonName?: string;
  family: string;
  genus: string;
  regionIds: string[];
  form: SpecimenForm;
  status: SpecimenStatus;
  /** slug of the interactive record, present for reconstructed specimens */
  speciesSlug?: string;
}

export const REGIONS: Region[] = [
  {
    id: "caucasus",
    countries: ["GE", "AM", "AZ"],
    name: "Caucasus",
    type: "botanical-region",
    description: "Georgia · Armenia · Azerbaijan · Southern Russia",
    speciesCount: 1284,
    familyCount: 143,
  },
  {
    id: "georgia",
    countries: ["GE"],
    name: "Georgia",
    type: "country",
    description: "Caucasus",
    speciesCount: 812,
    familyCount: 118,
  },
  {
    id: "mediterranean",
    countries: ["IT", "GR", "ES", "CY", "MT", "HR"],
    name: "Mediterranean",
    type: "botanical-region",
    description: "Southern Europe · North Africa · Western Asia",
    speciesCount: 2461,
    familyCount: 187,
  },
  {
    id: "alps",
    countries: ["CH", "AT", "LI", "SI"],
    name: "Alps",
    type: "natural-region",
    description: "Central European high range",
    speciesCount: 934,
    familyCount: 96,
  },
  {
    id: "japan",
    countries: ["JP"],
    name: "Japan",
    type: "country",
    description: "East Asian archipelago",
    speciesCount: 1573,
    familyCount: 161,
  },
  {
    id: "amazon-basin",
    countries: ["BR", "PE", "EC", "CO"],
    name: "Amazon Basin",
    type: "ecosystem",
    description: "Lowland humid tropical forest",
    speciesCount: 3877,
    familyCount: 214,
  },
  {
    id: "south-africa",
    countries: ["ZA"],
    name: "South Africa",
    type: "country",
    description: "Cape floristic region · Karoo",
    speciesCount: 1990,
    familyCount: 172,
  },
];

export function regionById(id: string | null | undefined) {
  return REGIONS.find((r) => r.id === id);
}

/* ------------------------------------------------------------------ *
 * Specimen index
 * ------------------------------------------------------------------ */

type Entry = Omit<Specimen, "id">;

const RECONSTRUCTED: Record<string, { regionIds: string[]; form: SpecimenForm }> = {
  "lilium-martagon": { regionIds: ["caucasus", "georgia", "alps"], form: "herb" },
  "galanthus-woronowii": { regionIds: ["caucasus", "georgia"], form: "herb" },
  "papaver-rhoeas": { regionIds: ["caucasus", "georgia", "mediterranean"], form: "herb" },
  "gentiana-verna": { regionIds: ["caucasus", "georgia", "alps"], form: "herb" },
  "crocus-speciosus": { regionIds: ["caucasus", "georgia"], form: "herb" },
  "fritillaria-meleagris": { regionIds: ["alps", "mediterranean"], form: "herb" },
  "dionaea-muscipula": { regionIds: ["amazon-basin"], form: "carnivorous" },
  "astromirabilis-grandiflora": { regionIds: ["caucasus"], form: "herb" },
};

/** interactive records, derived from the 3D collection */
const FROM_SPECIES: Entry[] = SPECIES.map((s) => {
  const meta = RECONSTRUCTED[s.slug] ?? { regionIds: ["caucasus"], form: "herb" as SpecimenForm };
  return {
    hebraId: s.record.hebra,
    scientificName: s.name,
    commonName: s.common,
    family: s.record.family,
    genus: s.record.genus,
    regionIds: meta.regionIds,
    form: meta.form,
    status: "3d" as SpecimenStatus,
    speciesSlug: s.slug,
  };
});

export const SPECIMENS: Specimen[] = FROM_SPECIES.map((s, i) => ({
  ...s,
  id: `${s.hebraId.replace(/\D/g, "")}-${i}`,
}));

export const FORMS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tree", label: "Tree" },
  { id: "shrub", label: "Shrub" },
  { id: "herb", label: "Herb" },
  { id: "vine", label: "Vine" },
  { id: "fern", label: "Fern" },
  { id: "carnivorous", label: "Carnivorous" },
  { id: "aquatic", label: "Aquatic" },
];

export const STATUSES: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "3d", label: "3D" },
  { id: "photographic", label: "Photographic" },
  { id: "processing", label: "Processing" },
];

export function specimensInRegion(regionId: string) {
  return SPECIMENS.filter((s) => s.regionIds.includes(regionId));
}

export function familiesInRegion(regionId: string) {
  return Array.from(new Set(specimensInRegion(regionId).map((s) => s.family))).sort();
}

export function filterSpecimens(
  list: Specimen[],
  opts: { q?: string; form?: string; family?: string; status?: string },
) {
  const q = (opts.q ?? "").trim().toLowerCase();
  return list.filter((s) => {
    if (opts.form && opts.form !== "all" && s.form !== opts.form) return false;
    if (opts.family && opts.family !== "all" && s.family !== opts.family) return false;
    if (opts.status && opts.status !== "all" && s.status !== opts.status) return false;
    if (!q) return true;
    return [s.scientificName, s.commonName ?? "", s.family, s.genus, s.hebraId]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

/** loose region search: name, description and type all match */
export function searchRegions(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return REGIONS;
  return REGIONS.filter((r) =>
    `${r.name} ${r.description ?? ""} ${r.type}`.toLowerCase().includes(q),
  );
}
