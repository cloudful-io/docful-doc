export {};

const button = document.querySelector<HTMLButtonElement>("[data-copy-page]");
const status = document.querySelector<HTMLElement>("[data-copy-status]");
const content = document.querySelector<HTMLElement>("[data-wiki-content]");

button?.addEventListener("click", async () => {
  if (!content || !status) return;
  try {
    await navigator.clipboard.writeText(content.innerText.trim());
    status.textContent = "Page text copied.";
  } catch {
    status.textContent =
      "Could not copy automatically. Select the page text and copy it manually.";
  }
});
