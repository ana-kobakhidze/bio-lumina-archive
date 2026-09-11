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
      <div className="relative border-b border-specimen/20 bg-specimen/[0.03] transition-colors group-hover:bg-specimen/[0.07]">
        <ScanPlate form={s.form} seed={s.hebraId} />
        <span className="label-micro absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          ✛ scan
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="label-micro transition-colors group-hover:text-[color:var(--hebra-teal)]">
            {s.hebraId}
          </span>
          <span className="label-micro opacity-60">{STATUS_LABEL[s.status]}</span>
        </div>

        <h3 className="mt-3 font-display text-xl italic leading-tight">{s.scientificName}</h3>
        {s.commonName && <p className="label-micro mt-1">{s.commonName}</p>}
        <p className="label-micro mt-3 opacity-60">{s.family}</p>

        <span className="label-micro mt-4 inline-block opacity-0 transition-opacity group-hover:opacity-100">
          {s.speciesSlug ? "Open specimen →" : "Record pending"}
        </span>
      </div>
    </>
  );
}

/** Archived specimen card. Square corners, no shadow, no product styling. */
export function ArchiveCard({ specimen }: { specimen: Specimen }) {
  const cls =
    "group flex h-full flex-col border border-specimen/20 transition-colors hover:border-specimen/60";

  if (!specimen.speciesSlug) {
    return (
      <article className={`${cls} opacity-70`} aria-label={specimen.scientificName}>
        <CardBody s={specimen} />
      </article>
    );
  }

  return (
    <Link to="/specimen/$slug" params={{ slug: specimen.speciesSlug }} className={cls}>
      <CardBody s={specimen} />
    </Link>
  );
}
