export {};

for (const element of document.querySelectorAll<HTMLTimeElement>(
  "time[data-local-time][datetime]",
)) {
  const date = new Date(element.dateTime);
  if (Number.isNaN(date.getTime())) continue;
  element.textContent = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
  element.title = Intl.DateTimeFormat().resolvedOptions().timeZone;
}
