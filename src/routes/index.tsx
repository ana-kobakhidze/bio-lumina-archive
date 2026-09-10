import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Minimize2, Move3d, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SpecimenViewer } from "@/components/specimen/SpecimenViewer";
import { PARTS, SPECIMEN_META, type PartId } from "@/lib/botany";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Astromirabilis grandiflora — Exoplantae Specimen Archive" },
      {
        name: "description",
        content:
          "An interactive x-ray specimen viewer from the Exoplantae digital herbarium: rotate, zoom and explore the botanical structure of Astromirabilis grandiflora.",
      },
      { property: "og:title", content: "Astromirabilis grandiflora — Exoplantae Specimen Archive" },
      {
        property: "og:description",
        content:
          "Interactive translucent 3D specimen from a speculative digital botanical library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpecimenPage,
});

function SpecimenPage() {
  const [active, setActive] = useState<PartId>("whole");
  const [nonce, setNonce] = useState(0);
  const [full, setFull] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  const part = PARTS.find((p) => p.id === active)!;

  const toggleFull = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFull(false);
    } else {
      el.requestFullscreen?.();
      setFull(true);
    }
  }, []);

  const zoom = (dir: 1 | -1) => {
    stage.current
      ?.querySelector("canvas")
      ?.dispatchEvent(
        new WheelEvent("wheel", { deltaY: dir * 220, bubbles: true, cancelable: true }),
      );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-start justify-between px-6 pt-6 md:px-10 md:pt-8">
        <div>
          <p className="label-micro">Flora, reconstructed</p>
          <h1 className="mt-1 text-3xl font-medium leading-none tracking-[0.34em] md:text-4xl">
            HEBRA
          </h1>
          <p className="label-micro mt-2">ჰებრა · Digital Herbarium</p>
        </div>
        <p className="label-micro hidden text-right md:block">
          HEBRA / 000001
          <br />
          Founded in Georgia
        </p>
      </header>


      <main className="grid gap-6 px-6 pb-12 pt-6 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-10 md:px-10">
        {/* Specimen stage */}
        <section
          ref={stage}
          className="relative min-h-[62vh] bg-background md:min-h-[76vh]"
          aria-label="3D specimen viewer"
        >
          <div className="absolute inset-0">
            <SpecimenViewer active={active} resetNonce={nonce} />
          </div>

          {/* Corner registration marks */}
          <span className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-specimen/40" />
          <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-specimen/40" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-specimen/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-specimen/40" />

          {/* Discreet controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            <IconBtn label="Zoom in" onClick={() => zoom(-1)}>
              <ZoomIn className="size-3.5" />
            </IconBtn>
            <IconBtn label="Zoom out" onClick={() => zoom(1)}>
              <ZoomOut className="size-3.5" />
            </IconBtn>
            <IconBtn label="Reset view" onClick={() => setNonce((n) => n + 1)}>
              <RotateCcw className="size-3.5" />
            </IconBtn>
            <IconBtn label="Fullscreen" onClick={toggleFull}>
              {full ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </IconBtn>
          </div>

          <p className="label-micro pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5">
            <Move3d className="size-3" /> drag to rotate · scroll to zoom
          </p>

          {/* Museum label */}
          <figure className="pointer-events-none absolute left-3 top-3 max-w-[17rem] border-l border-specimen/50 pl-3">
            <figcaption className="label-micro">
              {part.fig} — {part.term}
            </figcaption>
            <p className="mt-1 font-display text-xl italic leading-tight">{part.latin}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/80">{part.note}</p>
          </figure>
        </section>

        {/* Secondary matter */}
        <aside className="flex flex-col gap-8">
          <nav aria-label="Botanical parts">
            <p className="label-micro mb-2">Structure</p>
            <ul className="border-t border-specimen/25">
              {PARTS.map((p) => (
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
            <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-[11px]">
              {SPECIMEN_META.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="label-micro">{k}</dt>
                  <dd className="opacity-85">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="max-w-xs text-[11px] leading-relaxed opacity-75">
            Dark-field transmission scan. Tissue densities are mapped to refractive index; only the
            pigment retained at the base of each tepal registers against the plate.
          </p>

        </aside>
      </main>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center border border-specimen/40 text-specimen/90 transition-colors hover:bg-specimen hover:text-background"
    >
      {children}
    </button>
  );
}
