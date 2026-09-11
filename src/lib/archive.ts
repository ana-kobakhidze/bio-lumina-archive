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
    name: "Caucasus",
    type: "botanical-region",
    description: "Georgia · Armenia · Azerbaijan · Southern Russia",
    speciesCount: 1284,
    familyCount: 143,
  },
  {
    id: "georgia",
    name: "Georgia",
    type: "country",
    description: "Caucasus",
    speciesCount: 812,
    familyCount: 118,
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    type: "botanical-region",
    description: "Southern Europe · North Africa · Western Asia",
    speciesCount: 2461,
    familyCount: 187,
  },
  {
    id: "alps",
    name: "Alps",
    type: "natural-region",
    description: "Central European high range",
    speciesCount: 934,
    familyCount: 96,
  },
  {
    id: "japan",
    name: "Japan",
    type: "country",
    description: "East Asian archipelago",
    speciesCount: 1573,
    familyCount: 161,
  },
  {
    id: "amazon-basin",
    name: "Amazon Basin",
    type: "ecosystem",
    description: "Lowland humid tropical forest",
    speciesCount: 3877,
    familyCount: 214,
  },
  {
    id: "south-africa",
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

function e(
  hebraId: string,
  scientificName: string,
  commonName: string,
  family: string,
  regionIds: string[],
  form: SpecimenForm,
  status: SpecimenStatus,
): Entry {
  return {
    hebraId,
    scientificName,
    commonName,
    family,
    genus: scientificName.split(" ")[0]!,
    regionIds,
    form,
    status,
  };
}

const CATALOGUE: Entry[] = [
  // Caucasus / Georgia
  e("HEBRA / 000142", "Rhododendron caucasicum", "Caucasian rhododendron", "Ericaceae", ["caucasus", "georgia"], "shrub", "photographic"),
  e("HEBRA / 000151", "Betula litwinowii", "Litwinow's birch", "Betulaceae", ["caucasus", "georgia"], "tree", "photographic"),
  e("HEBRA / 000160", "Campanula mirabilis", "Wondrous bellflower", "Campanulaceae", ["caucasus", "georgia"], "herb", "processing"),
  e("HEBRA / 000168", "Primula juliae", "Julia's primrose", "Primulaceae", ["caucasus", "georgia"], "herb", "photographic"),
  e("HEBRA / 000174", "Quercus imeretina", "Imeretian oak", "Fagaceae", ["caucasus", "georgia"], "tree", "photographic"),
  e("HEBRA / 000181", "Vitis vinifera subsp. sylvestris", "Wild grapevine", "Vitaceae", ["caucasus", "georgia"], "vine", "photographic"),
  e("HEBRA / 000190", "Dryopteris caucasica", "Caucasian buckler fern", "Dryopteridaceae", ["caucasus", "georgia"], "fern", "processing"),
  e("HEBRA / 000198", "Pinguicula caucasica", "Caucasian butterwort", "Lentibulariaceae", ["caucasus"], "carnivorous", "photographic"),
  e("HEBRA / 000203", "Nymphaea alba", "White water lily", "Nymphaeaceae", ["caucasus", "georgia", "mediterranean"], "aquatic", "photographic"),
  e("HEBRA / 000211", "Paeonia caucasica", "Caucasian peony", "Paeoniaceae", ["caucasus", "georgia"], "herb", "processing"),
  e("HEBRA / 000219", "Rhamnus imeretina", "Imeretian buckthorn", "Rhamnaceae", ["caucasus", "georgia"], "shrub", "photographic"),

  // Mediterranean
  e("HEBRA / 000240", "Olea europaea", "Olive", "Oleaceae", ["mediterranean"], "tree", "photographic"),
  e("HEBRA / 000247", "Cistus creticus", "Rock rose", "Cistaceae", ["mediterranean"], "shrub", "photographic"),
  e("HEBRA / 000253", "Ophrys apifera", "Bee orchid", "Orchidaceae", ["mediterranean"], "herb", "processing"),
  e("HEBRA / 000261", "Quercus ilex", "Holm oak", "Fagaceae", ["mediterranean"], "tree", "photographic"),
  e("HEBRA / 000266", "Drosophyllum lusitanicum", "Portuguese sundew", "Drosophyllaceae", ["mediterranean"], "carnivorous", "processing"),
  e("HEBRA / 000272", "Smilax aspera", "Rough bindweed", "Smilacaceae", ["mediterranean"], "vine", "photographic"),
  e("HEBRA / 000279", "Asplenium ceterach", "Rustyback fern", "Aspleniaceae", ["mediterranean"], "fern", "photographic"),
  e("HEBRA / 000284", "Lavandula stoechas", "French lavender", "Lamiaceae", ["mediterranean"], "shrub", "photographic"),

  // Alps
  e("HEBRA / 000301", "Leontopodium alpinum", "Edelweiss", "Asteraceae", ["alps"], "herb", "photographic"),
  e("HEBRA / 000308", "Pinus cembra", "Swiss stone pine", "Pinaceae", ["alps"], "tree", "photographic"),
  e("HEBRA / 000314", "Rhododendron ferrugineum", "Alpenrose", "Ericaceae", ["alps"], "shrub", "processing"),
  e("HEBRA / 000320", "Pinguicula alpina", "Alpine butterwort", "Lentibulariaceae", ["alps"], "carnivorous", "photographic"),

  // Japan
  e("HEBRA / 000340", "Prunus serrulata", "Japanese cherry", "Rosaceae", ["japan"], "tree", "photographic"),
  e("HEBRA / 000346", "Acer palmatum", "Japanese maple", "Sapindaceae", ["japan"], "tree", "photographic"),
  e("HEBRA / 000352", "Camellia japonica", "Camellia", "Theaceae", ["japan"], "shrub", "photographic"),
  e("HEBRA / 000359", "Wisteria floribunda", "Japanese wisteria", "Fabaceae", ["japan"], "vine", "processing"),
  e("HEBRA / 000364", "Osmunda japonica", "Asian royal fern", "Osmundaceae", ["japan"], "fern", "photographic"),
  e("HEBRA / 000371", "Nelumbo nucifera", "Sacred lotus", "Nelumbonaceae", ["japan"], "aquatic", "photographic"),
  e("HEBRA / 000377", "Drosera rotundifolia", "Round-leaved sundew", "Droseraceae", ["japan"], "carnivorous", "processing"),
  e("HEBRA / 000383", "Iris ensata", "Japanese water iris", "Iridaceae", ["japan"], "herb", "photographic"),
  e("HEBRA / 000389", "Cryptomeria japonica", "Sugi", "Cupressaceae", ["japan"], "tree", "photographic"),

  // Amazon Basin
  e("HEBRA / 000410", "Victoria amazonica", "Giant water lily", "Nymphaeaceae", ["amazon-basin"], "aquatic", "photographic"),
  e("HEBRA / 000417", "Bertholletia excelsa", "Brazil nut tree", "Lecythidaceae", ["amazon-basin"], "tree", "photographic"),
  e("HEBRA / 000423", "Heliconia rostrata", "Hanging lobster claw", "Heliconiaceae", ["amazon-basin"], "herb", "processing"),
  e("HEBRA / 000431", "Cattleya violacea", "Amazon cattleya", "Orchidaceae", ["amazon-basin"], "herb", "photographic"),
  e("HEBRA / 000438", "Utricularia foliosa", "Leafy bladderwort", "Lentibulariaceae", ["amazon-basin"], "carnivorous", "photographic"),
  e("HEBRA / 000444", "Bauhinia guianensis", "Monkey ladder vine", "Fabaceae", ["amazon-basin"], "vine", "processing"),
  e("HEBRA / 000450", "Ceiba pentandra", "Kapok", "Malvaceae", ["amazon-basin"], "tree", "photographic"),
  e("HEBRA / 000456", "Adiantum latifolium", "Broadleaf maidenhair", "Pteridaceae", ["amazon-basin"], "fern", "photographic"),

  // South Africa
  e("HEBRA / 000470", "Protea cynaroides", "King protea", "Proteaceae", ["south-africa"], "shrub", "photographic"),
  e("HEBRA / 000476", "Strelitzia reginae", "Bird of paradise", "Strelitziaceae", ["south-africa"], "herb", "photographic"),
  e("HEBRA / 000482", "Roridula gorgonias", "Gorgon's dewstick", "Roridulaceae", ["south-africa"], "carnivorous", "processing"),
  e("HEBRA / 000488", "Erica cerinthoides", "Fire heath", "Ericaceae", ["south-africa"], "shrub", "photographic"),
];

export const SPECIMENS: Specimen[] = [...FROM_SPECIES, ...CATALOGUE].map((s, i) => ({
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
