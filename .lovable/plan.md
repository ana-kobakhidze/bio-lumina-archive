# Kew-style archive with real plant data

## Important note
Kew's Plants of the World Online blocks automated access, so HEBRA cannot read it directly. Instead we use GBIF, a free open database that includes Kew's world checklist (same accepted names, families, synonyms and native ranges), and link every record back to its Kew page.

## What you will see
- **Clean Kew look**: white page, dark green header bar, plain sans-serif text, simple lists instead of glowing cards. The 3D viewer keeps its own dark stage.
- **Search any plant in the world** from the landing page (live suggestions as you type), not just our sample list.
- **Regional archives with real plants**: Caucasus, Georgia, Japan, Alps, Mediterranean, Amazon Basin, South Africa list real species recorded there, with paging.
- **Plant page in Kew's layout**: name with author, accepted/synonym status, family > genus breadcrumb, "General information", native distribution list, synonyms, common names, photos from GBIF, and a "View on Kew POWO" link. Plants that have a 3D model show an "Open 3D specimen" button.
- Our current 8 reconstructed specimens stay and get their data refreshed from the real source.

## Technical details
- `src/lib/gbif.functions.ts`: server functions (search, species detail, synonyms, vernacular names, distributions, media, region occurrence facets by country code) with typed DTOs and graceful fallback on API errors.
- Regions map to ISO country codes (e.g. Caucasus = GE, AM, AZ; Alps = CH, AT, …) for GBIF occurrence facet queries filtered to Plantae, species rank.
- New route `/plant/$key`; `/archive/$regionId` loads via React Query `ensureQueryData` + `useSuspenseQuery`, filters kept in URL.
- Kew link built as `powo.science.kew.org/results?q=<name>`.
- Restyle tokens in `src/styles.css` to a light Kew theme (white, #3b5f3a-style green, neutral grey); swap rounded fonts for a plain sans (e.g. Source Sans 3). Viewer canvas unchanged.
- Remove mock CATALOGUE entries from `src/lib/archive.ts`.
