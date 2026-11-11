import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "@/components/hebra/ThemeProvider";

/** Plain green top bar in the style of Plants of the World Online. */
export function KewHeader() {
  return (
    <header className="kew-bar">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="text-lg font-bold tracking-[0.2em]">HEBRA</span>
          <span className="hidden text-sm opacity-80 sm:inline">Plants of the world, digitised</span>
        </Link>
        <ThemeSwitch className="opacity-90" />
      </div>
    </header>
  );
}
