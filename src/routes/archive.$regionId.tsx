import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArchiveCard } from "@/components/hebra/ArchiveCard";
import { KewHeader } from "@/components/kew/KewHeader";
import { regionById, REGIONS, specimensInRegion } from "@/lib/archive";
import { regionPlants } from "@/lib/gbif.functions";

interface ArchiveSearch {
  q: string;
  page: number;
}

const regionQuery = (countries: string[], page: number) =>
  queryOptions({
    queryKey: ["region-plants", countries.join(","), page],
    queryFn: () => regionPlants({ data: { countries, page } }),
    staleTime: 10 * 60_000,
  });

export const Route = createFileRoute("/archive/$regionId")({
  validateSearch: (search: Record<string, unknown>): ArchiveSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    page: Math.max(0, Math.floor(Number(search["page"]) || 0)),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ params, deps, context }) => {
    const region = regionById(params.regionId);
    if (!region) throw notFound();
    return context.queryClient.ensureQueryData(regionQuery(region.countries, deps.page));
  },
  head: ({ params }) => {
    const region = regionById(params.regionId);
    const title = region ? `${region.name} plants — HEBRA` : "Regional plants — HEBRA";
    const description = region
      ? `Real plant species recorded in ${region.name}, with names, families and records from the world checklist.`
      : "Browse real plants recorded in a region.";
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
  errorComponent: ArchiveError,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <p className="mx-auto max-w-6xl px-5 py-16">
        No such region. <Link to="/" className="underline">Choose another region</Link>
      </p>
    </div>
  ),
  component: RegionalArchive,
});

function ArchiveError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p>Plant records could not load: {error.message}</p>
        <button onClick={() => router.invalidate()} className="mt-4 underline">Try again</button>
      </div>
    </div>
  );
}

function RegionalArchive() {
  const { regionId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const region = regionById(regionId)!;
  const { data } = useSuspenseQuery(regionQuery(region.countries, search.page));
  const reconstructed = specimensInRegion(regionId);
  const q = search.q.trim().toLowerCase();
  const plants = data.plants.filter(
    (p) => !q || `${p.name} ${p.family} ${p.genus}`.toLowerCase().includes(q),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <nav className="text-sm opacity-70">
          <Link to="/" className="underline">Home</Link> › {region.name}
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{region.name}</h1>
            <p className="mt-1 opacity-70">
              {region.description} · {data.records.toLocaleString()} plant records
            </p>
          </div>
          <select
            value={regionId}
            onChange={(e) => navigate({ to: "/archive/$regionId", params: { regionId: e.target.value }, search: { q: "", page: 0 } })}
            aria-label="Switch region"
            className="rounded-sm border border-foreground/30 bg-background px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {reconstructed.length > 0 && (
          <section className="mt-8">
            <h2 className="border-b kew-rule pb-2 text-lg font-semibold">3D reconstructed specimens</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reconstructed.map((s) => (
                <ArchiveCard key={s.id} specimen={s} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b kew-rule pb-2">
            <h2 className="text-lg font-semibold">Most recorded species</h2>
            <input
              value={search.q}
              onChange={(e) => navigate({ to: ".", search: (p) => ({ ...p, q: e.target.value }), replace: true })}
              placeholder="Filter this page…"
              aria-label="Filter species"
              className="rounded-sm border border-foreground/30 bg-background px-3 py-1.5 text-sm outline-none"
            />
          </div>
          {data.error && <p className="mt-6 opacity-70">{data.error}</p>}
          <table className="mt-2 w-full text-left text-sm">
            <thead className="opacity-60">
              <tr>
                <th className="py-2 font-normal">Name</th>
                <th className="hidden py-2 font-normal sm:table-cell">Family</th>
                <th className="py-2 text-right font-normal">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y kew-rule">
              {plants.map((p) => (
                <tr key={p.key}>
                  <td className="py-2.5">
                    <Link to="/plant/$key" params={{ key: String(p.key) }} className="hover:underline">
                      <i className="text-base">{p.name}</i> <span className="opacity-60">{p.author}</span>
                    </Link>
                  </td>
                  <td className="hidden py-2.5 opacity-75 sm:table-cell">{p.family}</td>
                  <td className="py-2.5 text-right tabular-nums opacity-75">{p.records.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              disabled={search.page === 0}
              onClick={() => navigate({ to: ".", search: (p) => ({ ...p, page: p.page - 1 }) })}
              className="underline disabled:opacity-30 disabled:no-underline"
            >
              ← Previous
            </button>
            <span className="opacity-60">Page {search.page + 1}</span>
            <button
              disabled={!data.hasMore}
              onClick={() => navigate({ to: ".", search: (p) => ({ ...p, page: p.page + 1 }) })}
              className="underline disabled:opacity-30 disabled:no-underline"
            >
              Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
