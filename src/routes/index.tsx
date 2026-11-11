import { createFileRoute, Link } from "@tanstack/react-router";
import { KewHeader } from "@/components/kew/KewHeader";
import { PlantSearch } from "@/components/kew/PlantSearch";
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

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Palm house with tropical palms and ferns"
          width={1920}
          height={912}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 kew-hero-shade" />
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-32">
          <h1 className="max-w-2xl text-4xl font-semibold text-[color:var(--kew-green-foreground)] md:text-6xl">
            Plants of the World
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[color:var(--kew-green-foreground)] opacity-90">
            Search the world's accepted plant names, their distribution, synonyms and photographs.
          </p>
          <div className="mt-8 max-w-2xl rounded-lg bg-background p-2 shadow-2xl">
            <PlantSearch />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Browse by region</h2>
          <span className="text-sm opacity-60">{REGIONS.length} regional floras</span>
        </div>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <li key={r.id} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
              <Link
                to="/archive/$regionId"
                params={{ regionId: r.id }}
                search={{ q: "", page: 0 }}
                className="group relative block h-64 overflow-hidden rounded-lg"
              >
                <img
                  src={REGION_IMAGES[r.id]}
                  alt={`${r.name} landscape`}
                  loading="lazy"
                  width={944}
                  height={704}
                  className="hebra-transition h-full w-full object-cover group-hover:scale-105"
                />
                <div className="absolute inset-0 kew-card-shade" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[color:var(--kew-green-foreground)]">
                  <h3 className="text-xl font-semibold">{r.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm opacity-85">{r.description}</p>
                  <span className="hebra-transition mt-2 inline-block text-sm font-semibold opacity-0 group-hover:opacity-100">
                    Explore flora →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Link to="/viewer" className="kew-bar group rounded-lg p-8">
            <h3 className="text-xl font-semibold">3D specimen viewer</h3>
            <p className="mt-2 opacity-85">Rotate and dissect reconstructed plants up close.</p>
            <span className="mt-4 inline-block font-semibold">Open viewer →</span>
          </Link>
          <Link to="/contribute" className="group rounded-lg border kew-rule p-8 hover:bg-muted">
            <h3 className="text-xl font-semibold">Contribute a specimen</h3>
            <p className="mt-2 opacity-75">Share photographs or scans to grow the archive.</p>
            <span className="mt-4 inline-block font-semibold text-[color:var(--kew-green)]">Get started →</span>
          </Link>
        </div>
        <p className="mt-10 text-xs opacity-55">
          Names and distributions from the World Checklist of Vascular Plants via GBIF.
        </p>
      </main>
    </div>
  );
}
