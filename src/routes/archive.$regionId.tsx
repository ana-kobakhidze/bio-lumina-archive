import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArchiveCard } from "@/components/hebra/ArchiveCard";
import { RegionSearch } from "@/components/hebra/RegionSearch";
import { ThemeSwitch } from "@/components/hebra/ThemeProvider";
import {
  familiesInRegion,
  filterSpecimens,
  FORMS,
  regionById,
  specimensInRegion,
  STATUSES,
} from "@/lib/archive";

interface ArchiveSearch {
  q: string;
  form: string;
  family: string;
  status: string;
}

export const Route = createFileRoute("/archive/$regionId")({
  validateSearch: (search: Record<string, unknown>): ArchiveSearch => {
    const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
    return {
      q: str(search["q"], ""),
      form: str(search["form"], "all"),
      family: str(search["family"], "all"),
      status: str(search["status"], "all"),
    };
  },
  loader: ({ params }) => {
    if (!regionById(params.regionId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const region = regionById(params.regionId);
    const title = region ? `${region.name} flora archive — HEBRA` : "Regional archive — HEBRA";
    const description = region
      ? `Browse the HEBRA flora archive of the ${region.name}: ${region.speciesCount} species across ${region.familyCount} families, reconstructed as interactive specimens.`
      : "Browse a regional flora archive in the HEBRA digital herbarium.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <p className="label-micro">No such region</p>
      <Link to="/" className="font-display text-2xl italic underline">
        Choose another region
      </Link>
    </div>
  ),
  component: RegionalArchive,
});

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`label-micro border px-3 py-1.5 transition-colors ${
        active
          ? "border-specimen/70 bg-specimen/10 opacity-100"
          : "border-specimen/20 opacity-55 hover:opacity-100"
      }`}
    >
      {label}
    </button>
  );
}

function RegionalArchive() {
  const { regionId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [switching, setSwitching] = useState(false);

  const region = regionById(regionId)!;
  const all = specimensInRegion(regionId);
  const families = familiesInRegion(regionId);
  const results = filterSpecimens(all, search);

  const set = (patch: Partial<ArchiveSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-specimen/20 px-6 py-5 md:px-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link to="/" className="label-micro">
              HEBRA
            </Link>
            <div className="mt-2 flex items-baseline gap-3">
              <button
                onClick={() => setSwitching((s) => !s)}
                aria-expanded={switching}
                className="text-2xl font-medium uppercase leading-none tracking-[0.28em] md:text-3xl"
              >
                {region.name} <span className="text-base opacity-60">⌄</span>
              </button>
            </div>
            <p className="label-micro mt-2">
              Flora archive · {region.speciesCount.toLocaleString()} species ·{" "}
              {region.familyCount} families
            </p>
          </div>
          <div className="hidden md:block">
            <ThemeSwitch className="justify-end" />
            <Link to="/contribute" className="label-micro mt-3 block text-right opacity-60 hover:opacity-100">
              + Contribute a specimen
            </Link>
          </div>
        </div>

        {switching && (
          <div className="mt-6 max-w-xl">
            <p className="label-micro mb-2">Switch region</p>
            <RegionSearch onSelected={() => setSwitching(false)} />
          </div>
        )}
      </header>

      <main className="px-6 py-8 md:px-10">
        <input
          value={search.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder={`Search within ${region.name}...`}
          aria-label={`Search within ${region.name}`}
          className="w-full max-w-xl border-b border-specimen/30 bg-transparent pb-2 font-display text-xl italic outline-none placeholder:font-sans placeholder:text-[12px] placeholder:uppercase placeholder:not-italic placeholder:tracking-[0.2em] placeholder:text-foreground/40 focus:border-specimen"
        />

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-micro w-16 opacity-50">Form</span>
            {FORMS.map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                active={search.form === f.id}
                onClick={() => set({ form: f.id })}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="label-micro w-16 opacity-50">Status</span>
            {STATUSES.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                active={search.status === s.id}
                onClick={() => set({ status: s.id })}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="label-micro w-16 opacity-50">Family</span>
            <select
              value={search.family}
              onChange={(e) => set({ family: e.target.value })}
              aria-label="Filter by family"
              className="label-micro border border-specimen/20 bg-transparent px-3 py-1.5 outline-none"
            >
              <option value="all">All families</option>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="label-micro mt-8 border-b border-specimen/20 pb-2">
          {results.length} specimens found
        </p>

        {results.length === 0 ? (
          <p className="mt-10 font-display text-2xl italic opacity-60">
            No specimen in this region matches that record.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((s) => (
              <ArchiveCard key={s.id} specimen={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
