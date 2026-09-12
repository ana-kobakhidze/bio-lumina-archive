import { Link } from "@tanstack/react-router";
import type { Specimen } from "@/lib/archive";
import { ScanPlate } from "@/components/hebra/ScanPlate";

const STATUS_LABEL: Record<Specimen["status"], string> = {
  "3d": "3D",
  photographic: "Photographic",
  processing: "Processing",
};

function CardBody({ s }: { s: Specimen }) {
  return (
    <>
      <div className="hebra-transition relative overflow-hidden rounded-t-[calc(var(--radius)-1px)] border-b border-specimen/15 bg-specimen/[0.03] group-hover:bg-specimen/[0.08]">
        <ScanPlate form={s.form} seed={s.hebraId} />
        <span className="hebra-transition label-micro absolute right-3 top-3 opacity-0 group-hover:opacity-100">
          ✛ scan
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="hebra-transition label-micro group-hover:text-[color:var(--hebra-teal)]">
            {s.hebraId}
          </span>
          <span className="hebra-chip label-micro py-1 opacity-60">{STATUS_LABEL[s.status]}</span>
        </div>

        <h3 className="mt-3 font-display text-xl italic leading-tight">{s.scientificName}</h3>
        {s.commonName && <p className="label-micro mt-1">{s.commonName}</p>}
        <p className="label-micro mt-3 opacity-60">{s.family}</p>

        <span className="hebra-transition label-micro mt-4 inline-block -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          {s.speciesSlug ? "Open specimen →" : "Open viewer →"}
        </span>
      </div>
    </>
  );
}

/** Archived specimen card: soft rounded panel, ambient hover lift. */
export function ArchiveCard({ specimen }: { specimen: Specimen }) {
  const cls = "hebra-panel hebra-panel-hover group flex h-full flex-col overflow-hidden";

  if (!specimen.speciesSlug) {
    return (
      <Link to="/viewer" className={cls} aria-label={specimen.scientificName}>
        <CardBody s={specimen} />
      </Link>
    );
  }

  return (
    <Link to="/specimen/$slug" params={{ slug: specimen.speciesSlug }} className={cls}>
      <CardBody s={specimen} />
    </Link>
  );
}

