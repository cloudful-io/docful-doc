import MiniSearch from "minisearch";
import { performance } from "node:perf_hooks";

const scenarios = [
  { name: "baseline", count: 500, bytes: 5_000_000 },
  { name: "stress", count: 2_000, bytes: 20_000_000 },
];
const querySet = [
  "installation",
  "account settings",
  "troubleshooting",
  "security policy",
  "API token",
];

for (const scenario of scenarios) {
  const bytesPerPage = Math.floor(scenario.bytes / scenario.count);
  const filler =
    "documentation searchable text configuration installation troubleshooting security policy API token ";
  const docs = Array.from({ length: scenario.count }, (_, index) => {
    const bodyPrefix = `Page ${index} covers ${querySet[index % querySet.length]}. `;
    const body = (
      bodyPrefix + filler.repeat(Math.ceil(bytesPerPage / filler.length))
    ).slice(0, bytesPerPage);
    return {
      id: `page-${index}`,
      title: `Documentation page ${index}`,
      headings: `Topic ${index % 37} ${querySet[index % querySet.length]}`,
      body,
      href: `/wiki/page-${index}/`,
      updatedAt: new Date(
        Date.UTC(2024 + (index % 3), index % 12, 1),
      ).toISOString(),
    };
  });
  const index = new MiniSearch({
    fields: ["title", "headings", "body"],
    storeFields: ["id", "title", "updatedAt"],
  });
  const indexStart = performance.now();
  index.addAll(docs);
  const indexTime = performance.now() - indexStart;
  const coldStart = performance.now();
  index.search(querySet[0], {
    fields: ["title", "headings", "body"],
    boost: { title: 8, headings: 3, body: 1 },
    prefix: true,
    fuzzy: 0.2,
  });
  const coldQuery = performance.now() - coldStart;
  const timings = [];
  for (let i = 0; i < 50; i += 1) {
    const query = querySet[i % querySet.length];
    const start = performance.now();
    index.search(query, {
      fields: ["title", "headings", "body"],
      boost: { title: 8, headings: 3, body: 1 },
      prefix: true,
      fuzzy: 0.2,
    });
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  const p75 = timings[Math.ceil(timings.length * 0.75) - 1];
  console.log(
    `${scenario.name}: ${scenario.count} pages, ${(scenario.bytes / 1_000_000).toFixed(1)} MB searchable body; index ${indexTime.toFixed(1)} ms; cold first query ${coldQuery.toFixed(1)} ms; warmed 50-query response p75 ${p75.toFixed(1)} ms`,
  );
}
