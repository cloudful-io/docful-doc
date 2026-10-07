import type { APIRoute } from "astro";
import MiniSearch from "minisearch";
import { getCollection, render } from "astro:content";
import {
  sourceBodyText,
  updatedAtFor,
  wikiHref,
  type SearchDocument,
} from "../lib/wiki";

export const prerender = true;

export const GET: APIRoute = async () => {
  const entries = await getCollection("wiki");
  const documents: SearchDocument[] = await Promise.all(
    entries.map(async (entry) => {
      const { headings } = await render(entry);
      const extracted = sourceBodyText(entry.body ?? "");
      return {
        id: entry.id,
        title: entry.data.title,
        headings: headings.map((heading) => heading.text).join(" "),
        body: extracted.body,
        href: wikiHref(entry.id),
        updatedAt: updatedAtFor(entry),
      };
    }),
  );

  const index = new MiniSearch<SearchDocument>({
    fields: ["title", "headings", "body"],
    storeFields: ["id", "title", "headings", "body", "href", "updatedAt"],
    searchOptions: {
      boost: { title: 8, headings: 3, body: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });
  index.addAll(documents);
  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
