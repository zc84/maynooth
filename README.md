# BROKENSONG — The song between the lines

A responsive, static homepage concept for the BROKENSONG research project at Maynooth University.

## Run locally

Open `index.html` in a browser, or serve this directory with any static file server. There is no build step, backend, or JavaScript dependency.

## Design direction

An editorial, contemporary reading of medieval polyphony: warm manuscript-inspired paper, ink-green type, rust-red annotations, and an original vector folio illustration. The page introduces the research question, methods, project facts, team, and grant context.

All project content is based on the public BROKENSONG page. The folio, notation strip, and monogram are original SVG assets created for this concept; no photos from the source website are reused.

## Implementation planning

The [implementation plan](docs/IMPLEMENTATION_PLAN.md) (in Russian) describes the proposed digital scholarly edition: scope, Discovery, data model, architecture, IIIF/MEI integrations, delivery phases, acceptance criteria, and long-term maintenance.

## Pilot catalogue

`index.html` now includes an interactive catalogue driven by the synthetic asset bundle in `assets/manuscript_demo/`: 15 source records, 40 works, a IIIF Presentation 3 manifest, MEI files, an editorial reconstruction, an audio preview, a scholarly demonstration article, and a DIAMM link-out. It demonstrates metadata search and filtering, the connection between a work, manuscript witness and scholarly edition, and a responsive manuscript/score workspace.

The supplied IIIF manifest remains a fixture source: it contains `localhost` image URLs for its bundled demonstration server. The website reads it and resolves the canvases to the included local images; before publishing that JSON itself as a public IIIF endpoint, substitute the host with the deployed Render or institutional domain.

The score workspace lazy-loads the Verovio browser toolkit from its public CDN only when a compatible MEI file is opened. If that request fails, the original MEI file remains available for download. Every DEMO-MS/SRC/WRK object is fictional test data; see [the asset provenance note](assets/manuscript_demo/README.md).

## Render

The project includes a static-site [Render Blueprint](render.yaml). It publishes the repository root as-is and needs no environment variables, database, or server process. After pushing `render.yaml` to GitHub, create the Blueprint from the Render dashboard.
