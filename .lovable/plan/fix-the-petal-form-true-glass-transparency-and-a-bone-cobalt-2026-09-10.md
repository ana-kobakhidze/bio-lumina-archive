# Fix the petal form, true glass transparency, and a bone/cobalt theme

Two problems in the current bloom: the petals read as solid painted blades instead of transparent membranes with a drawn contour edge, and the background theme should move to the pale bone ground with cobalt specimen.

## 1. Petals: transparent membranes with contour edges

- Make the blade body genuinely see-through: colour appears only where petals overlap, so depth comes from layering rather than fill.
- Draw a bright continuous contour line along each petal outline (base to tip and back), the way the reference shows a thin lit rim tracing every edge.
- Keep the smooth high-resolution surface; remove the heavy interior blue fill that currently flattens each petal.
- Petal outline stays rounded at base and tip, with soft cupping and slight twist — no shape redesign.

## 2. Theme: cobalt on bone

- Ground: near-white lavender `#F0EDFA`.
- Specimen: cobalt `#598FFD` bodies, periwinkle `#8987EC` mid-tones, brown `#5E4C3C` for text and dense base regions.
- Contour lines and highlights shift to cobalt so they stay visible against the pale ground.
- Page text, labels and control outlines move to brown for contrast; layout and typography unchanged.

## 3. Verify

Render the default view offscreen, check the petals read as transparent glass with visible contour edges and that nothing is washed out against the pale ground, then adjust once if needed.

## Technical notes

- `src/components/specimen/flower.ts`: repoint `PALETTE` (ground `#F0EDFA`, dense `#598FFD`, mid `#8987EC`, rim/ink `#5E4C3C`), rebalance `tint()` so the blade interior stays near-neutral and saturation concentrates at the margins.
- `src/components/specimen/ProceduralFlower.tsx`: lower base `opacity`, raise `transmission` toward ~0.98 with low `thickness` and shorter `attenuationDistance`; keep `depthWrite` off for non-emphasised membranes so overlaps accumulate. Replace the wireframe twin with an outline pass — an edge/contour mesh built from the tepal boundary (`THREE.Line` along u=0/u=1 and v=0/v=1 borders of the parametric grid) at high opacity, plus a much fainter interior scan grid.
- `src/components/specimen/SpecimenViewer.tsx`: `GROUND` -> `#F0EDFA`, adjust `Lightformer` colours and directional light intensities down for the bright ground, keep the rim light strong.
- `src/styles.css`: `--background` -> oklch of `#F0EDFA`, `--foreground`/`--specimen` -> `#5E4C3C`.
- `src/components/specimen/Specimen.tsx`: EDGE/DEEP constants follow the new palette.
