import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchPlants } from "@/lib/gbif.functions";

/** Live search across every accepted plant name in the world checklist. */
export function PlantSearch() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data = [], isFetching } = useQuery({
    queryKey: ["plant-search", debounced],
    queryFn: () => searchPlants({ data: { q: debounced } }),
    enabled: debounced.length >= 2,
  });

  return (
    <div className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search any plant, e.g. Quercus robur"
        aria-label="Search plants"
        className="w-full rounded-sm border border-foreground/30 bg-background px-4 py-3 text-base outline-none focus:border-[color:var(--kew-green)]"
      />
      {debounced.length >= 2 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-sm border border-foreground/20 bg-background shadow-lg">
          {isFetching && data.length === 0 && <li className="px-4 py-3 text-sm opacity-60">Searching…</li>}
          {!isFetching && data.length === 0 && <li className="px-4 py-3 text-sm opacity-60">No plant found</li>}
          {data.map((p) => (
            <li key={p.key}>
              <Link
                to="/plant/$key"
                params={{ key: String(p.key) }}
                className="flex items-baseline justify-between gap-4 px-4 py-2.5 hover:bg-foreground/5"
              >
                <span>
                  <i>{p.name}</i> <span className="text-sm opacity-60">{p.author}</span>
                </span>
                <span className="shrink-0 text-xs opacity-60">{p.family}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
