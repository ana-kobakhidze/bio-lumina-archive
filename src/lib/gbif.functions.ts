import { createServerFn } from "@tanstack/react-start";

/**
 * Real plant data from GBIF, whose backbone carries Kew's World Checklist of
 * Vascular Plants (the data behind Plants of the World Online).
 */
const API = "https://api.gbif.org/v1";
const PLANTAE = 6;

export interface PlantSummary {
  key: number;
  name: string;
  author: string;
  family: string;
  genus: string;
  status: string;
}

export interface PlantDetail extends PlantSummary {
  rank: string;
  order: string;
  acceptedKey: number | null;
  accepted: string | null;
  published: string;
  synonyms: { key: number; name: string; author: string }[];
  common: string[];
  native: string[];
  introduced: string[];
  images: { url: string; credit: string }[];
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API}${path}`, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch (e) {
    console.error("GBIF request failed", path, e);
    return null;
  }
}

interface RawTaxon {
  key: number;
  canonicalName?: string;
  scientificName?: string;
  authorship?: string;
  family?: string;
  genus?: string;
  order?: string;
  rank?: string;
  taxonomicStatus?: string;
  acceptedKey?: number;
  accepted?: string;
  publishedIn?: string;
  kingdomKey?: number;
  status?: string;
}

const summary = (t: RawTaxon): PlantSummary => ({
  key: t.key,
  name: t.canonicalName ?? t.scientificName ?? "Unnamed",
  author: (t.authorship ?? "").trim(),
  family: t.family ?? "",
  genus: t.genus ?? "",
  status: (t.taxonomicStatus ?? "").toLowerCase().replace(/_/g, " "),
});

export const searchPlants = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    if (data.q.trim().length < 2) return [] as PlantSummary[];
    const r = await get<RawTaxon[]>(
      `/species/suggest?q=${encodeURIComponent(data.q)}&limit=20`,
    );
    return (r ?? [])
      .filter((t) => t.kingdomKey === PLANTAE && (t.status ?? "ACCEPTED") === "ACCEPTED")
      .slice(0, 8)
      .map(summary);
  });

export const regionPlants = createServerFn({ method: "GET" })
  .inputValidator((d: { countries: string[]; page: number }) => ({
    countries: (d.countries ?? []).filter((c) => /^[A-Z]{2}$/.test(c)).slice(0, 8),
    page: Math.max(0, Math.min(40, Math.floor(Number(d.page) || 0))),
  }))
  .handler(async ({ data }) => {
    const per = 24;
    const cs = data.countries.map((c) => `country=${c}`).join("&");
    const r = await get<{ count: number; facets: { counts: { name: string; count: number }[] }[] }>(
      `/occurrence/search?${cs}&taxonKey=${PLANTAE}&facet=speciesKey&facetLimit=${per}&facetOffset=${data.page * per}&limit=0`,
    );
    const counts = r?.facets?.[0]?.counts ?? [];
    const taxa = await Promise.all(counts.map((c) => get<RawTaxon>(`/species/${c.name}`)));
    const plants = taxa
      .map((t, i) => (t ? { ...summary(t), records: counts[i]!.count } : null))
      .filter((p): p is PlantSummary & { records: number } => p !== null);
    return { plants, records: r?.count ?? 0, hasMore: counts.length === per, error: r ? null : "The plant database is not responding. Try again shortly." };
  });

export const plantDetail = createServerFn({ method: "GET" })
  .inputValidator((d: { key: number }) => ({ key: Math.floor(Number(d.key)) }))
  .handler(async ({ data }): Promise<PlantDetail | null> => {
    const t = await get<RawTaxon>(`/species/${data.key}`);
    if (!t || t.kingdomKey !== PLANTAE) return null;
    const [syn, vern, dist, occ] = await Promise.all([
      get<{ results: RawTaxon[] }>(`/species/${data.key}/synonyms?limit=40`),
      get<{ results: { vernacularName: string; language?: string }[] }>(`/species/${data.key}/vernacularNames?limit=100`),
      get<{ results: { locationId?: string; locality?: string; establishmentMeans?: string }[] }>(`/species/${data.key}/distributions?limit=300`),
      get<{ results: { media?: { identifier?: string; rightsHolder?: string; creator?: string; license?: string }[] }[] }>(
        `/occurrence/search?taxonKey=${data.key}&mediaType=StillImage&limit=8`,
      ),
    ]);
    const native = new Set<string>();
    const introduced = new Set<string>();
    for (const d of dist?.results ?? []) {
      if (!d.locationId?.startsWith("tdwg:") || !d.locality) continue;
      (d.establishmentMeans?.toUpperCase() === "INTRODUCED" ? introduced : native).add(d.locality);
    }
    const common = Array.from(
      new Set((vern?.results ?? []).filter((v) => !v.language || v.language === "eng").map((v) => v.vernacularName.trim())),
    ).slice(0, 8);
    const images = (occ?.results ?? [])
      .flatMap((o) => o.media ?? [])
      .filter((m) => m.identifier)
      .slice(0, 6)
      .map((m) => ({ url: m.identifier!, credit: m.rightsHolder ?? m.creator ?? "GBIF contributor" }));
    return {
      ...summary(t),
      rank: (t.rank ?? "").toLowerCase(),
      order: t.order ?? "",
      acceptedKey: t.acceptedKey ?? null,
      accepted: t.accepted ?? null,
      published: t.publishedIn ?? "",
      synonyms: (syn?.results ?? []).map((s) => ({ key: s.key, name: s.canonicalName ?? s.scientificName ?? "", author: s.authorship ?? "" })),
      common,
      native: Array.from(native).sort(),
      introduced: Array.from(introduced).sort(),
      images,
    };
  });

export const lookupKey = createServerFn({ method: "GET" })
  .inputValidator((d: { name: string }) => ({ name: String(d.name ?? "").slice(0, 120) }))
  .handler(async ({ data }) => {
    const r = await get<{ usageKey?: number; kingdom?: string }>(`/species/match?name=${encodeURIComponent(data.name)}&kingdom=Plantae`);
    return r?.usageKey ?? null;
  });

export const kewUrl = (name: string) =>
  `https://powo.science.kew.org/results?q=${encodeURIComponent(name)}`;

