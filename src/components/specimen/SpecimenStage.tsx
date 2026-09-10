import { Maximize2, Minimize2, Move3d, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SpecimenViewer } from "@/components/specimen/SpecimenViewer";
import type { PartId, Species } from "@/lib/botany";

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

/**
 * The HEBRA viewing stage: registration marks, museum label, discreet
 * controls and the live 3D specimen. Part selection is owned by the page.
 */
export function SpecimenStage({
  species,
  active,
  className = "",
}: {
  species: Species;
  active: PartId;
  className?: string;
}) {
  const [nonce, setNonce] = useState(0);
  const [full, setFull] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => setNonce((n) => n + 1), [species.id]);

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

  const part = species.parts.find((p) => p.id === active) ?? species.parts[0]!;

  return (
    <section
      ref={stage}
      className={`relative bg-background ${className}`}
      aria-label="3D specimen viewer"
    >
      <div className="absolute inset-0">
        <SpecimenViewer key={species.id} species={species} active={part.id} resetNonce={nonce} />
      </div>

      <span className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-specimen/40" />
      <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-specimen/40" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-specimen/40" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-specimen/40" />

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

      <figure className="pointer-events-none absolute left-3 top-3 max-w-[17rem] border-l border-specimen/50 pl-3">
        <figcaption className="label-micro">
          {part.fig} — {part.term}
        </figcaption>
        <p className="mt-1 font-display text-xl italic leading-tight">{part.latin}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-foreground/80">{part.note}</p>
      </figure>
    </section>
  );
}

/** Vertical index list used for both the collection and the structure nav. */
export function IndexList({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ul className="border-t border-specimen/25">{children}</ul>;
}
