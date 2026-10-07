import type { CollectionEntry } from "astro:content";
import { statSync } from "node:fs";
import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { withBase, wikiHref } from "./base";

export type WikiEntry = CollectionEntry<"wiki">;

export interface WikiPageLink {
  id: string;
  title: string;
  href: string;
}

export interface WikiFolder {
  name: string;
  folders: WikiFolder[];
  pages: WikiPageLink[];
}

export interface SearchDocument {
  id: string;
  title: string;
  headings: string;
  body: string;
  href: string;
  updatedAt: string;
}

function compareNames(first: string, second: string): number {
  return (
    first.localeCompare(second, undefined, {
      numeric: true,
      sensitivity: "base",
    }) || first.localeCompare(second)
  );
}

export function updatedAtFor(entry: WikiEntry): string {
  try {
    if (!entry.filePath) throw new Error("Source path is unavailable");
    return statSync(entry.filePath).mtime.toISOString();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not read filesystem modification time for ${entry.id}: ${detail}`,
    );
  }
}

export function buildNavigation(
  entries: WikiEntry[],
  base = import.meta.env.BASE_URL,
): WikiFolder {
  const root: WikiFolder = { name: "", folders: [], pages: [] };
  for (const entry of entries) {
    const parts = entry.id.split("/").filter(Boolean);
    const file = parts.pop();
    if (!file) continue;
    let parent = root;
    for (const name of parts) {
      let folder = parent.folders.find((candidate) => candidate.name === name);
      if (!folder) {
        folder = { name, folders: [], pages: [] };
        parent.folders.push(folder);
      }
      parent = folder;
    }
    parent.pages.push({
      id: entry.id,
      title: entry.data.title,
      href: wikiHref(entry.id, base),
    });
  }

  const sort = (folder: WikiFolder): void => {
    folder.folders.sort((a, b) => compareNames(a.name, b.name));
    folder.pages.sort((a, b) => compareNames(a.title, b.title));
    folder.folders.forEach(sort);
  };
  sort(root);
  return root;
}

export function sourceBodyText(markdown: string): {
  headings: string[];
  body: string;
} {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as MarkdownNode;
  const headings: string[] = [];
  const body: string[] = [];
  const textOf = (node: MarkdownNode): string => {
    if (
      node.type === "text" ||
      node.type === "inlineCode" ||
      node.type === "code"
    )
      return node.value ?? "";
    if (node.type === "image") return node.alt ?? "";
    return (node.children ?? []).map(textOf).filter(Boolean).join(" ");
  };
  for (const node of tree.children ?? []) {
    const text = textOf(node).replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (node.type === "heading") headings.push(text);
    else body.push(text);
  }
  return { headings, body: body.join("\n") };
}

interface MarkdownNode {
  type: string;
  value?: string;
  alt?: string;
  children?: MarkdownNode[];
}

export function headingAnchors(
  headings: Array<{ depth: number; slug: string; text: string }>,
): Array<{ depth: number; slug: string; text: string }> {
  const slugger = new GithubSlugger();
  return headings.map((heading) => ({
    ...heading,
    // Astro uses GitHub-compatible heading IDs; retaining the renderer slug avoids duplicate-ID drift.
    slug: heading.slug || slugger.slug(heading.text),
  }));
}

export function searchIndexUrl(base = import.meta.env.BASE_URL): string {
  return withBase("search-index.json", base);
}

export { wikiHref };
