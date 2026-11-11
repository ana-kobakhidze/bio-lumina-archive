import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "@/components/hebra/ThemeProvider";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/results", label: "Data" },
  { to: "/viewer", label: "3D viewer" },
] as const;

/** White top bar laid out like Plants of the World Online. */
export function KewHeader() {
  return (
    <header className="sticky top-0 z-30 border-b kew-rule bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-5 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl font-light tracking-[0.15em]">HEBRA</span>
          <span className="h-9 w-px bg-[color:var(--kew-green)]" />
          <span className="text-sm leading-tight text-[color:var(--kew-green)]">
            Plants of the<br />World Online
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium uppercase tracking-wide">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              {...(n.to === "/results" ? { search: { q: "", rank: "", page: 0 } } : {})}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ className: "text-[color:var(--kew-green)]" }}
              className="hidden hover:text-[color:var(--kew-green)] md:inline"
            >
              {n.label}
            </Link>
          ))}
          <ThemeSwitch className="opacity-90" />
        </nav>
      </div>
    </header>
  );
}
