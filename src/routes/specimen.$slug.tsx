import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SpecimenStage } from "@/components/specimen/SpecimenStage";
import { speciesBySlug, SPECIES, type PartId } from "@/lib/botany";

export const Route = createFileRoute("/specimen/$slug")({
  ssr: false,
  loader: ({ params }) => {
    if (!speciesBySlug(params.slug)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const s = speciesBySlug(params.slug);
    const title = s ? `${s.name} — HEBRA ${s.record.hebra}` : "Specimen — HEBRA";
    const description = s
      ? `${s.summary} ${s.record.family}, ${s.record.origin}, ${s.record.altitude}.`
      : "A specimen record in the HEBRA digital herbarium.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: SpecimenMissing,
  component: SpecimenRecordPage,
});

function SpecimenMissing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <p className="label-micro">No such record</p>
      <Link to="/" className="font-display text-2xl italic underline">
        Return to the herbarium
      </Link>
    </div>
  );
}

function SpecimenRecordPage() {
  const { slug } = Route.useParams();
  const species = speciesBySlug(slug)!;
  const [active, setActive] = useState<PartId>("whole");
  const r = species.record;

  const fields: [string, string][] = [
    ["Registration", r.hebra],
    ["Family", r.family],
    ["Genus", r.genus],
    ["Authority", r.authority],
    ["Habit", r.habit],
    ["Origin", r.origin],
    ["Range", r.range],
    ["Altitude", r.altitude],
    ["Flowering", r.flowering],
    ["Collected", r.collected],
    ["Collector", r.collector],
    ["Coordinates", r.coordinates],
    ["Status", r.conservation],
    ["Scan", r.scan],
  ];

  const others = SPECIES.filter((s) => s.id !== species.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-start justify-between border-b border-specimen/20 px-6 py-5 md:px-10">
        <Link to="/" className="label-micro">
          ← HEBRA · Digital herbarium
        </Link>
        <p className="label-micro text-right">{r.hebra}</p>
      </header>

      <main className="px-6 pb-16 pt-8 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="label-micro">Specimen card</p>
            <h1 className="mt-2 font-display text-4xl italic leading-none md:text-6xl">
              {species.name}
            </h1>
            <p className="label-micro mt-3">
              {species.common} · {r.family} · {r.authority}
            </p>

            <SpecimenStage
              species={species}
              active={active}
              className="mt-8 min-h-[52vh] border border-specimen/15 md:min-h-[62vh]"
            />

            <nav aria-label="Botanical parts" className="mt-4 flex flex-wrap gap-2">
              {species.parts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  aria-current={active === p.id}
                  className={`label-micro border px-3 py-1.5 transition-colors ${
                    active === p.id
                      ? "border-specimen/70 bg-specimen/10 opacity-100"
                      : "border-specimen/25 opacity-60 hover:opacity-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </nav>

            <section className="mt-12 max-w-2xl">
              <h2 className="label-micro">Description</h2>
              <div className="mt-3 space-y-4 text-sm leading-relaxed opacity-90">
                {species.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <h2 className="label-micro mt-10">Habitat</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-90">{species.habitat}</p>

              <h2 className="label-micro mt-10">Scan note</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-75">{species.caption}</p>
            </section>
          </div>

          <aside className="flex flex-col gap-10">
            <div>
              <p className="label-micro mb-2 border-b border-specimen/25 pb-2">Record</p>
              <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-[11px]">
                {fields.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="label-micro">{k}</dt>
                    <dd className="opacity-85">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="label-micro mb-2 border-b border-specimen/25 pb-2">Viewer</p>
              <Link to="/" className="font-display text-xl italic underline decoration-specimen/40">
                Open in the HEBRA viewer →
              </Link>
              <p className="mt-2 text-[11px] leading-relaxed opacity-70">
                Rotate, zoom and isolate each botanical part against the archive ground.
              </p>
            </div>

            <div>
              <p className="label-micro mb-2 border-b border-specimen/25 pb-2">Also in the archive</p>
              <ul>
                {others.map((s) => (
                  <li key={s.id}>
                    <Link
                      to="/specimen/$slug"
                      params={{ slug: s.slug }}
                      className="flex items-baseline justify-between gap-3 border-b border-specimen/20 py-2 opacity-70 transition-opacity hover:opacity-100"
                    >
                      <span className="font-display text-base italic">{s.name}</span>
                      <span className="label-micro shrink-0">{s.record.hebra.slice(-6)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
