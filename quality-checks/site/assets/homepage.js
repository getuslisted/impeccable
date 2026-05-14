/*
  Quality Checks: homepage section / variant controller.
  Reads /_data/homepage.json and applies visibility + variant selection.
  Graceful no-JS fallback: HTML ships with sensible defaults active.
*/
(function () {
  "use strict";
  var CONFIG_URL = "/_data/homepage.json";
  var STORAGE_KEY = "qc:homepage-config";
  var DOC = document;
  function applyConfig(config) {
    if (!config || !Array.isArray(config.sections)) return;
    config.sections.forEach(function (section) {
      if (!section || !section.id) return;
      var el = DOC.querySelector('[data-section="' + section.id + '"]');
      if (!el) return;
      if (section.visible === false) { el.setAttribute("hidden", ""); el.setAttribute("aria-hidden", "true"); }
      else { el.removeAttribute("hidden"); el.removeAttribute("aria-hidden"); }
      var variantNodes = el.querySelectorAll("[data-variant]");
      if (!variantNodes.length) return;
      var wanted = section.variant; var matched = false;
      variantNodes.forEach(function (node) {
        var isActive = node.getAttribute("data-variant") === wanted;
        node.classList.toggle("is-active", isActive);
        if (isActive) matched = true;
      });
      if (!matched && variantNodes[0]) variantNodes[0].classList.add("is-active");
    });
    DOC.documentElement.setAttribute("data-homepage-ready", "1");
  }
  function loadFromCache() { try { var raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); } catch (_) { return null; } }
  function loadFromNetwork() { return fetch(CONFIG_URL, { credentials: "same-origin", cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); }
  var cached = loadFromCache();
  if (cached) applyConfig(cached);
  loadFromNetwork().then(function (config) { applyConfig(config); try { window.localStorage && window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch (_) {} }).catch(function (err) { if (!cached && window.console) console.info("homepage.json unavailable, using HTML defaults:", err.message); });
})();
