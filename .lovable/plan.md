# Rebuild the flower to match the reference — glass look + new palette

## What's wrong today (from comparing your reference with the live preview)

| | Your reference | Current |
|---|---|---|
| Surfaces | Smooth, rounded, membrane-like | Faceted, folded, straight-edged silhouettes |
| Glass | Petals glow warm where the background shows through | Flat blue, nothing shows through |
| Mesh lines | Fine white lattice sitting lightly over a smooth form | Coarse, geometry-first, no smooth surface underneath |
| Highlights | Crisp light along curved edges | Almost none |
| Layering | Overlaps get denser | All parts equally see-through |
| Framing | Bloom fills the frame, stem cropped | Small bloom, long dominant stem |

### Root causes of the missing glass

1. The 3D scene has no background of its own — the colour comes from the page behind the canvas. Glass materials sample the scene behind them, so they sample emptiness and go flat. This is the single biggest cause.
2. No reflective environment, so no specular streaks on the edges.
3. Surfaces don't write depth, so stacked petals never build density.
4. Tepal outlines still collapse to straight cuts at base and tip, which reads as folded paper.

## The rebuild

1. **Geometry** — regenerate every tepal as a dense parametric membrane (64 x 28 grid): CatmullRom centerline, continuous width / bend / curl / cup / twist, softly rounded at both base and tip so nothing terminates in a point or a flat cut. Central structure: tallest and widest, broad rounded body, max width upper-middle, rounded top. Outer tepals: asymmetric, overlapping, individually varied rather than six identical blades. Receptacle: deformed high-res dome. Stem: thin, smooth, flowing continuously out of the receptacle.
2. **Glass material** — give the 3D scene its own background colour so transmission has something to transmit; add a small studio reflection environment (soft light panels, no HDRI file); MeshPhysicalMaterial with real transmission, thickness, low roughness, ior ~1.35, double-sided, depth-writing on the membranes so overlaps stack.
3. **Colour depth** — vertex-graded: dense deep tone at base, pale translucent tone at the thin tips, brighter edge colour along the margins, near-white speculars.
4. **Scan overlay** — separate low-density twin at ~0.06–0.10 opacity, pale, so it only shows on close inspection.
5. **Composition** — bloom fills ~65–75% of the viewer width, camera slightly above and front-facing, stem cropped near the bottom edge; leaves, fruit and seed hidden in the default view.
6. **Acceptance check** — render with the overlay off, screenshot, compare against your reference for silhouette, rounded edges, overlap depth, proportions, translucency and absence of facets; raise resolution until it passes; then re-enable the subtle overlay.

## New colour palette

From your swatch image:

- `#C7CC10` olive-yellow — canvas background (replacing vermilion)
- `#598FFD` cobalt — specimen edges and bright margins
- `#8987EC` periwinkle — translucent mid-tones
- `#F0EDFA` near-white lavender — highlights, mesh lines, text
- `#5E4C3C` deep brown — dense base regions and secondary text

If you'd rather keep the vermilion background and only recolour the specimen, say so and I'll swap that one decision.

## Technical notes

- `flower.ts`: rewrite the tepal/receptacle/stem generators and the `FLOWER` morphology data; palette constants for the vertex tint.
- `ProceduralFlower.tsx` / `Specimen.tsx`: physical material with `transmission ~0.9`, `thickness 0.3–0.8`, `roughness ~0.12`, `ior 1.4`, `depthWrite` on membranes; wire twin `WIRE_Q ~0.3`, opacity ~0.08.
- `SpecimenViewer.tsx`: `gl={{ alpha: false }}` + `<color attach="background">`, drei `<Environment>` with `<Lightformer>`s (no CDN preset), key/fill/rim lights, `dpr` capped for transmission cost.
- `botany.ts`: tighter `whole`/flower camera + target for the closer crop.
- `styles.css`: swap the palette tokens; page layout, typography, controls, part selection and annotations stay as they are.
