const assetRoot = "assets/manuscript_demo/";
const catalogue = document.querySelector("[data-catalogue]");
let verovioReady;

const html = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character]));
const asset = (path) => `${assetRoot}${path}`;
const dateRange = (from, to) => from === to ? String(from) : `${from}–${to}`;

function loadVerovio() {
  if (window.verovio) return Promise.resolve(window.verovio);
  if (verovioReady) return verovioReady;
  verovioReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js";
    script.async = true;
    script.onload = () => {
      if (!window.verovio?.module) return reject(new Error("The Verovio toolkit did not initialise."));
      window.verovio.module.onRuntimeInitialized = () => resolve(window.verovio);
    };
    script.onerror = () => reject(new Error("The Verovio CDN could not be reached."));
    document.head.append(script);
  });
  return verovioReady;
}

async function getManifestPages(record) {
  const [manifest, measureMap] = await Promise.all([
    fetch(asset("02_iiif_manuscript/manifest.json")).then((response) => {
      if (!response.ok) throw new Error("IIIF manifest unavailable");
      return response.json();
    }),
    fetch(asset("07_manuscript_score_link/measure_to_canvas.json")).then((response) => response.json())
  ]);
  return manifest.items.map((canvas) => {
    const body = canvas.items?.[0]?.items?.[0]?.body;
    const remotePath = body?.id?.match(/(02_iiif_manuscript\/images\/[^/]+)$/)?.[1];
    const mappedMeasure = measureMap.find((entry) => entry.source_id === "SRC-001" && entry.canvas_label === canvas.label?.en?.[0]);
    const label = canvas.label?.en?.[0] || "Unlabelled canvas";
    return { label: mappedMeasure ? `${label} · measure ${mappedMeasure.measure_start}` : label, image: remotePath ? asset(remotePath) : asset("02_iiif_manuscript/images/folio_01_recto.jpg") };
  });
}

function sourceRecord(source, works) {
  const linkedWorks = works.filter((work) => work.source_ids.includes(source.id)).map((work) => work.id);
  const hasImage = Boolean(source.image_asset) || source.id === "SRC-001";
  return {
    id: source.id, type: "manuscript", tag: "Source", title: source.title,
    subtitle: `${source.shelfmark} · ${source.repository}`, date: dateRange(source.date_from, source.date_to), notation: source.notation,
    language: source.location, voices: source.material, witness: `${linkedWorks.length} linked works`, status: source.id === "SRC-001" ? "IIIF demonstrator" : source.image_asset ? "Image available" : "Metadata record",
    description: `${source.repository}. This is a synthetic test record; its metadata and images do not describe a historical manuscript.`, related: linkedWorks,
    image: source.image_asset ? asset(source.image_asset) : null, manifest: source.id === "SRC-001", view: "folio"
  };
}

function workRecord(work, sources) {
  const linkedSources = work.source_ids.map((id) => sources.find((source) => source.id === id)).filter(Boolean);
  return {
    id: work.id, type: "composition", tag: "Work", title: work.title, subtitle: `${work.genre} · ${work.composer}`, date: String(work.date),
    notation: work.notation, language: work.language, voices: `${work.voices} voices`, witness: `${linkedSources.length} source${linkedSources.length === 1 ? "" : "s"}`,
    status: work.mei_file ? "MEI available" : "Catalogue metadata", description: `Synthetic ${work.genre} record with ${linkedSources.length} linked source${linkedSources.length === 1 ? "" : "s"}.`,
    related: linkedSources.map((source) => source.id), mei: work.mei_file ? asset(work.mei_file) : null,
    image: work.id === "WRK-001" ? asset("02_iiif_manuscript/images/folio_01_recto.jpg") : null, manifest: work.id === "WRK-001", comparison: work.id === "WRK-001" ? asset("06_two_witnesses/comparison.json") : null,
    audio: work.id === "WRK-001" ? asset("audio/ave_lumen_preview.wav") : null, view: work.mei_file ? "score" : "folio"
  };
}

