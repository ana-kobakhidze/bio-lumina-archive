import { createFileRoute, Link } from "@tanstack/react-router";
import { KewHeader } from "@/components/kew/KewHeader";
import { PlantSearch } from "@/components/kew/PlantSearch";
import { REGIONS } from "@/lib/archive";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HEBRA — The living digital herbarium" },
      {
        name: "description",
        content:
          "HEBRA is a global digital herbarium. Choose a region — Caucasus, Mediterranean, Amazon Basin, Japan or the Alps — and enter its flora archive of interactive specimens.",
      },
      { property: "og:title", content: "HEBRA — The living digital herbarium" },
      {
        property: "og:description",
        content:
          "Choose a region and enter a flora archive of interactive, reconstructed plant specimens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <h1 className="text-3xl font-semibold md:text-4xl">Plants of the World</h1>
        <p className="mt-3 max-w-xl opacity-75">
          Search the world's accepted plant names, their distribution, synonyms and photographs.
        </p>
        <div className="mt-8">
          <PlantSearch />
        </div>

        <h2 className="mt-14 border-b kew-rule pb-2 text-lg font-semibold">Browse by region</h2>
        <ul className="mt-2 divide-y kew-rule">
          {REGIONS.map((r) => (
            <li key={r.id}>
              <Link
                to="/archive/$regionId"
                params={{ regionId: r.id }}
                search={{ q: "", page: 0 }}
                className="flex items-baseline justify-between gap-4 py-3 hover:text-[color:var(--kew-green)]"
              >
                <span className="font-semibold">{r.name}</span>
                <span className="text-sm opacity-60">{r.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex gap-6 text-sm">
          <Link to="/viewer" className="underline">3D specimen viewer</Link>
          <Link to="/contribute" className="underline">Contribute a specimen</Link>
        </div>
        <p className="mt-10 text-xs opacity-55">
          Names and distributions from the World Checklist of Vascular Plants via GBIF.
        </p>
      </main>
    </div>
  );
}
