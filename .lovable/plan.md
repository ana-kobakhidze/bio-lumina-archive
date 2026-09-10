# Deep-water palette, shorter stem, fixed petals

Three fixes: the bloom's petals are misshapen and read as solid instead of glass, the stem is too long, and the whole scene moves to the dark blue/teal palette from the new swatch image.

## 1. New palette — deep water

Ground moves from pale bone to near-black indigo `#0C0827`, so the specimen glows instead of washing out.

- Page + scene background: `#0C0827`
- Deep body / dense base tissue: `#14194D`
- Mid tissue: `#25387A`
- Bright glass body and contour lines: `#5950B8`
- Luminous accents (stamens, edge highlights, veins): `#1EA598`
- Page text, labels and control outlines: pale `#1EA598`-tinted light tone for readability on the dark ground

Lighting is rebalanced for the dark ground: cooler ambient, stronger teal rim so edges stay luminous.

## 2. Shorter stem

Scape length drops from `1.9` to roughly `0.85`, keeping the same slender radius and neck flare. The flower head stays the visual centre, with the stem cropping softly near the bottom of the frame rather than running the whole height.

## 3. Petals: fixed form and true glass

The reference reads as almost fully transparent membranes whose colour builds only where blades overlap, with density concentrated toward the base.

- Rebalance the tepal rings so blades stop crossing into each other: reduce the outer ring's outward reach and curl slightly, tighten the basal ring so the small recurved blades sit against the receptacle instead of splaying, and let the inner ring stand more upright.
- Reduce the central blade's dominance so it reads as one tall membrane, not a slab.
- Interior of each blade becomes near-clear; the pigment gradient runs dense at the base and fades to nothing at the tip, matching the reference's bottom-heavy density.
- Contour line along each blade boundary stays, recoloured to the bright `#5950B8` so edges are visible against the dark ground; interior scan grid stays very faint.

## 4. Page copy

The specimen record text and the museum label are rewritten to match the deep-water archive framing (a scan pulled from dark-field transmission rather than a bright bone plate). Layout, typography and controls stay as they are.

## 5. Verify

Render the default view offscreen at desktop size, check that the petals no longer intersect awkwardly, that the stem crops naturally, and that the specimen reads as glowing glass on the dark ground. Adjust once if needed.

## Technical notes

- `src/components/specimen/flower.ts`: `stem.length` 1.9 -> ~0.85; tune `outerRing` (`out` ~0.72, `curl` ~0.3), `basalRing` (`out` ~0.7, `tilt` ~0.62, shorter length), `innerRing` (`out` ~0.36); soften `central` width/curl. Repoint `PALETTE` to the new hexes and rewrite `tint()` so alpha-like density is achieved via colour: dense `#14194D`/`#25387A` at `u < 0.3`, fading to near-ground colour at the tip, with `RIM` = `#5950B8`.
- `src/components/specimen/ProceduralFlower.tsx`: `EDGE`/`CONTOUR`/`ATTEN` to `#5950B8` / `#1EA598`; drop base membrane `opacity` further (~0.22), keep `transmission` 0.98, shorten `attenuationDistance`; anthers to `#1EA598`.
- `src/components/specimen/SpecimenViewer.tsx`: `GROUND` -> `#0C0827`; Lightformer colours to `#25387A`, `#5950B8`, `#1EA598`; raise rim intensity, lower ambient for the dark ground.
- `src/styles.css`: `--background` -> oklch of `#0C0827`; `--foreground`/`--specimen` -> a light teal-tinted tone.
- `src/components/specimen/Specimen.tsx`: `EDGE`/`DEEP` constants follow the new palette; leaf/fruit tissue colour to `#25387A`.
- `src/routes/index.tsx`: update the closing record paragraph copy only.