function specialRecords() {
  return [
    { id: "ED-001", type: "edition", tag: "Edition", title: "Ave lumen — editorial reconstruction", subtitle: "Demo Editorial Team · supplied passages", date: "2026", notation: "mensural", language: "Latin (invented)", voices: "3 voices", witness: "Based on SRC-003", status: "Editorial reconstruction", description: "Measures 3–4 of the Contratenor are explicitly encoded as supplied material. This is not a historical reconstruction.", related: ["WRK-001", "SRC-003"], mei: asset("05_editorial_reconstruction/ave_lumen_reconstruction.mei"), image: asset("03_fragment/damaged_folio.png"), view: "score", editorial: true },
    { id: "PUB-001", type: "edition", tag: "Publication", title: "From manuscript witness to editorial reading", subtitle: "Demonstration article · 2026", date: "2026", notation: "mixed", language: "English / Russian", voices: "Research context", witness: "Links 6 assets", status: "HTML article", description: "A local, annotated demonstration paper about separating source, transcription and reconstruction.", related: ["WRK-001", "SRC-001", "ED-001"], image: asset("01_featured_manuscript/featured_spread.jpg"), article: asset("09_scholarly_publication/article.html"), view: "folio" },
    { id: "EXT-DIAMM-001", type: "edition", tag: "External", title: "DIAMM archive reference", subtitle: "Yale University, Beinecke Library", date: "Verified link", notation: "External metadata", language: "DIAMM / RISM", voices: "Link-out only", witness: "No images imported", status: "External DIAMM record", description: "The demonstrator retains attribution and links to a verified DIAMM archive page without copying external collection images.", related: [], image: null, external: "https://www.diamm.ac.uk/archives/418/", view: "folio" }
  ];
}

