export {};

const control = document.querySelector<HTMLSelectElement>(
  "[data-appearance-control]",
);
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const storageKey = "docful-doc-appearance";

function resolvedTheme(preference: string): "light" | "dark" {
  if (preference === "light" || preference === "dark") return preference;
  return colorScheme.matches ? "dark" : "light";
}

function applyPreference(preference: string): void {
  document.documentElement.dataset.appearance = preference;
  document.documentElement.dataset.theme = resolvedTheme(preference);
}

if (control) {
  let saved = "auto";
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") saved = stored;
  } catch {
    // Storage may be disabled. The control remains usable for the current page.
  }
  control.value = saved;
  applyPreference(saved);

  control.addEventListener("change", () => {
    const preference = control.value;
    try {
      if (preference === "auto") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, preference);
    } catch {
      // Apply the selected mode for this visit even if persistence is unavailable.
    }
    applyPreference(preference);
  });

  colorScheme.addEventListener("change", () => {
    if (control.value === "auto") applyPreference("auto");
  });
}
