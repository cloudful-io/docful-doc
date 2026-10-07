export {};

const toggle = document.querySelector<HTMLButtonElement>(
  "[data-sidebar-toggle]",
);
const layout = document.querySelector<HTMLElement>("[data-wiki-layout]");
const sidebar = document.querySelector<HTMLElement>("#wiki-sidebar");
const mobileQuery = window.matchMedia("(max-width: 700px)");

if (toggle && layout && sidebar) {
  const storageKey = "docful-doc-nav-collapsed";
  let desktopCollapsed = false;
  try {
    desktopCollapsed = localStorage.getItem(storageKey) === "true";
  } catch {
    // Navigation remains functional for this visit when storage is unavailable.
  }
  let mobileOpen = false;

  const render = () => {
    layout.dataset.navCollapsed = String(
      !mobileQuery.matches && desktopCollapsed,
    );
    layout.dataset.mobileOpen = String(mobileQuery.matches && mobileOpen);
    const expanded = mobileQuery.matches ? mobileOpen : !desktopCollapsed;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.querySelector(".mobile-toggle-label")!.textContent = mobileOpen
      ? "Close navigation"
      : "Open navigation";
    toggle.querySelector(".desktop-toggle-label")!.textContent =
      desktopCollapsed ? "Show navigation" : "Hide navigation";
  };

  toggle.addEventListener("click", () => {
    if (mobileQuery.matches) mobileOpen = !mobileOpen;
    else {
      desktopCollapsed = !desktopCollapsed;
      try {
        localStorage.setItem(storageKey, String(desktopCollapsed));
      } catch {
        // The control still works when persistence is unavailable.
      }
    }
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileOpen) {
      mobileOpen = false;
      render();
      toggle.focus();
    }
  });

  sidebar.addEventListener("click", (event) => {
    if (mobileQuery.matches && (event.target as HTMLElement).closest("a")) {
      mobileOpen = false;
      render();
    }
  });

  mobileQuery.addEventListener("change", () => {
    mobileOpen = false;
    render();
  });
  render();
}
