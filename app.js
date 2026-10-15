const pilotRecords = [
  { id: "bs-c-001", type: "composition", title: "Alleluia: Nativitas", subtitle: "Three-voice conductus", date: "c. 1220–1250", notation: "mensural", language: "Latin", voices: "3 voices", witness: "2 witnesses", status: "Surviving fragments", tag: "Composition", description: "A pilot composition connected to two manuscript witnesses and a scholarly transcription.", related: ["bs-m-001", "bs-m-004", "bs-e-001"], view: "score" },
  { id: "bs-m-001", type: "manuscript", title: "Cambridge, St John's College, C.111", subtitle: "Fragmentary music manuscript", date: "c. 1230–1260", notation: "mensural", language: "Latin", voices: "2 surviving voices", witness: "4 compositions", status: "IIIF available", tag: "Manuscript", description: "A manuscript source with a demonstrative IIIF canvas and linked musical witnesses.", related: ["bs-c-001", "bs-e-001"], view: "folio" },
  { id: "bs-e-001", type: "edition", title: "Alleluia: Nativitas — scholarly edition", subtitle: "Edition 1.2 · J. Example", date: "2026", notation: "mensural", language: "Latin", voices: "3 voices", witness: "Based on 2 witnesses", status: "Editorial reconstruction", tag: "Edition", description: "A demonstration edition which marks reconstructed readings separately from material preserved in the witnesses.", related: ["bs-c-001", "bs-m-001", "bs-m-004"], view: "split" },
  { id: "bs-m-002", type: "manuscript", title: "Oxford, Bodleian Library, Rawl. D. 913", subtitle: "Composite source", date: "c. 1200–1230", notation: "square", language: "Latin", voices: "1–2 voices", witness: "7 compositions", status: "Metadata only", tag: "Manuscript", description: "A catalogue record remains discoverable when an image cannot be published through the site.", related: ["bs-c-002"], view: "folio" },
  { id: "bs-c-002", type: "composition", title: "Veni sancte spiritus", subtitle: "Two-voice sequence", date: "c. 1200–1230", notation: "square", language: "Latin", voices: "2 voices", witness: "1 witness", status: "Complete witness", tag: "Composition", description: "A composition record with a complete witness and controlled genre, language and notation metadata.", related: ["bs-m-002"], view: "score" },
  { id: "bs-m-003", type: "manuscript", title: "Dublin, Trinity College, MS 276", subtitle: "Music in a theological miscellany", date: "c. 1275–1300", notation: "mixed", language: "Latin / Anglo-Norman", voices: "1–3 voices", witness: "5 compositions", status: "IIIF available", tag: "Manuscript", description: "A mixed-context source used to test multilingual metadata and variable voice counts.", related: ["bs-c-003"], view: "folio" },
  { id: "bs-c-003", type: "composition", title: "Quant je plus", subtitle: "Fragmentary secular song", date: "c. 1275–1300", notation: "mixed", language: "Anglo-Norman", voices: "2 surviving voices", witness: "1 fragment", status: "Surviving fragments", tag: "Composition", description: "A fragmentary witness demonstrates that preserved and presumed voice counts are not the same field.", related: ["bs-m-003", "bs-e-002"], view: "score" },
  { id: "bs-e-002", type: "edition", title: "Quant je plus — diplomatic transcription", subtitle: "Edition 0.8 · pilot transcription", date: "2026", notation: "mixed", language: "Anglo-Norman", voices: "2 surviving voices", witness: "Based on 1 fragment", status: "No reconstruction", tag: "Edition", description: "A diplomatic transcription that deliberately leaves an extant lacuna unresolved.", related: ["bs-c-003", "bs-m-003"], view: "split" },
  { id: "bs-m-004", type: "manuscript", title: "London, British Library, Harley 978", subtitle: "Dispersed source fragment", date: "c. 1240–1270", notation: "mensural", language: "Latin", voices: "3 surviving voices", witness: "2 compositions", status: "External DIAMM record", tag: "Manuscript", description: "An external reference point: its record carries an attribution and a validated outgoing link in production.", related: ["bs-c-001", "bs-e-001"], view: "folio" },
  { id: "bs-c-004", type: "composition", title: "O Maria, maris stella", subtitle: "Two-voice Marian song", date: "c. 1250–1300", notation: "mensural", language: "Latin", voices: "2 voices", witness: "3 witnesses", status: "MEI available", tag: "Composition", description: "A composition used to demonstrate filtering on language, date, voice count and notation.", related: ["bs-m-001", "bs-m-004"], view: "score" }
];

const catalogue = document.querySelector("[data-catalogue]");

