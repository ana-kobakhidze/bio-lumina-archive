# Match the glass look of the reference render

## What the two images actually differ on

Side-by-side of your reference and the current preview:

| | Your reference | Current |
|---|---|---|
| Mesh lines | Bright white, dense, clearly visible over every surface — this is what reads as "glass" | Almost invisible (very faint, very coarse) |
| Red showing through petals | Yes — petals glow pink/magenta where the background shows through | No — petals stay flat blue |
| Highlights | Crisp light streaks on the curved edges | Almost none |
| Layering | Overlapping petals get denser and darker where they stack | All parts equally see-through, no stacking depth |
| Top structure | Tall curved membrane | Reads as a flat boxy slab with hard cut edges |
| Framing | Flower fills the frame, stem cropped short | Flower small, long thick stem dominates the lower half |

## Why the glass effect is missing (root causes)

1. **The see-through effect has nothing to see through.** The 3D scene has no background of its own — the red comes from the page behind the canvas. Glass materials sample the *scene* behind them, so they sample emptiness and turn flat. This is the single biggest cause of the difference.
2. **No reflective environment.** Glass needs something to reflect; the scene only has plain lights, so there are no bright specular streaks.
3. **Every surface is set to not write depth**, so overlapping petals never build up density — the reference clearly gets darker/denser where petals stack.
4. **The mesh overlay is turned down to near zero** and is generated at a quarter density, so the signature white lattice is gone.
5. **The central membrane's edges are cut square**, which is what makes it look like a broken slab instead of a leaf.

## The fix

1. Give the 3D scene its own vermilion background so the glass has red to transmit, and keep the page colour identical so nothing visually shifts.
2. Add a small studio reflection environment (soft bright panels, no landscape imagery) so edges catch light the way the reference does.
3. Rework the glass material: higher transmission, real thickness, low roughness, warm attenuation so thick regions read pink-violet like the reference, depth writing enabled on the solid membranes so overlaps stack.
4. Bring back the white lattice: raise overlay density and opacity to reference level, pale-blue/white, drawn over the surface.
5. Close the central membrane: round its outline at base and tip so it no longer terminates in a flat cut, and soften its silhouette.
6. Re-frame the default view: flower larger in frame, stem cropped near the bottom edge.
7. Verify by rendering and comparing against your reference; iterate on transmission/lattice balance until the two match.

## Technical notes

- `SpecimenViewer.tsx`: `gl={{ alpha: false }}` + `<color attach="background">` in the scene colour token; add `<Environment>` (drei, lightformer-based, no HDRI file).
- `ProceduralFlower.tsx` / `Specimen.tsx`: `meshPhysicalMaterial` with `transmission ~0.9`, `thickness 0.3–0.8`, `roughness ~0.12`, `ior 1.4`, `attenuationColor` warm-violet, `depthWrite` true on membranes; wireframe twin `WIRE_Q` ~0.5 and opacity ~0.35.
- `flower.ts`: adjust the central tepal profile exponents/`tipRound` so width goes smoothly to zero at both ends.
- `botany.ts`: tighten the `whole` camera position/target for the closer crop.
- Transmission is expensive: keep `dpr` capped and the wire twin coarse.

Untouched: page layout, typography, palette, controls, part selection, annotations.
