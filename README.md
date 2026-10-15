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

`index.html` now includes an interactive pilot catalogue with ten fictional records. It demonstrates metadata search and filtering, the connection between a work, manuscript witness and scholarly edition, and a responsive manuscript/score workspace. It does not query DIAMM, load IIIF manifests, or render MEI yet; those integrations require approved production data and access.

## Render

The project includes a static-site [Render Blueprint](render.yaml). It publishes the repository root as-is and needs no environment variables, database, or server process. After pushing `render.yaml` to GitHub, create the Blueprint from the Render dashboard.
