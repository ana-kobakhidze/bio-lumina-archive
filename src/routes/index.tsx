import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SpecimenCard } from "@/components/hebra/SpecimenCard";
import { SpecimenStage } from "@/components/specimen/SpecimenStage";
import { recordRows, SPECIES, type PartId, type SpeciesId } from "@/lib/botany";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "HEBRA — The living digital herbarium" },
      {
        name: "description",
        content:
          "HEBRA reconstructs plants as interactive translucent specimens. Rotate, dissect and compare Lilium martagon, Galanthus woronowii, Papaver rhoeas and Dionaea muscipula.",
      },
      { property: "og:title", content: "HEBRA — The living digital herbarium" },
      {
        property: "og:description",
        content:
          "Flora, reconstructed. A digital herbarium of interactive 3D specimens with full scientific records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpecimenPage,
});

function SpecimenPage() {
  const [speciesId, setSpeciesId] = useState<SpeciesId>("astromirabilis");
  const [active, setActive] = useState<PartId>("whole");

  const species = SPECIES.find((s) => s.id === speciesId)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-start justify-between px-6 pt-6 md:px-10 md:pt-8">
        <div>
          <p className="label-micro">DIGITAL HERBARIUM</p>
          <h1 className="mt-1 text-3xl font-medium leading-none tracking-[0.34em] md:text-4xl">
            HEBRA
          </h1>
          <p className="label-micro mt-2">ჰებრა · The living digital herbarium</p>
        </div>
        <div className="hidden text-right md:block">
          <p className="label-micro">
            {SPECIES.length} specimens · est. Georgia
            <br />
            Global collection
          </p>
          <Link to="/identity" className="label-micro mt-2 inline-block underline opacity-70 hover:opacity-100">
            Identity board
          </Link>
        </div>
      </header>

      <main className="px-6 pb-16 md:px-10">
        <section className="grid gap-6 pt-6 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-10">
          <SpecimenStage
            species={species}
            active={active}
            className="min-h-[62vh] md:min-h-[76vh]"
          />

          <aside className="flex flex-col gap-8">
            <nav aria-label="Collection">
              <p className="label-micro mb-2">Collection</p>
              <ul className="border-t border-specimen/25">
                {SPECIES.map((sp) => (
                  <li key={sp.id}>
                    <button
                      onClick={() => {
                        setSpeciesId(sp.id);
                        setActive("whole");
                      }}
                      aria-current={sp.id === speciesId}
                      className={`flex w-full items-baseline justify-between gap-3 border-b border-specimen/25 py-2 text-left transition-opacity ${
                        sp.id === speciesId ? "opacity-100" : "opacity-55 hover:opacity-85"
                      }`}
                    >
                      <span className="font-display text-base italic leading-tight">{sp.name}</span>
                      <span className="label-micro shrink-0">{sp.common}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Botanical parts">
              <p className="label-micro mb-2">Structure</p>
              <ul className="border-t border-specimen/25">
                {species.parts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setActive(p.id)}
                      aria-current={active === p.id}
                      className={`flex w-full items-baseline justify-between border-b border-specimen/25 py-2 text-left text-sm transition-opacity ${
                        active === p.id ? "opacity-100" : "opacity-55 hover:opacity-85"
                      }`}
                    >
                      <span className={active === p.id ? "italic" : ""}>{p.label}</span>
                      <span className="label-micro">{p.fig.replace("FIG. ", "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="label-micro mb-2">Record</p>
              <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-[11px]">
                {recordRows(species).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="label-micro">{k}</dt>
                    <dd className="opacity-85">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                to="/specimen/$slug"
                params={{ slug: species.slug }}
                className="label-micro mt-3 inline-block border-b border-specimen/50 pb-0.5 hover:opacity-100"
              >
                Full record →
              </Link>
            </div>

            <p className="max-w-xs text-[11px] leading-relaxed opacity-75">{species.caption}</p>
          </aside>
        </section>

        {/* Collection index */}
        <section className="mt-16" aria-labelledby="index-heading">
          <div className="flex items-baseline justify-between border-b border-specimen/25 pb-2">
            <h2 id="index-heading" className="label-micro">
              Collection index
            </h2>
            <p className="label-micro">Side by side</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SPECIES.map((sp) => (
              <SpecimenCard key={sp.id} species={sp} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
