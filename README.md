# HEBRA — The Living Digital Herbarium

HEBRA is an interactive digital herbarium for searching plant records, browsing regional flora, and exploring procedural 3D specimens.

## Try it

[Open the live demo](https://bio-lumina-archive.lovable.app/). Search for *Victoria amazonica*, browse Georgia’s flora, or open the specimen viewer to rotate, zoom, and select plant parts.

## How it works

React and TypeScript power the interface. TanStack Start server functions query GBIF for plant records. The archive credits the World Checklist of Vascular Plants via GBIF. The viewer uses Three.js and React Three Fiber. The project was scaffolded with Lovable.

## Run locally

Install Bun, then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Use `bun run build` and `bun run lint` for local checks.

## Project status

The contribution page displays a placeholder email address.

<details>
<summary>Original design brief</summary>

# Lumina Flora Archive

We are building the 3D specimen experience for a Digital Botanical Specimen Library.

VISUAL REFERENCE DIRECTION

The botanical 3D specimens must follow a futuristic scientific-archive aesthetic inspired by the provided visual references.

Do NOT render the plant as a generic photorealistic Three.js model on a gray background.

The specimen itself should feel like:

- a botanical scan

- an x-ray / translucent specimen

- a scientific digital artifact

- a futuristic herbarium object

- highly detailed but visually minimal

CORE COLOR SYSTEM

Primary specimen presentation:

- background: saturated vermilion / red-orange

- specimen: electric ultramarine / cobalt blue / violet

- optional translucent lavender highlights

- very limited neutral colors

Use very strong contrast between specimen and background.

The model should have a semi-transparent, layered, almost x-ray-like material treatment.

Favor:

- transmission

- transparency

- wireframe-like contour detail

- surface lines

- subtle internal structure

- thin luminous botanical edges

- translucent petals

- semi-transparent leaves

- visible veins where possible

Avoid:

- realistic green leaves

- brown stems

- naturalistic garden rendering

- generic HDRI environments

- dark gaming-style lighting

- glossy plastic materials

- heavy shadows

- metallic sci-fi surfaces

3D VIEWER BEHAVIOR

Build the viewer with:

- React Three Fiber

- Three.js

- Drei

The specimen should dominate the viewport.

The user can:

- click-drag to rotate

- mouse wheel / pinch to zoom

- optionally pan

- reset the camera

- enter fullscreen

- select botanical parts

Use OrbitControls.

Camera interaction should feel slow, precise, and museum-like rather than game-like.

The model should begin at a carefully composed default angle.

Do not auto-rotate aggressively.

If subtle auto-rotation is used, stop it immediately when the user interacts.

BOTANICAL PART EXPLORATION

Provide selectable parts such as:

- Whole specimen

- Flower

- Leaf

- Stem

- Fruit

- Seed

When the user selects a botanical part:

1. animate the camera toward that part

2. increase clarity/emphasis of that mesh

3. reduce opacity or visual emphasis of unrelated parts

4. show a small editorial annotation

5. show botanical terminology and optionally a detail photograph

Example:

Flower

Five-petaled pale pink flower with numerous yellow stamens.

The annotation should feel like a museum label, not a dashboard tooltip.

VISUAL COMPOSITION

The model should occupy roughly 65–80% of the available specimen-viewer area.

Use generous negative space.

For flower specimens:

- center the blossom

- allow petals/stamens to approach viewport edges

- avoid cropping important structures

- preserve the feeling of viewing a preserved scientific specimen

Use orthographic or restrained perspective depending on what makes the plant feel most like an archive object.

LIGHTING

Use minimal controlled lighting.

The goal is not realistic environmental illumination.

Use lighting to reveal:

- petal depth

- stem contour

- translucency

- botanical structure

Consider:

- soft directional lights

- subtle rim lighting

- low ambient light

- custom ShaderMaterial or MeshPhysicalMaterial if needed

A possible material direction:

- transparent: true

- transmission

- low roughness

- controlled opacity

- blue/violet base color

- subtle emissive edge effect

Fallback gracefully if a GLB does not support separate botanical meshes.

MODEL FALLBACK

If the GLB asset is missing or fails to load:

- never show a broken viewer

- automatically switch to a high-quality specimen photograph

- maintain the same red/blue visual treatment if possible

- keep the same interaction container and page composition

UI AROUND THE SPECIMEN

Keep interface controls minimal.

Do not surround the viewer with cards.

Controls can appear discreetly around the edges:

- Rotate

- Zoom

- Reset

- Fullscreen

Plant metadata should sit outside the specimen canvas and remain secondary.

The digital plant is the product.

REFERENCE PRINCIPLE

The overall result should feel closer to:

- experimental editorial design

- botanical research visualization

- digital museum installation

- speculative scientific encyclopedia

and NOT:

- Sketchfab

- ecommerce 3D preview

- game inventory

- SaaS dashboard

- generic plant encyclopedia

VISUAL PRIORITY

Visual specimen

→ interaction

→ botanical structure

→ concise information

The specimen must always remain the visual focus.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bio-lumina-archive.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/456cfc74-453b-493b-a9e2-492f1dae4da2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

</details>
