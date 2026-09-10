import { createFileRoute, Link } from "@tanstack/react-router";
import { SpecimenCard } from "@/components/hebra/SpecimenCard";
import { SpecimenStage } from "@/components/specimen/SpecimenStage";
import { SPECIES } from "@/lib/botany";

export const Route = createFileRoute("/identity")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "HEBRA identity board — wordmark, card, viewer, hero" },
      {
        name: "description",
        content:
          "The HEBRA visual system: wordmark and registration mark, void / cobalt / ultraviolet palette, typographic scale, specimen card, 3D viewer and homepage hero.",
      },
      { property: "og:title", content: "HEBRA identity board" },
      {
        property: "og:description",
        content:
          "Wordmark, palette, typography, specimen card, viewer and hero for the HEBRA digital herbarium.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IdentityBoard,
});

const SWATCHES: [string, string, string][] = [
  ["Void", "#0C0827", "Ground. Every screen sits on it."],
  ["Deep indigo", "#14194D", "Panels, dense tissue, plate shadow."],
  ["Cobalt", "#25387A", "Structure, rules, record fields."],
  ["Ultraviolet", "#5950B8", "Specimen body. The archive's signature."],
  ["Bio teal", "#3FE7BE", "Signal only: margins, live edges, focus."],
  ["Pale lavender", "#E8E5F7", "Ink. Set at 75–90% opacity, never pure."],
];

function Panel({
  n,
  title,
  children,
  className = "",
}: {
  n: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-specimen/20 p-5 ${className}`}>
      <div className="flex items-baseline justify-between border-b border-specimen/20 pb-2">
        <h2 className="label-micro">{title}</h2>
        <span className="label-micro">{n}</span>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function IdentityBoard() {
  const hero = SPECIES.find((s) => s.id === "lilium")!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-start justify-between border-b border-specimen/20 px-6 py-5 md:px-10">
        <Link to="/" className="label-micro">
          ← HEBRA · Digital herbarium
        </Link>
        <p className="label-micro text-right">Identity board · 01</p>
      </header>

      <main className="grid gap-4 px-6 py-8 md:px-10 lg:grid-cols-3">
        {/* Wordmark */}
        <Panel n="A" title="Wordmark" className="lg:col-span-2">
          <div className="flex flex-wrap items-end gap-10">
            <div>
              <p className="text-5xl font-medium leading-none tracking-[0.34em] md:text-7xl">
                HEBRA
              </p>
              <p className="label-micro mt-4">ჰებრა · The living digital herbarium</p>
            </div>
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full border border-specimen/50">
              <span className="label-micro text-center leading-tight">
                HEBRA
                <br />
                ®
              </span>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-[11px] leading-relaxed opacity-70">
            Letter-spaced grotesk at 0.34em, never italic, never coloured. The registration mark
            accompanies the wordmark at small sizes and stands alone on the specimen plate.
          </p>
        </Panel>

        {/* Palette */}
        <Panel n="B" title="Palette">
          <ul className="space-y-2">
            {SWATCHES.map(([name, hex, use]) => (
              <li key={hex} className="flex items-center gap-3">
                <span
                  className="size-8 shrink-0 border border-specimen/25"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="label-micro block">
                    {name} · {hex}
                  </span>
                  <span className="block truncate text-[11px] opacity-70">{use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Typography */}
        <Panel n="C" title="Typography">
          <p className="font-display text-3xl italic leading-tight">Lilium martagon</p>
          <p className="label-micro mt-1">Instrument Serif italic · binomials only</p>
          <p className="mt-5 text-sm leading-relaxed opacity-90">
            Space Grotesk carries all reading text at 11–14 px with generous leading.
          </p>
          <p className="label-micro mt-5">
            Label micro · 9 px · 0.16em · uppercase · metadata and figure numbers
          </p>
        </Panel>

        {/* Hero */}
        <Panel n="D" title="Homepage hero" className="lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem]">
            <SpecimenStage species={hero} active="whole" className="min-h-[46vh]" />
            <div className="flex flex-col justify-between">
              <div>
                <p className="label-micro">Flora, reconstructed</p>
                <p className="mt-2 text-3xl font-medium leading-none tracking-[0.3em]">HEBRA</p>
                <p className="mt-4 text-[11px] leading-relaxed opacity-75">
                  The specimen is the interface. Type is set to the left margin, the plant holds
                  the centre, and the record sits in the right column at label scale.
                </p>
              </div>
              <p className="label-micro mt-6">Grid: 1fr / 20rem · gutter 2.5rem</p>
            </div>
          </div>
        </Panel>

        {/* Card */}
        <Panel n="E" title="Specimen card">
          <SpecimenCard species={hero} />
        </Panel>
      </main>
    </div>
  );
}
