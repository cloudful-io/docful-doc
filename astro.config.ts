import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeSanitize from "rehype-sanitize";
import rehypeTaskListLabels from "./src/lib/rehype-task-list-labels";

function deploymentBase(value: string | undefined): string {
  const path = value?.trim() || "/";
  if (!path.startsWith("/")) {
    throw new Error("DOCFUL_BASE_PATH must start with '/'.");
  }
  return path === "/" ? "/" : `/${path.split("/").filter(Boolean).join("/")}/`;
}

export default defineConfig({
  output: "static",
  base: deploymentBase(process.env.DOCFUL_BASE_PATH),
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSanitize, rehypeTaskListLabels],
    }),
    syntaxHighlight: false,
  },
});
