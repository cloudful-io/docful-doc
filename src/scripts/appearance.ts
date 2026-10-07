export {};

const picker = document.querySelector<HTMLElement>("[data-theme-picker]");
const toggle = picker?.querySelector<HTMLButtonElement>(
  "[data-theme-picker-toggle]",
);
const menu = picker?.querySelector<HTMLElement>("[data-theme-picker-menu]");
const currentLabel = picker?.querySelector<HTMLElement>("[data-theme-current]");
const options = picker
  ? Array.from(
      picker.querySelectorAll<HTMLButtonElement>("[data-theme-option]"),
    )
  : [];
const icons = picker
  ? Array.from(picker.querySelectorAll<SVGSVGElement>("[data-theme-icon]"))
  : [];
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const storageKey = "docful-doc-appearance";

type Preference = "auto" | "light" | "dark";

function resolvedTheme(preference: Preference): "light" | "dark" {
  if (preference === "light" || preference === "dark") return preference;
  return colorScheme.matches ? "dark" : "light";
}

function applyPreference(preference: Preference): void {
  document.documentElement.dataset.appearance = preference;
  document.documentElement.dataset.theme = resolvedTheme(preference);
}

if (picker && toggle && menu && currentLabel) {
  let preference: Preference = "auto";
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {
    // Storage may be disabled. The picker remains usable for this page visit.
  }

  const modeName = (value: Preference) =>
    value === "auto" ? "System" : value === "light" ? "Light" : "Dark";

  const render = () => {
    const mode = modeName(preference);
    currentLabel.textContent = mode;
    toggle.setAttribute("aria-label", `Change theme, current mode ${mode}`);
    options.forEach((option) => {
      const selected = option.dataset.themeOption === preference;
      option.setAttribute("aria-checked", String(selected));
      const check = option.querySelector<HTMLElement>("[data-theme-check]");
      if (check) check.hidden = !selected;
    });
    icons.forEach((icon) => {
      icon.toggleAttribute(
        "data-active",
        icon.dataset.themeIcon === preference,
      );
    });
    applyPreference(preference);
  };

  const selectedOption = () =>
    options.find((option) => option.dataset.themeOption === preference) ??
    options[0];

  const closeMenu = (restoreFocus = false) => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    selectedOption()?.focus();
  };

  const choose = (option: HTMLButtonElement) => {
    const value = option.dataset.themeOption;
    if (value !== "auto" && value !== "light" && value !== "dark") return;
    preference = value;
    try {
      if (preference === "auto") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, preference);
    } catch {
      // Apply the selected mode for this visit even if persistence is unavailable.
    }
    render();
    closeMenu(true);
  };

  toggle.addEventListener("click", () => {
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  options.forEach((option) => {
    option.addEventListener("click", () => choose(option));
    option.addEventListener("keydown", (event) => {
      const index = options.indexOf(option);
      let nextIndex: number | undefined;
      if (event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
      if (event.key === "ArrowUp")
        nextIndex = (index - 1 + options.length) % options.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = options.length - 1;
      if (nextIndex !== undefined) {
        event.preventDefault();
        options[nextIndex]?.focus();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    });
  });

  toggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
    }
    if (event.key === "Escape" && !menu.hidden) closeMenu(true);
  });

  document.addEventListener("click", (event) => {
    if (!picker.contains(event.target as Node)) closeMenu();
  });

  picker.addEventListener("focusout", (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget && !picker.contains(nextTarget as Node)) closeMenu();
  });

  window.addEventListener("blur", () => closeMenu());

  colorScheme.addEventListener("change", () => {
    if (preference === "auto") render();
  });

  render();
}