if (catalogue) {
  const results = catalogue.querySelector("[data-catalogue-results]");
  const count = catalogue.querySelector("[data-result-count]");
  const empty = catalogue.querySelector("[data-empty-state]");
  const search = catalogue.querySelector("#catalogue-search");
  const type = catalogue.querySelector("#catalogue-type");
  const notation = catalogue.querySelector("#catalogue-notation");
  const clear = catalogue.querySelector("[data-clear-filters]");

  const normalise = (value) => value.toLocaleLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");

  function filteredRecords() {
    const query = normalise(search.value.trim());
    return pilotRecords.filter((record) => {
      const searchable = normalise([record.title, record.subtitle, record.language, record.status, record.tag, record.id, record.description].join(" "));
      return (!query || searchable.includes(query)) &&
        (type.value === "all" || record.type === type.value) &&
        (notation.value === "all" || record.notation === notation.value);
    });
  }

  function renderRecords() {
    const records = filteredRecords();
    count.textContent = records.length;
    empty.hidden = records.length !== 0;
    results.innerHTML = records.map((record, index) => `
      <article class="catalogue-card catalogue-card--${record.type}" style="--card-index:${index}">
        <div class="catalogue-card-top">
          <span>${record.tag}</span><span>${record.id.replace("bs-", "BS-")}</span>
        </div>
        <div class="catalogue-card-copy">
          <h3>${record.title}</h3>
          <p>${record.subtitle}</p>
        </div>
        <dl class="catalogue-meta">
          <div><dt>Date</dt><dd>${record.date}</dd></div>
          <div><dt>Language</dt><dd>${record.language}</dd></div>
          <div><dt>Notation</dt><dd>${record.notation}</dd></div>
          <div><dt>Material</dt><dd>${record.witness}</dd></div>
        </dl>
        <div class="catalogue-card-bottom">
          <span class="record-status">${record.status}</span>
          <button type="button" class="record-open" data-open-record="${record.id}" aria-label="Open ${record.title}">Open <span aria-hidden="true">↗</span></button>
        </div>
      </article>`).join("");
  }

  function openRecord(id) {
    const record = pilotRecords.find((candidate) => candidate.id === id);
    if (!record) return;
    const relatedRecords = record.related.map((relatedId) => pilotRecords.find((candidate) => candidate.id === relatedId)).filter(Boolean);
    const modal = document.createElement("dialog");
    modal.className = "record-dialog";
    modal.innerHTML = `
      <div class="record-dialog-shell">
        <header class="record-dialog-header">
          <div><span>${record.tag} · ${record.id.replace("bs-", "BS-")}</span><h2>${record.title}</h2></div>
          <button type="button" class="dialog-close" aria-label="Close record">×</button>
        </header>
        <div class="record-dialog-layout">
          <section class="viewer-demo" aria-label="Demonstration viewer">
            <div class="viewer-tabs" role="tablist" aria-label="View mode">
              <button type="button" role="tab" aria-selected="${record.view !== "score"}" data-view="folio">Manuscript</button>
              <button type="button" role="tab" aria-selected="${record.view !== "folio"}" data-view="score">Edition</button>
            </div>
            <div class="viewer-canvas" data-viewer-canvas>
              <div class="viewer-folio" data-viewer-folio ${record.view === "score" ? "hidden" : ""}>
                <img src="assets/folio.svg" alt="Illustrative manuscript folio used in the pilot interface" />
                <span class="viewer-label">IIIF canvas / demo</span>
              </div>
              <div class="viewer-score" data-viewer-score ${record.view === "folio" ? "hidden" : ""}>
                <span>MEI / Verovio preview</span>
                <div class="staff-lines"><i></i><i></i><i></i><i></i><i></i></div>
                <div class="score-notes" aria-hidden="true">♩ &nbsp; ♫ &nbsp; ♩ &nbsp; ♩ &nbsp; ♫</div>
                <p>Editorial reconstruction is identified before a score is opened. This pilot uses a visual placeholder until approved MEI files are supplied.</p>
              </div>
            </div>
          </section>
          <aside class="record-detail">
            <p class="record-lead">${record.description}</p>
            <dl class="record-detail-meta">
              <div><dt>Date</dt><dd>${record.date}</dd></div>
              <div><dt>Language</dt><dd>${record.language}</dd></div>
              <div><dt>Notation</dt><dd>${record.notation}</dd></div>
              <div><dt>Voices</dt><dd>${record.voices}</dd></div>
              <div><dt>Record state</dt><dd>${record.status}</dd></div>
            </dl>
            <div class="related-records"><span>Connected records</span>${relatedRecords.map((related) => `<button type="button" data-open-record="${related.id}">${related.tag}: ${related.title}<b aria-hidden="true">→</b></button>`).join("")}</div>
          </aside>
        </div>
        <p class="prototype-note">Pilot interface with fictional catalogue records. Production will load approved metadata, IIIF manifests and MEI only after data and rights validation.</p>
      </div>`;
    document.body.append(modal);
    modal.showModal();
    modal.querySelector(".dialog-close").addEventListener("click", () => modal.close());
    modal.addEventListener("close", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
    modal.querySelectorAll("[data-open-record]").forEach((button) => button.addEventListener("click", () => { modal.close(); openRecord(button.dataset.openRecord); }));
    modal.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
      const isFolio = button.dataset.view === "folio";
      modal.querySelector("[data-viewer-folio]").hidden = !isFolio;
      modal.querySelector("[data-viewer-score]").hidden = isFolio;
      modal.querySelectorAll("[data-view]").forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
    }));
  }

  [search, type, notation].forEach((control) => control.addEventListener("input", renderRecords));
  clear.addEventListener("click", () => { search.value = ""; type.value = "all"; notation.value = "all"; renderRecords(); search.focus(); });
  results.addEventListener("click", (event) => { const button = event.target.closest("[data-open-record]"); if (button) openRecord(button.dataset.openRecord); });
  renderRecords();
}
