/*
  Quality Checks: homepage admin editor.
*/
(function () {
  "use strict";
  var CONFIG_URL = "/_data/homepage.json";
  var STORAGE_KEY = "qc:homepage-config";
  var DOC = document;
  var state = { config: null, originalConfig: null };
  var sectionsEl = DOC.querySelector('[data-role="sections"]');
  var jsonEl = DOC.querySelector('[data-role="json"]');
  var statusEl = DOC.querySelector('[data-role="status"]');
  function setStatus(msg, kind) { if (!statusEl) return; statusEl.textContent = msg; statusEl.dataset.kind = kind || "info"; }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function renderJson() { if (!jsonEl) return; jsonEl.textContent = JSON.stringify(state.config, null, 2); }
  function renderSections() {
    if (!sectionsEl || !state.config) return;
    sectionsEl.innerHTML = "";
    state.config.sections.forEach(function (section, idx) {
      var wrap = DOC.createElement("article");
      wrap.className = "admin-section";
      wrap.dataset.visible = section.visible ? "true" : "false";
      wrap.dataset.sectionId = section.id;
      var head = DOC.createElement("div"); head.className = "admin-section__head";
      var titleBlock = DOC.createElement("div");
      var h3 = DOC.createElement("h3"); h3.className = "admin-section__title"; h3.textContent = (idx + 1) + ". " + (section.label || section.id); titleBlock.appendChild(h3);
      var desc = DOC.createElement("p"); desc.className = "admin-section__desc"; desc.textContent = section.description || ("Section id: " + section.id); titleBlock.appendChild(desc);
      head.appendChild(titleBlock);
      var toggleLabel = DOC.createElement("label"); toggleLabel.className = "admin-toggle";
      var toggle = DOC.createElement("input"); toggle.type = "checkbox"; toggle.checked = section.visible !== false;
      toggle.setAttribute("aria-label", "Toggle visibility for " + section.id);
      toggle.addEventListener("change", function () { state.config.sections[idx].visible = toggle.checked; wrap.dataset.visible = toggle.checked ? "true" : "false"; renderJson(); setStatus("Modified. Click Save to apply.", "warn"); });
      toggleLabel.appendChild(toggle); toggleLabel.appendChild(DOC.createTextNode("Visible")); head.appendChild(toggleLabel);
      wrap.appendChild(head);
      if (Array.isArray(section.available) && section.available.length) {
        var variants = DOC.createElement("div"); variants.className = "admin-variants"; variants.setAttribute("role", "group"); variants.setAttribute("aria-label", "Design variant for " + section.id);
        section.available.forEach(function (variantName) {
          var btn = DOC.createElement("button"); btn.type = "button"; btn.className = "admin-variant" + (variantName === section.variant ? " is-selected" : ""); btn.dataset.variant = variantName; btn.textContent = variantName;
          btn.setAttribute("aria-pressed", variantName === section.variant ? "true" : "false");
          btn.addEventListener("click", function () {
            state.config.sections[idx].variant = variantName;
            variants.querySelectorAll(".admin-variant").forEach(function (b) { var isSel = b.dataset.variant === variantName; b.classList.toggle("is-selected", isSel); b.setAttribute("aria-pressed", isSel ? "true" : "false"); });
            renderJson(); setStatus("Modified. Click Save to apply.", "warn");
          });
          variants.appendChild(btn);
        });
        wrap.appendChild(variants);
      }
      sectionsEl.appendChild(wrap);
    });
  }
  function loadInitial() {
    setStatus("Loading...");
    var saved = null; try { var raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY); if (raw) saved = JSON.parse(raw); } catch (_) {}
    fetch(CONFIG_URL, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (canonical) {
      state.originalConfig = clone(canonical); state.config = saved || clone(canonical);
      renderSections(); renderJson();
      setStatus(saved ? "Loaded from local override. Click Reset to revert." : "Loaded from homepage.json.", "ok");
    }).catch(function (err) { setStatus("Failed to load homepage.json: " + err.message, "error"); });
  }
  function save() { if (!state.config) return; try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config)); setStatus("Saved. Reload / open the homepage to preview.", "ok"); } catch (e) { setStatus("Could not save: " + e.message, "error"); } }
  function download() {
    if (!state.config) return;
    var data = JSON.stringify(state.config, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = DOC.createElement("a"); a.href = url; a.download = "homepage.json";
    DOC.body.appendChild(a); a.click(); DOC.body.removeChild(a); URL.revokeObjectURL(url);
    setStatus("Downloaded homepage.json.", "ok");
  }
  function copyJson() {
    if (!state.config) return;
    var data = JSON.stringify(state.config, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data).then(function () { setStatus("Copied JSON to clipboard.", "ok"); }, function (err) { setStatus("Copy failed: " + err.message, "error"); });
    } else {
      var range = DOC.createRange(); range.selectNode(jsonEl); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      setStatus("Clipboard API unavailable. The JSON is selected; press Cmd/Ctrl+C.", "warn");
    }
  }
  function reset() {
    if (!state.originalConfig) return;
    state.config = clone(state.originalConfig);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    renderSections(); renderJson(); setStatus("Reset to the bundled homepage.json.", "ok");
  }
  DOC.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.dataset) return;
    if (t.dataset.action === "save") save();
    else if (t.dataset.action === "download") download();
    else if (t.dataset.action === "copy") copyJson();
    else if (t.dataset.action === "reset") reset();
  });
  loadInitial();
})();
