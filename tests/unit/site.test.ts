import { describe, expect, it } from "vitest";
import MiniSearch from "minisearch";
import {
  buildNavigation,
  sourceBodyText,
  type SearchDocument,
} from "../../src/lib/wiki";
import {
  contrastRatio,
  isHexColor,
  themeStyle,
  validateTheme,
} from "../../src/lib/theme";
import { rankResults, excerptFor } from "../../src/lib/search";
import { wikiFrontmatterSchema } from "../../src/lib/frontmatter-schema";

function entry(id: string, title: string) {
  return { id, data: { title } } as never;
}

describe("wiki content helpers", () => {
  it("requires a non-empty title and permits an optional author", () => {
    expect(wikiFrontmatterSchema.safeParse({ title: "FAQ" }).success).toBe(
      true,
    );
    expect(
      wikiFrontmatterSchema.safeParse({ title: "FAQ", author: "Support" })
        .success,
    ).toBe(true);
    expect(wikiFrontmatterSchema.safeParse({ author: "Support" }).success).toBe(
      false,
    );
    expect(wikiFrontmatterSchema.safeParse({ title: "  " }).success).toBe(
      false,
    );
  });

  it("sorts folders before alphabetized pages at every level", () => {
    const tree = buildNavigation(
      [
        entry("zebra", "Zebra page"),
        entry("alpha/folder-page", "Folder page"),
        entry("beta/child", "Child page"),
        entry("alpha/alpha-page", "Alpha page"),
      ],
      "/docs/",
    );

    expect(tree.folders.map((folder) => folder.name)).toEqual([
      "alpha",
      "beta",
    ]);
    expect(tree.pages[0]?.title).toBe("Zebra page");
    expect(tree.folders[0]?.pages.map((page) => page.title)).toEqual([
      "Alpha page",
      "Folder page",
    ]);
    expect(tree.folders[0]?.pages[0]?.href).toBe(
      "/docs/wiki/alpha/alpha-page/",
    );
  });

  it("extracts searchable text and headings from Markdown and GFM", () => {
    const extracted = sourceBodyText(
      "## Setup\n\nUse **bold text** and `npm run build`.\n\n- [x] Ready",
    );
    expect(extracted.headings).toEqual(["Setup"]);
    expect(extracted.body).toContain("bold text");
    expect(extracted.body).toContain("npm run build");
    expect(extracted.body).toContain("Ready");
  });
});

describe("theme configuration", () => {
  it("accepts six-digit colors and rejects invalid values", () => {
    expect(isHexColor("#a1B2c3")).toBe(true);
    expect(isHexColor("red")).toBe(false);
    expect(() =>
      validateTheme({ primary: "#123", secondary: "#ffffff" }),
    ).toThrow(/six-digit/);
  });

  it("uses the documented default colors when omitted", () => {
    const css = themeStyle({ primary: "#000000" });
    expect(css).toContain("--theme-secondary:#16A085");
  });

  it("provides contrasting foreground colors and readable link colors", () => {
    const css = themeStyle({ primary: "#ffff00", secondary: "#00ffff" });
    expect(css).toContain("--theme-primary-text:#000000");
    expect(css).toContain("--theme-secondary-text:#000000");
    expect(contrastRatio("#000000", "#ffff00")).toBeGreaterThanOrEqual(4.5);
    expect(css).toContain("--theme-primary-link-light:");
  });
});

describe("search ranking", () => {
  const docs: SearchDocument[] = [
    {
      id: "old-title",
      title: "Needle",
      headings: "",
      body: "unrelated",
      href: "/wiki/old-title/",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "new-title",
      title: "Needle latest",
      headings: "",
      body: "unrelated",
      href: "/wiki/new-title/",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "heading",
      title: "Guide",
      headings: "Needle setup",
      body: "unrelated",
      href: "/wiki/heading/",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "body",
      title: "Article",
      headings: "Intro",
      body: "A needle in searchable content.",
      href: "/wiki/body/",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
  ];

  it("orders by title, heading, and body match tiers, then recency", () => {
    const index = new MiniSearch<SearchDocument>({
      fields: ["title", "headings", "body"],
      storeFields: ["id", "title", "headings", "body", "href", "updatedAt"],
    });
    index.addAll(docs);
    const results = rankResults(index, "needle");
    expect(results.map((result) => result.id)).toEqual([
      "new-title",
      "old-title",
      "heading",
      "body",
    ]);
    expect(results[0]?.excerpt.toLowerCase()).toContain("needle");
    expect(rankResults(index, "  ")).toEqual([]);
  });

  it("returns an excerpt containing the matching term", () => {
    const excerpt = excerptFor(
      "needle",
      "a ".repeat(140) + "needle appears near the end of this searchable text",
      80,
    );
    expect(excerpt.toLowerCase()).toContain("needle");
    expect(excerpt.length).toBeLessThanOrEqual(82);
  });
});
