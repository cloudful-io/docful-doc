import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { wikiFrontmatterSchema } from "./lib/frontmatter-schema";

const wiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./public/wiki", retainBody: true }),
  schema: wikiFrontmatterSchema,
});

export const collections = { wiki };
