import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute a specimen — HEBRA" },
      {
        name: "description",
        content:
          "Specimen submissions are currently closed.",
      },
      { property: "og:title", content: "Contribute a specimen — HEBRA" },
      {
        property: "og:description",
        content: "Specimen submissions are currently closed.",
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
          Specimen submissions are currently closed.
        </p>
      </main>

    </div>
  );
}
