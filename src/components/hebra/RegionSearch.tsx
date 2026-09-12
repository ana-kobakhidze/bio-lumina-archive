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
      <div className="ai-input-shell">
        <div className="ai-input-inner flex items-center px-5 py-3.5 md:px-6 md:py-4">

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
            className="flex-1 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-foreground/40 md:text-base"
          />
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-3 shrink-0 text-foreground/50"
          >
            <path
              d="M3 8h10M10 5l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </div>

      {open && results.length > 0 && (
        <ul
          id="region-suggestions"
          className="hebra-panel hebra-rise absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden bg-background/95"
        >
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(r)}
                className={`hebra-transition flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left ${
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
