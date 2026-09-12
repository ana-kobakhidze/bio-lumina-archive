import { createFileRoute, Link } from "@tanstack/react-router";
import { RegionSearch } from "@/components/hebra/RegionSearch";
import { ThemeSwitch } from "@/components/hebra/ThemeProvider";
import { REGIONS } from "@/lib/archive";

const SUGGESTED = ["caucasus", "mediterranean", "amazon-basin", "japan", "alps"];

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
  const suggested = SUGGESTED.map((id) => REGIONS.find((r) => r.id === id)!).filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-start justify-between px-6 pt-6 md:px-10 md:pt-8">
        <div>
          <p className="text-xl font-medium leading-none tracking-[0.34em]">HEBRA</p>
          <p className="label-micro mt-2">The living digital herbarium</p>
        </div>
        <ThemeSwitch className="justify-end" />
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-xl py-24">
          <p className="label-micro mb-3 text-center tracking-[0.22em]">
            Where would you like to explore?
          </p>

          <RegionSearch autoFocus />

          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {suggested.map((r) => (
              <li key={r.id}>
                <Link
                  to="/archive/$regionId"
                  params={{ regionId: r.id }}
                  search={{ q: "", form: "all", family: "all", status: "all" }}
                  className="label-micro opacity-40 transition-opacity hover:opacity-100"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="flex items-center justify-between px-6 pb-6 md:px-10 md:pb-8">
        <Link to="/contribute" className="label-micro opacity-60 hover:opacity-100">
          + Contribute a specimen
        </Link>
        <Link to="/identity" className="label-micro opacity-35 hover:opacity-100">
          Identity
        </Link>
      </footer>
    </div>
  );
}