if (catalogue) {
  const results = catalogue.querySelector("[data-catalogue-results]");
  const count = catalogue.querySelector("[data-result-count]");
  const empty = catalogue.querySelector("[data-empty-state]");
  const loading = catalogue.querySelector("[data-load-state]");
  const search = catalogue.querySelector("#catalogue-search");
  const type = catalogue.querySelector("#catalogue-type");
  const notation = catalogue.querySelector("#catalogue-notation");
  const clear = catalogue.querySelector("[data-clear-filters]");
  let records = [];
  const normalise = (value) => String(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function filteredRecords() {
    const query = normalise(search.value.trim());
    return records.filter((record) => {
      const searchable = normalise([record.title, record.subtitle, record.language, record.status, record.tag, record.id, record.description].join(" "));
      return (!query || searchable.includes(query)) && (type.value === "all" || record.type === type.value) && (notation.value === "all" || record.notation === notation.value);
    });
  }

  function renderRecords() {
    const matching = filteredRecords();
    count.textContent = matching.length;
    empty.hidden = matching.length !== 0;
    results.innerHTML = matching.map((record, index) => `
      <article class="catalogue-card catalogue-card--${html(record.type)}" style="--card-index:${index}">
        <div class="catalogue-card-top"><span>${html(record.tag)}</span><span>${html(record.id)}</span></div>
        <div class="catalogue-card-copy"><h3>${html(record.title)}</h3><p>${html(record.subtitle)}</p></div>
        <dl class="catalogue-meta"><div><dt>Date</dt><dd>${html(record.date)}</dd></div><div><dt>Language</dt><dd>${html(record.language)}</dd></div><div><dt>Notation</dt><dd>${html(record.notation)}</dd></div><div><dt>Material</dt><dd>${html(record.witness)}</dd></div></dl>
        <div class="catalogue-card-bottom"><span class="record-status">${html(record.status)}</span><button type="button" class="record-open" data-open-record="${html(record.id)}" aria-label="Open ${html(record.title)}">Open <span aria-hidden="true">↗</span></button></div>
      </article>`).join("");
  }

  function viewerMarkup(record) {
    const hasFolio = Boolean(record.image || record.manifest);
    const hasScore = Boolean(record.mei);
    return `
      <section class="viewer-demo" aria-label="Source and score workspace">
        <div class="viewer-tabs" role="tablist" aria-label="View mode">
          <button type="button" role="tab" aria-selected="${record.view !== "score"}" data-view="folio" ${hasFolio ? "" : "disabled"}>Manuscript</button>
          <button type="button" role="tab" aria-selected="${record.view === "score"}" data-view="score" ${hasScore ? "" : "disabled"}>MEI score</button>
        </div>
        <div class="viewer-canvas"><div class="viewer-folio" data-viewer-folio ${record.view === "score" ? "hidden" : ""}>
          ${hasFolio ? `<img data-viewer-image src="${html(record.image || asset("02_iiif_manuscript/images/folio_01_recto.jpg"))}" alt="Synthetic manuscript demonstrator for ${html(record.title)}" />` : `<p class="viewer-unavailable">No manuscript image is supplied for this record.</p>`}
          <div class="viewer-tools" data-viewer-tools ${record.manifest ? "" : "hidden"}></div></div>
          <div class="viewer-score" data-viewer-score ${record.view === "score" ? "" : "hidden"}>${hasScore ? `<p class="score-loading">Loading MEI score…</p>` : `<p class="viewer-unavailable">No MEI file is supplied for this catalogue record.</p>`}</div></div>
      </section>`;
  }

  function relatedMarkup(record) {
    const related = record.related.map((id) => records.find((candidate) => candidate.id === id)).filter(Boolean);
    return related.length ? `<div class="related-records"><span>Connected records</span>${related.map((item) => `<button type="button" data-open-record="${html(item.id)}">${html(item.tag)}: ${html(item.title)}<b aria-hidden="true">→</b></button>`).join("")}</div>` : "";
  }

  async function drawScore(target, record) {
    if (!record.mei) return;
    try {
      const [mei, verovio] = await Promise.all([fetch(record.mei).then((response) => response.text()), loadVerovio()]);
      const toolkit = new verovio.toolkit();
      toolkit.setOptions({ scale: 42, pageWidth: 1800, adjustPageHeight: true });
      toolkit.loadData(mei);
      target.innerHTML = `${record.editorial ? '<p class="editorial-flag">Editorial reconstruction: supplied material is declared in the source MEI.</p>' : ""}${toolkit.renderToSVG(1, {})}<p class="score-source"><a href="${html(record.mei)}" download>Download MEI</a>${record.audio ? ` <audio controls preload="metadata" src="${html(record.audio)}"></audio>` : ""}</p>`;
    } catch {
      target.innerHTML = `<p class="viewer-unavailable">The score renderer could not load. <a href="${html(record.mei)}" download>Download the original MEI file</a>.</p>`;
    }
  }

  async function initialiseManifest(dialog, record) {
    if (!record.manifest) return;
    const tools = dialog.querySelector("[data-viewer-tools]");
    const image = dialog.querySelector("[data-viewer-image]");
    try {
      const pages = await getManifestPages(record);
      tools.innerHTML = `<label>IIIF canvas <select aria-label="IIIF canvas">${pages.map((page, index) => `<option value="${index}">${html(page.label)}</option>`).join("")}</select></label><a href="${asset("02_iiif_manuscript/manifest.json")}" target="_blank" rel="noreferrer">Manifest source ↗</a>`;
      tools.querySelector("select").addEventListener("change", (event) => { image.src = pages[Number(event.target.value)].image; image.alt = `Synthetic IIIF canvas ${pages[Number(event.target.value)].label}`; });
    } catch {
      tools.innerHTML = `<a href="${asset("02_iiif_manuscript/manifest.json")}" target="_blank" rel="noreferrer">Open IIIF manifest source ↗</a>`;
    }
  }

  function openRecord(id) {
    const record = records.find((candidate) => candidate.id === id);
    if (!record) return;
    const modal = document.createElement("dialog");
    modal.className = "record-dialog";
    modal.innerHTML = `
      <div class="record-dialog-shell"><header class="record-dialog-header"><div><span>${html(record.tag)} · ${html(record.id)}</span><h2>${html(record.title)}</h2></div><button type="button" class="dialog-close" aria-label="Close record">×</button></header>
        <div class="record-dialog-layout">${viewerMarkup(record)}<aside class="record-detail"><p class="record-lead">${html(record.description)}</p><dl class="record-detail-meta"><div><dt>Date</dt><dd>${html(record.date)}</dd></div><div><dt>Language</dt><dd>${html(record.language)}</dd></div><div><dt>Notation</dt><dd>${html(record.notation)}</dd></div><div><dt>Voices / material</dt><dd>${html(record.voices)}</dd></div><div><dt>Record state</dt><dd>${html(record.status)}</dd></div></dl>${record.comparison ? `<a class="record-article-link" href="${html(record.comparison)}" target="_blank" rel="noreferrer">Open witness comparison data ↗</a>` : ""}${record.article ? `<a class="record-article-link" href="${html(record.article)}" target="_blank" rel="noreferrer">Read local demonstration article ↗</a>` : ""}${record.external ? `<a class="record-article-link" href="${html(record.external)}" target="_blank" rel="noreferrer">Open DIAMM archive record ↗</a>` : ""}${relatedMarkup(record)}</aside></div>
        <p class="prototype-note">All DEMO-MS/SRC/WRK content, images and scholarly interpretations are fictional test fixtures. The IIIF canvas and score alignment is functional demonstration data only.</p></div>`;
    document.body.append(modal);
    modal.showModal();
    modal.querySelector(".dialog-close").addEventListener("click", () => modal.close());
    modal.addEventListener("close", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
    modal.querySelectorAll("[data-open-record]").forEach((button) => button.addEventListener("click", () => { modal.close(); openRecord(button.dataset.openRecord); }));
    modal.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
      if (button.disabled) return;
      const showFolio = button.dataset.view === "folio";
      modal.querySelector("[data-viewer-folio]").hidden = !showFolio;
      modal.querySelector("[data-viewer-score]").hidden = showFolio;
      modal.querySelectorAll("[data-view]").forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
    }));
    drawScore(modal.querySelector("[data-viewer-score]"), record);
    initialiseManifest(modal, record);
  }

  async function loadCatalogue() {
    try {
      const [sources, works] = await Promise.all([fetch(asset("08_catalog/sources.json")).then((response) => response.json()), fetch(asset("08_catalog/works.json")).then((response) => response.json())]);
      records = [...sources.map((source) => sourceRecord(source, works)), ...works.map((work) => workRecord(work, sources)), ...specialRecords()];
      const notationValues = [...new Set(records.map((record) => record.notation))].sort((a, b) => a.localeCompare(b));
      notation.innerHTML = `<option value="all">Any notation</option>${notationValues.map((value) => `<option value="${html(value)}">${html(value)}</option>`).join("")}`;
      const requestedType = new URLSearchParams(window.location.search).get("type");
      if ([...type.options].some((option) => option.value === requestedType)) type.value = requestedType;
      loading.hidden = true;
      renderRecords();
    } catch {
      loading.textContent = "The supplied catalogue files could not be loaded.";
    }
  }

  [search, type, notation].forEach((control) => control.addEventListener("input", renderRecords));
  clear.addEventListener("click", () => { search.value = ""; type.value = "all"; notation.value = "all"; renderRecords(); search.focus(); });
  results.addEventListener("click", (event) => { const button = event.target.closest("[data-open-record]"); if (button) openRecord(button.dataset.openRecord); });
  loadCatalogue();
}
