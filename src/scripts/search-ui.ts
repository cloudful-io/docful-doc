import MiniSearch from "minisearch";
import { rankResults } from "../lib/search";
import type { SearchDocument } from "../lib/wiki";

const form = document.querySelector<HTMLFormElement>("[data-search-form]");
const input = document.querySelector<HTMLInputElement>("[data-search-input]");
const resultsPanel = document.querySelector<HTMLElement>(
  "[data-search-results]",
);
const status = document.querySelector<HTMLElement>("[data-search-status]");
const list = document.querySelector<HTMLOListElement>("[data-search-list]");
const shortcutHint = document.querySelector<HTMLElement>(
  "[data-search-shortcut]",
);
if (input && shortcutHint) {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  shortcutHint.textContent = isMac ? "⌘ K" : "Ctrl K";
  input.setAttribute("aria-keyshortcuts", isMac ? "Meta+K" : "Control+K");
}

let searchIndex: MiniSearch<SearchDocument> | undefined;
let indexPromise: Promise<MiniSearch<SearchDocument>> | undefined;

function loadIndex(): Promise<MiniSearch<SearchDocument>> {
  if (searchIndex) return Promise.resolve(searchIndex);
  if (indexPromise) return indexPromise;
  indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Search index could not be loaded.");
      const serialized = await response.json();
      return MiniSearch.loadJSON<SearchDocument>(JSON.stringify(serialized), {
        fields: ["title", "headings", "body"],
        storeFields: ["id", "title", "headings", "body", "href", "updatedAt"],
      });
    })
    .then((loaded) => {
      searchIndex = loaded;
      return loaded;
    });
  return indexPromise;
}

function showResults(query: string): void {
  if (!resultsPanel || !status || !list) return;
  list.replaceChildren();
  if (!query.trim()) {
    status.textContent = "Enter a search term to search all pages.";
    resultsPanel.hidden = false;
    return;
  }
  status.textContent = "Searching documentation…";
  resultsPanel.hidden = false;
  void loadIndex()
    .then((index) => {
      const matches = rankResults(index, query);
      list.replaceChildren();
      status.textContent =
        matches.length === 0
          ? "No matching pages found."
          : `${matches.length} matching ${matches.length === 1 ? "page" : "pages"}.`;
      for (const match of matches.slice(0, 30)) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        const excerpt = document.createElement("p");
        link.href = match.href;
        link.textContent = match.title;
        excerpt.textContent = match.excerpt;
        item.append(link, excerpt);
        list.append(item);
      }
    })
    .catch(() => {
      status.textContent =
        "Search is unavailable right now. The documentation pages are still available from navigation.";
    });
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  showResults(input?.value ?? "");
});

input?.addEventListener("input", () => {
  if (input.value.trim()) showResults(input.value);
  else if (resultsPanel) resultsPanel.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && resultsPanel && !resultsPanel.hidden) {
    event.preventDefault();
    resultsPanel.hidden = true;
    input?.focus();
  }

  if (
    event.key === "k" &&
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey
  ) {
    const active = document.activeElement;
    const isEditable =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement ||
      (active instanceof HTMLElement && active.isContentEditable);
    if (isEditable && active !== input) return;

    event.preventDefault();
    input?.focus();
    input?.select();
  }
});
