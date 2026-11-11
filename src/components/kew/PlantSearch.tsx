import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchPlants } from "@/lib/gbif.functions";

/** Search box with live suggestions; Enter opens the full results list. */
export function PlantSearch({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data = [], isFetching } = useQuery({
    queryKey: ["plant-search", debounced],
    queryFn: () => searchPlants({ data: { q: debounced } }),
    enabled: open && debounced.length >= 2,
  });

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(false);
        navigate({ to: "/results", search: { q: q.trim(), rank: "", page: 0 } });
      }}
    >
      <div className="flex">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search plants, e.g. Quercus robur"
          aria-label="Search plants"
          className="w-full border border-foreground/25 bg-background px-4 py-3 text-base text-foreground outline-none focus:border-[color:var(--kew-green)]"
        />
        <button type="submit" className="kew-bar px-6 text-sm font-medium uppercase tracking-wide">Search</button>
      </div>
      {open && debounced.length >= 2 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto border border-foreground/20 bg-background text-left text-foreground shadow-lg">
          {isFetching && data.length === 0 && <li className="px-4 py-3 text-sm opacity-60">Searching…</li>}
          {!isFetching && data.length === 0 && <li className="px-4 py-3 text-sm opacity-60">No plant found</li>}
          {data.map((p) => (
            <li key={p.key}>
              <Link to="/plant/$key" params={{ key: String(p.key) }} className="flex items-baseline justify-between gap-4 px-4 py-2.5 hover:bg-muted">
                <span><i>{p.name}</i> <span className="text-sm opacity-60">{p.author}</span></span>
                <span className="shrink-0 text-xs opacity-60">{p.family}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
