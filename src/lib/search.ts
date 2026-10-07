import type MiniSearch from "minisearch";
import type { SearchDocument } from "./wiki";

export interface RankedSearchResult extends SearchDocument {
  score: number;
  match?: Record<string, string[]>;
  tier: number;
  excerpt: string;
}

export function resultTier(
  match: Record<string, string[]> | undefined,
): number {
  const fields = Object.values(match ?? {}).flat();
  if (fields.includes("title")) return 0;
  if (fields.includes("headings")) return 1;
  return 2;
}

export function excerptFor(
  query: string,
  body: string,
  maxLength = 190,
): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const lower = normalized.toLocaleLowerCase();
  const matchAt =
    terms
      .map((term) => lower.indexOf(term.toLocaleLowerCase()))
      .find((index) => index >= 0) ?? 0;
  const start = Math.max(
    0,
    Math.min(
      matchAt - Math.floor(maxLength * 0.28),
      normalized.length - maxLength,
    ),
  );
  const excerpt = normalized.slice(start, start + maxLength).trim();
  return `${start > 0 ? "…" : ""}${excerpt}${start + maxLength < normalized.length ? "…" : ""}`;
}

export function rankResults(
  index: MiniSearch<SearchDocument>,
  query: string,
): RankedSearchResult[] {
  if (!query.trim()) return [];
  const found = index.search(query, {
    fields: ["title", "headings", "body"],
    boost: { title: 8, headings: 3, body: 1 },
    prefix: true,
    fuzzy: 0.2,
  });
  return found
    .map((result) => ({
      ...(result as unknown as SearchDocument),
      score: result.score,
      match: result.match as Record<string, string[]> | undefined,
      tier: resultTier(result.match as Record<string, string[]> | undefined),
      excerpt: excerptFor(
        query,
        [
          (result as unknown as SearchDocument).title,
          (result as unknown as SearchDocument).headings,
          (result as unknown as SearchDocument).body,
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    }))
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
        b.score - a.score ||
        a.title.localeCompare(b.title),
    );
}
