import { Link } from "@tanstack/react-router";
import type { Species } from "@/lib/botany";

/**
 * HEBRA specimen card — the archive's repeating unit. Registration number,
 * binomial, one line of editorial copy and four fields of scientific record.
 */
export function SpecimenCard({ species }: { species: Species }) {
  const r = species.record;
  return (
    <Link
      to="/specimen/$slug"
      params={{ slug: species.slug }}
      className="group flex flex-col justify-between border border-specimen/20 p-4 transition-colors hover:border-specimen/60 hover:bg-specimen/[0.04]"
    >
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="label-micro">{r.hebra}</span>
          <span className="label-micro">{species.common}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl italic leading-tight">{species.name}</h3>
        <p className="label-micro mt-1">
          {r.family} · {r.authority}
        </p>
        <p className="mt-3 text-[11px] leading-relaxed opacity-75">{species.summary}</p>
      </div>

      <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-1 border-t border-specimen/20 pt-3 text-[11px]">
        <dt className="label-micro">Origin</dt>
        <dd className="opacity-85">{r.origin}</dd>
        <dt className="label-micro">Altitude</dt>
        <dd className="opacity-85">{r.altitude}</dd>
        <dt className="label-micro">Collected</dt>
        <dd className="opacity-85">{r.collected}</dd>
        <dt className="label-micro">Status</dt>
        <dd className="opacity-85">{r.conservation}</dd>
      </dl>

      <span className="label-micro mt-4 inline-block opacity-60 transition-opacity group-hover:opacity-100">
        Open record →
      </span>
    </Link>
  );
}
