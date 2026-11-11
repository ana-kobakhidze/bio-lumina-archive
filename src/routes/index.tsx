import { createFileRoute, Link } from "@tanstack/react-router";
import { KewHeader } from "@/components/kew/KewHeader";
import { PlantSearch } from "@/components/kew/PlantSearch";
import { useQuery } from "@tanstack/react-query";
import { featuredPlants } from "@/lib/gbif.functions";
import { REGIONS } from "@/lib/archive";
import { REGION_IMAGES } from "@/lib/region-images";
import heroImg from "@/assets/hero-glasshouse.jpg";

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

function Featured() {
  const { data = [], isLoading } = useQuery({ queryKey: ["featured"], queryFn: () => featuredPlants(), staleTime: 3600_000 });
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-light">Featured plants</h2>
        <Link to="/results" search={{ q: "", rank: "", page: 0 }} className="text-sm hover:text-[color:var(--kew-green)]">View all plants</Link>
      </div>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <li key={i} className="h-80 animate-pulse bg-muted" />)}
        {data.map((p) => (
          <li key={p.key}>
            <Link to="/plant/$key" params={{ key: String(p.key) }} className="group block border kew-rule hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {p.image && <img src={p.image} alt={p.name} loading="lazy" className="hebra-transition h-full w-full object-cover group-hover:scale-105" />}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium uppercase tracking-widest opacity-55">Species</span>
                <h3 className="mt-1 text-lg text-[color:var(--kew-green)]"><i>{p.name}</i></h3>
                <p className="mt-1 text-sm opacity-70">{p.full} · {p.family}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        <img src={heroImg} alt="Palm house with tropical palms and ferns" width={1920} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 kew-hero-dark" />
        <div className="w-full max-w-3xl px-5 text-center text-[color:var(--kew-green-foreground)]">
          <h1 className="text-4xl font-light md:text-6xl">Welcome to Plants of the World Online</h1>
          <p className="mt-4 text-lg font-light opacity-90">
            Browse the world's accepted plant names, distributions, synonyms and photographs
          </p>
          <div className="mt-8"><PlantSearch /></div>
        </div>
        <p className="absolute bottom-6 right-6 text-right text-sm text-[color:var(--kew-green-foreground)] opacity-85">
          Featured: <i>Victoria amazonica</i><br />HEBRA palm house
        </p>
      </section>

      <Featured />

      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-light">Browse by region</h2>
          <span className="text-sm opacity-60">{REGIONS.length} regional floras</span>
        </div>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <li key={r.id}>
              <Link to="/archive/$regionId" params={{ regionId: r.id }} search={{ q: "", page: 0 }} className="group relative block h-56 overflow-hidden">
                <img src={REGION_IMAGES[r.id]} alt={`${r.name} landscape`} loading="lazy" width={944} height={704} className="hebra-transition h-full w-full object-cover group-hover:scale-105" />
                <div className="absolute inset-0 kew-card-shade" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[color:var(--kew-green-foreground)]">
                  <h3 className="text-xl">{r.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm opacity-85">{r.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="kew-bar">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm md:grid-cols-3">
          <div><p className="text-lg tracking-[0.15em]">HEBRA</p><p className="mt-2 opacity-80">The living digital herbarium.</p></div>
          <ul className="space-y-1.5 opacity-90">
            <li><Link to="/results" search={{ q: "", rank: "", page: 0 }}>Search plants</Link></li>
            <li><Link to="/viewer">3D specimen viewer</Link></li>
          </ul>
          <p className="opacity-75">Names and distributions from the World Checklist of Vascular Plants via GBIF.</p>
        </div>
      </footer>
    </div>
  );
}
