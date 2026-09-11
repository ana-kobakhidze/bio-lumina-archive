import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { searchRegions, type Region } from "@/lib/archive";

/**
 * Region autocomplete. Typing filters the register; selecting a region
 * transitions straight into that regional archive.
 */
export function RegionSearch({
  autoFocus = false,
  placeholder = "Search a region, country or ecosystem...",
  onSelected,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  onSelected?: (region: Region) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const results = searchRegions(q).slice(0, 6);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (box.current && !box.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const choose = (region: Region | undefined) => {
    if (!region) return;
    setOpen(false);
    setQ("");
    onSelected?.(region);
    navigate({
      to: "/archive/$regionId",
      params: { regionId: region.id },
      search: { q: "", form: "all", family: "all", status: "all" },
    });
  };

  return (
    <div ref={box} className="relative w-full">
      <input
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setCursor(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setCursor((c) => Math.min(c + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[cursor]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        aria-label="Search a region"
        role="combobox"
        aria-expanded={open}
        aria-controls="region-suggestions"
        className="w-full border-b border-specimen/40 bg-transparent pb-3 font-display text-2xl italic text-foreground outline-none transition-colors placeholder:not-italic placeholder:font-sans placeholder:text-[13px] placeholder:tracking-[0.2em] placeholder:uppercase placeholder:text-foreground/40 focus:border-specimen md:text-3xl"
      />

      {open && results.length > 0 && (
        <ul
          id="region-suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-1 border border-specimen/25 bg-background"
        >
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(r)}
                className={`flex w-full items-baseline justify-between gap-4 border-b border-specimen/15 px-4 py-3 text-left transition-colors ${
                  i === cursor ? "bg-specimen/10" : ""
                }`}
              >
                <span>
                  <span className="label-micro block">{r.name}</span>
                  <span className="mt-1 block text-[11px] opacity-60">{r.description}</span>
                </span>
                <span className="label-micro shrink-0 opacity-50">{r.type.replace("-", " ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
