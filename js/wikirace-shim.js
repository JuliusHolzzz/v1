/**
 * WikiRace — disconnect from Base44 cloud.
 * All API traffic stays on this origin (Supabase via server.js).
 */
(function () {
  const BLOCK = ["base44.app", "base44.com", "media.base44.com"];

  function isBlocked(url) {
    if (!url) return false;
    const s = String(url);
    return BLOCK.some((host) => s.includes(host));
  }

  const origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input?.url;
    if (isBlocked(url)) {
      return Promise.reject(new Error("Base44 disabled — using Supabase backend"));
    }
    return origFetch(input, init);
  };

  const OrigXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new OrigXHR();
    const origOpen = xhr.open;
    xhr.open = function (method, url) {
      if (isBlocked(url)) {
        throw new Error("Base44 disabled — using Supabase backend");
      }
      return origOpen.apply(this, arguments);
    };
    return xhr;
  };
  window.XMLHttpRequest.prototype = OrigXHR.prototype;

  window.__WIKIRACE_BACKEND__ = "supabase";
})();
