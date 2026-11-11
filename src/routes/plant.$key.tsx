import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { KewHeader } from "@/components/kew/KewHeader";
import { SPECIES } from "@/lib/botany";
import { kewUrl, plantDetail } from "@/lib/gbif.functions";

const detailQuery = (key: number) =>
  queryOptions({
    queryKey: ["plant", key],
    queryFn: () => plantDetail({ data: { key } }),
    staleTime: 30 * 60_000,
  });

export const Route = createFileRoute("/plant/$key")({
  loader: async ({ params, context }) => {
    const key = Number(params.key);
    if (!Number.isFinite(key)) throw notFound();
    const d = await context.queryClient.ensureQueryData(detailQuery(key));
    if (!d) throw notFound();
    return { name: d.name, family: d.family };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — HEBRA` : "Plant — HEBRA";
    const description = loaderData
      ? `${loaderData.name} (${loaderData.family}): accepted name, distribution, synonyms and photographs.`
      : "A plant record in HEBRA.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: PlantError,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <p className="mx-auto max-w-5xl px-5 py-16">
        No plant with that record. <Link to="/" className="underline">Search again</Link>
      </p>
    </div>
  ),
  component: PlantPage,
});

function PlantError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <div className="mx-auto max-w-5xl px-5 py-16">
        <p>This plant could not load: {error.message}</p>
        <button onClick={() => router.invalidate()} className="mt-4 underline">Try again</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="border-b kew-rule pb-2 text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlantPage() {
  const { key } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(Number(key)));
  const p = data!;
  const model = SPECIES.find((s) => s.name.toLowerCase() === p.name.toLowerCase());
  const accepted = p.status === "accepted";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <KewHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <nav className="text-sm opacity-70">
          <Link to="/" className="underline">Home</Link> › {p.family} › {p.genus}
        </nav>
        <h1 className="mt-4 text-4xl">
          <i>{p.name}</i> <span className="text-2xl opacity-60">{p.author}</span>
        </h1>
        <p className="mt-2">
          <span className={`rounded-sm px-2 py-0.5 text-sm ${accepted ? "kew-bar" : "border border-foreground/30"}`}>
            This name is {accepted ? "accepted" : p.status || "unplaced"}
          </span>
          {!accepted && p.acceptedKey && (
            <span className="ml-3 text-sm">
              Accepted name:{" "}
              <Link to="/plant/$key" params={{ key: String(p.acceptedKey) }} className="underline">
                <i>{p.accepted}</i>
              </Link>
            </span>
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {model && (
            <Link to="/specimen/$slug" params={{ slug: model.slug }} className="kew-bar rounded-sm px-4 py-2 font-semibold">
              Open 3D specimen
            </Link>
          )}
          <a href={kewUrl(p.name)} target="_blank" rel="noreferrer" className="rounded-sm border border-foreground/30 px-4 py-2">
            View on Kew POWO ↗
          </a>
        </div>

        {p.images.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3">
            {p.images.map((img) => (
              <figure key={img.url}>
                <img src={img.url} alt={p.name} loading="lazy" className="aspect-[4/3] w-full rounded-sm object-cover" />
                <figcaption className="mt-1 truncate text-xs opacity-55">© {img.credit}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <Section title="General information">
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="opacity-60">Family</dt><dd>{p.family}</dd>
            <dt className="opacity-60">Order</dt><dd>{p.order}</dd>
            <dt className="opacity-60">Genus</dt><dd><i>{p.genus}</i></dd>
            <dt className="opacity-60">Rank</dt><dd>{p.rank}</dd>
            {p.published && (<><dt className="opacity-60">First published</dt><dd>{p.published}</dd></>)}
            {p.common.length > 0 && (<><dt className="opacity-60">Common names</dt><dd>{p.common.join(", ")}</dd></>)}
          </dl>
        </Section>

        <Section title="Distribution">
          {p.native.length === 0 && p.introduced.length === 0 ? (
            <p className="text-sm opacity-60">No distribution recorded.</p>
          ) : (
            <>
              {p.native.length > 0 && (<><h3 className="font-semibold">Native to</h3><p className="mt-1 text-sm leading-relaxed">{p.native.join(", ")}</p></>)}
              {p.introduced.length > 0 && (<><h3 className="mt-4 font-semibold">Introduced into</h3><p className="mt-1 text-sm leading-relaxed">{p.introduced.join(", ")}</p></>)}
            </>
          )}
        </Section>

        {p.synonyms.length > 0 && (
          <Section title={`Synonyms (${p.synonyms.length})`}>
            <ul className="columns-1 gap-8 text-sm md:columns-2">
              {p.synonyms.map((s) => (
                <li key={s.key} className="py-0.5"><i>{s.name}</i> <span className="opacity-60">{s.author}</span></li>
              ))}
            </ul>
          </Section>
        )}

        <p className="mt-12 text-xs opacity-55">Source: World Checklist of Vascular Plants and GBIF occurrence records.</p>
      </main>
    </div>
  );
}
