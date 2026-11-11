import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KewHeader } from "@/components/kew/KewHeader";
import { PlantSearch } from "@/components/kew/PlantSearch";
import { resultsSearch } from "@/lib/gbif.functions";

interface Search { q: string; rank: string; page: number }

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" ? s["q"] : "",
    rank: typeof s["rank"] === "string" ? s["rank"] : "",
    page: Number(s["page"]) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Search results — HEBRA Plants of the World" },
      { name: "description", content: "Accepted plant names matching your search, with family, genus and species filters." },
      { property: "og:title", content: "Search results — HEBRA Plants of the World" },
      { property: "og:description", content: "Browse accepted plant names from the world checklist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Results,
});

const RANKS = [
  { id: "", label: "All results" },
  { id: "FAMILY", label: "Families" },
  { id: "GENUS", label: "Genera" },
  { id: "SPECIES", label: "Species" },
];

function Results() {
  const s = Route.useSearch();
  const { data, isFetching } = useQuery({
    queryKey: ["results", s.q, s.rank, s.page],
    queryFn: () => resultsSearch({ data: s }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <div className="border-b kew-rule bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <PlantSearch key={s.q} initial={s.q} />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[14rem_1fr]">
        <aside>
          <h2 className="text-sm font-medium uppercase tracking-wide opacity-60">Filter</h2>
          <ul className="mt-3 border-t kew-rule">
            {RANKS.map((r) => (
              <li key={r.id} className="border-b kew-rule">
                <Link
                  to="/results"
                  search={{ ...s, rank: r.id, page: 0 }}
                  className={`block px-3 py-2.5 text-sm ${s.rank === r.id ? "kew-bar" : "hover:bg-muted"}`}
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs opacity-55">Accepted names only.</p>
        </aside>
        <main>
          <p className="text-sm opacity-70">
            {data ? `${data.total.toLocaleString()} results` : "Loading…"}
            {s.q && <> for “{s.q}”</>}
            {isFetching && data && " · updating"}
          </p>
          {data?.error && <p className="mt-4 text-destructive">{data.error}</p>}
          <ul className={`mt-4 border-t kew-rule ${isFetching ? "opacity-60" : ""}`}>
            {data?.plants.map((p) => (
              <li key={p.key} className="border-b kew-rule">
                <Link to="/plant/$key" params={{ key: String(p.key) }} className="flex items-baseline justify-between gap-4 px-2 py-4 hover:bg-muted">
                  <span>
                    <span className="text-lg text-[color:var(--kew-green)]">
                      {p.rank === "family" ? p.name : <i>{p.name}</i>}
                    </span>{" "}
                    <span className="text-sm opacity-60">{p.author}</span>
                    <span className="mt-0.5 block text-sm opacity-70">{p.family}</span>
                  </span>
                  <span className="shrink-0 text-xs uppercase tracking-wide opacity-55">{p.rank}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3 text-sm">
            {s.page > 0 && <Link to="/results" search={{ ...s, page: s.page - 1 }} className="border kew-rule px-4 py-2 hover:bg-muted">← Previous</Link>}
            {data?.hasMore && <Link to="/results" search={{ ...s, page: s.page + 1 }} className="border kew-rule px-4 py-2 hover:bg-muted">Next →</Link>}
          </div>
        </main>
      </div>
    </div>
  );
}
