/**
 * Parses Wikipedia article HTML to make it game-playable.
 * Preserves authentic Wikipedia styling — only wiki-internal /wiki/ links become clickable.
 */
export const parseArticleContent = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove Wikipedia chrome that shouldn't appear in-game
  const removeSelectors = [
    "script",
    "style",
    ".mw-editsection",
    ".mw-editsection-like",
    "#toc",
    ".toc",
    ".sistersitebox",
    ".hatnote.navigation-not-searchable",
    ".navbox",
    ".navbox-styles",
    ".vertical-navbox",
    ".mbox-small",
    ".plainlinks.dmbox",
    "#coordinates",
    ".geo-nondefault",
    ".geo-multi-punct",
    "#jump-to-nav",
    ".mw-jump-link",
    '[role="note"]',
  ];
  doc.querySelectorAll(removeSelectors.join(",")).forEach(el => el.remove());

  // Process all anchor tags
  doc.querySelectorAll("a").forEach(a => {
    const href = a.getAttribute("href") ?? "";

    // Valid game link: internal Wikipedia article link, no special pages
    const isArticleLink =
      href.startsWith("/wiki/") &&
      !href.includes(":") &&
      !href.startsWith("/wiki/Main_Page");

    if (isArticleLink) {
      const target = href.replace("/wiki/", "");
      a.setAttribute("data-target", decodeURIComponent(target));
      a.setAttribute("data-wiki-link", "true");
      a.removeAttribute("href");
      // Keep all existing classes — they carry Wikipedia blue-link styling
    } else {
      // Non-article links become non-interactive spans
      const span = doc.createElement("span");
      span.innerHTML = a.innerHTML;
      span.className = a.className;
      a.replaceWith(span);
    }
  });

  // Return only the inner content of mw-parser-output if present, else full body
  const parserOutput = doc.querySelector(".mw-parser-output");
  return parserOutput ? parserOutput.innerHTML : doc.body.innerHTML;
};
