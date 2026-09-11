import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute a specimen — HEBRA" },
      {
        name: "description",
        content:
          "Submit a plant to the HEBRA digital herbarium: scientific name, region of collection and imagery for reconstruction.",
      },
      { property: "og:title", content: "Contribute a specimen — HEBRA" },
      {
        property: "og:description",
        content: "Submit a plant to the HEBRA digital herbarium for reconstruction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContributePage,
});

function ContributePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-specimen/20 px-6 py-5 md:px-10">
        <Link to="/" className="label-micro">
          ← HEBRA
        </Link>
      </header>
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="font-display text-4xl italic leading-none">Contribute a specimen</h1>
        <p className="mt-4 text-sm leading-relaxed opacity-75">
          HEBRA grows from field records. Send the scientific name, the place of collection and any
          imagery you hold; accepted material enters the archive as a photographic record and is
          queued for three-dimensional reconstruction.
        </p>
        <p className="label-micro mt-8">Submissions</p>
        <p className="mt-2 font-display text-2xl italic">archive@hebra.example</p>
      </main>
    </div>
  );
}
