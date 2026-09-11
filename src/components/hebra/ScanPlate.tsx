import { useMemo } from "react";
import type { SpecimenForm } from "@/lib/archive";

/**
 * Deterministic anatomical scan plate — a drawn silhouette in ultraviolet,
 * cobalt and bio teal, standing in for the specimen photograph.
 */
function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function silhouette(form: SpecimenForm, rnd: (n: number) => number) {
  const paths: string[] = [];
  const cx = 60;
  const base = 132;

  // stem / trunk
  const lean = rnd(10) - 5;
  paths.push(`M ${cx} ${base} C ${cx + lean} 100, ${cx - lean} 70, ${cx + lean / 2} 34`);

  switch (form) {
    case "tree":
      for (let i = 0; i < 7; i++) {
        const a = (Math.PI / 6) * i - Math.PI / 1.7;
        const r = 26 + rnd(12);
        paths.push(
          `M ${cx} ${64} q ${Math.cos(a) * r * 0.5} ${Math.sin(a) * r * 0.6}, ${Math.cos(a) * r} ${Math.sin(a) * r}`,
        );
      }
      paths.push(`M ${cx - 34} 52 a 34 30 0 1 1 68 0 a 34 26 0 1 1 -68 0`);
      break;
    case "shrub":
      for (let i = 0; i < 6; i++) {
        const x = cx - 30 + i * 12;
        paths.push(`M ${cx} ${base - 8} C ${x} 96, ${x} 70, ${x + rnd(6) - 3} ${52 + rnd(14)}`);
      }
      break;
    case "vine":
      paths.push(
        `M ${cx - 30} ${base} C ${cx + 34} 112, ${cx - 30} 78, ${cx + 26} 48 S ${cx - 16} 20, ${cx + 10} 12`,
      );
      for (let i = 0; i < 5; i++)
        paths.push(`M ${cx - 12 + i * 8} ${110 - i * 20} l ${12 + rnd(6)} ${-8 - rnd(6)}`);
      break;
    case "fern":
      for (let i = 0; i < 5; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        paths.push(
          `M ${cx} ${base} C ${cx + dir * 26} 108, ${cx + dir * 40} 68, ${cx + dir * (14 + rnd(10))} ${26 + i * 4}`,
        );
      }
      break;
    case "carnivorous":
      for (let i = 0; i < 5; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const y = 104 - i * 12;
        paths.push(`M ${cx} ${base - 6} L ${cx + dir * (22 + rnd(8))} ${y}`);
        paths.push(`M ${cx + dir * (22 + rnd(8))} ${y} a 9 7 0 1 0 ${dir * 2} ${-9}`);
      }
      break;
    case "aquatic":
      paths.push(`M 16 ${base - 30} a 44 14 0 1 0 88 0 a 44 14 0 1 0 -88 0`);
      paths.push(`M ${cx} ${base - 44} a 16 14 0 1 0 1 0`);
      for (let i = 0; i < 6; i++) paths.push(`M ${cx} ${base - 30} l ${-40 + i * 16} ${-3}`);
      break;
    default: // herb
      for (let i = 0; i < 4; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const y = 108 - i * 18;
        paths.push(`M ${cx} ${y} C ${cx + dir * 16} ${y - 4}, ${cx + dir * 26} ${y - 12}, ${cx + dir * (18 + rnd(8))} ${y - 20}`);
      }
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        paths.push(
          `M ${cx + lean / 2} 34 q ${Math.cos(a) * 9} ${Math.sin(a) * 9 - 6}, ${Math.cos(a) * 17} ${Math.sin(a) * 15 - 6}`,
        );
      }
  }
  return paths;
}

export function ScanPlate({ form, seed }: { form: SpecimenForm; seed: string }) {
  const paths = useMemo(() => {
    let h = hash(seed);
    const rnd = (n: number) => {
      h = (h * 1103515245 + 12345) >>> 0;
      return (h % 1000) / 1000 * n;
    };
    return silhouette(form, rnd);
  }, [form, seed]);

  return (
    <svg
      viewBox="0 0 120 150"
      role="img"
      aria-label={`Scan plate, ${form}`}
      className="h-56 w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`g-${seed.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hebra-ultraviolet)" stopOpacity="0.95" />
          <stop offset="60%" stopColor="var(--hebra-teal)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--hebra-cobalt)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* registration grid */}
      <g stroke="var(--hebra-cobalt)" strokeOpacity="0.28" strokeWidth="0.4">
        {[30, 60, 90].map((x) => (
          <line key={x} x1={x} y1="6" x2={x} y2="144" />
        ))}
        {[38, 76, 114].map((y) => (
          <line key={y} x1="6" y1={y} x2="114" y2={y} />
        ))}
      </g>

      <g
        fill="none"
        stroke={`url(#g-${seed.replace(/\W/g, "")})`}
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
