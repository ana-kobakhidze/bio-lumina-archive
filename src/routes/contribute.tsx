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
    <div className="hebra-ambient min-h-screen overflow-hidden bg-background text-foreground">
      <header className="hebra-rise border-b border-specimen/15 px-6 py-5 md:px-10">
        <Link to="/" className="hebra-chip hebra-transition label-micro hover:bg-specimen/10">
          ← HEBRA
        </Link>
      </header>
      <main className="hebra-rise mx-auto max-w-xl px-6 py-20 [animation-delay:100ms]">
        <h1 className="font-display text-4xl italic leading-none">Contribute a specimen</h1>
        <p className="mt-4 text-sm leading-relaxed opacity-75">
          HEBRA grows from field records. Send the scientific name, the place of collection and any
          imagery you hold; accepted material enters the archive as a photographic record and is
          queued for three-dimensional reconstruction.
        </p>
        <div className="hebra-panel mt-10 p-6">
          <p className="label-micro">Submissions</p>
          <p className="mt-2 font-display text-2xl italic">archive@hebra.example</p>
        </div>
      </main>

    </div>
  );
}