export const resultsSearch = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; rank: string; page: number }) => ({
    q: String(d.q ?? "").slice(0, 80),
    rank: ["FAMILY", "GENUS", "SPECIES"].includes(d.rank) ? d.rank : "",
    page: Math.max(0, Math.min(50, Math.floor(Number(d.page) || 0))),
  }))
  .handler(async ({ data }) => {
    const per = 20;
    const r = await get<{ count: number; results: RawTaxon[] }>(
      `/species/search?q=${encodeURIComponent(data.q)}&highertaxonKey=${PLANTAE}&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&status=ACCEPTED${data.rank ? `&rank=${data.rank}` : ""}&limit=${per}&offset=${data.page * per}`,
    );
    return {
      total: r?.count ?? 0,
      plants: (r?.results ?? []).map((t) => ({ ...summary(t), rank: (t.rank ?? "").toLowerCase() })),
      hasMore: (r?.results?.length ?? 0) === per,
      error: r ? null : "The plant database is not responding. Try again shortly.",
    };
  });

const FEATURED = ["Basella alba", "Delonix regia", "Digitalis purpurea", "Nymphaea alba", "Quercus robur", "Rosa canina"];

export const featuredPlants = createServerFn({ method: "GET" }).handler(async () => {
  const out = await Promise.all(
    FEATURED.map(async (name) => {
      const m = await get<{ usageKey?: number; family?: string; scientificName?: string }>(`/species/match?name=${encodeURIComponent(name)}&kingdom=Plantae`);
      if (!m?.usageKey) return null;
      const occ = await get<{ results: { media?: { identifier?: string }[] }[] }>(
        `/occurrence/search?taxonKey=${m.usageKey}&mediaType=StillImage&limit=3`,
      );
      const image = (occ?.results ?? []).flatMap((o) => o.media ?? []).find((x) => x.identifier)?.identifier ?? null;
      return { key: m.usageKey, name, full: m.scientificName ?? name, family: m.family ?? "", image };
    }),
  );
  return out.filter((x): x is NonNullable<typeof x> => x !== null);
});
