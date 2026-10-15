# Manuscript music demonstration assets

## Start

From this folder execute: `python serve.py` and open `http://localhost:8000/viewer/`. The local service dynamically substitutes the IIIF Manifest host. The score preview uses the **external Verovio CDN**; other local assets are available offline.

## The 10 sets

1. `01_featured_manuscript/` — hero spread and descriptive JSON.
2. `02_iiif_manuscript/` — IIIF Presentation API 3 manifest, 8 labeled pages (1r–4v). Uses direct JPEG image resources rather than an IIIF Image API tile server; image deep zoom depends on the viewer.
3. `03_fragment/` — visibly damaged synthetic fragment and JSON.
4. `04_mei_score/` — three-voice, four-measure synthetic MEI v5 example with metadata.
5. `05_editorial_reconstruction/` — MEI passages marked with `<supplied>` and editorial notes.
6. `06_two_witnesses/` — two witnesses of WRK-001, second variant MEI and comparison JSON.
7. `07_manuscript_score_link/` — measure-to-IIIF-canvas map.
8. `08_catalog/` — 15 sources, 40 works (JSON and UTF-8 CSV), varied faceting fields.
9. `09_scholarly_publication/` — annotated HTML demonstration paper and object links.
10. `10_diamm_external/` — a *verified external DIAMM archive page*, repository code and RISM institution identifier, but no imported images.

## Scientific integrity / provenance

**All manuscripts, dates, compositions, scholarly interpretations, provenance, page images and scores related to DEMO-MS/SRC/WRK are fictional test fixtures.** Hero image generated with AI and derivatives are transformed from this one illustration. The eight images are not scans of eight separate authentic folios. Their notation is not a faithful music transcription; the musical notation encoded in MEI is independently composed, so facsimile-score alignment is **functional demo mapping only**, not note-by-note correspondence. The only genuine external identifier is in item 10 and links to an archive-level page rather than a specific source record. No rights to real collection images are claimed.

MEI is XML-well-formed (validated by build script) and has conventional MEI score structure. Browser rendering via Verovio is included as a test path, but **no independent Verovio validation or MEI schema validation was performed**.

## Suggested walkthrough

Search `Ave lumen` → open `SRC-001` → inspect manifest `1r–4v` → open `WRK-001` MEI → inspect editorial `supplied` tags → compare witness B → consult scholarly HTML and DIAMM external card.
