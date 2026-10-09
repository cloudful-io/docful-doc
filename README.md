# docful-doc

docful-doc is a standalone documentation site for help, FAQ, and development documentation. A host-application developer clones or forks this project, adds Markdown under `public/wiki`, configures the site, deploys it independently, and links to the resulting URL from their application.

Explore the [deployed example](https://docful-doc.vercel.app/) to try the documentation site's features.

## Run locally

Requires Node.js 22.12 or later and npm.

```sh
npm install
npm run dev
```

## Add documentation

Create `.md` files under `public/wiki`. The title is required; author is optional:

```markdown
---
title: Getting started
author: Documentation Team
---

Write the page content here.

## A section

Headings generate section anchors and an in-page table of contents.
```

Folders create nested navigation. At every level, folders appear before pages, and folders and page titles are sorted alphabetically. The site supports CommonMark and GFM tables, fenced code blocks, task lists, and autolinks. Raw HTML is not rendered.

## Configure an instance

Edit `src/site.config.ts`:

```ts
export const siteConfig = {
  title: "Product Help",
  logo: "branding/logo.svg", // optional file at public/branding/logo.svg
  theme: {
    primary: "#2457D6",
    secondary: "#16A085",
  },
} as const;
```

Set the logo to a path relative to `public/`; it is displayed at no more than 100 CSS pixels high. Colors must be six-digit hexadecimal values. Defaults are used in the starter configuration. Text and interactive accents derive accessible foreground shades from the configured colors.

Readers can select Light, Dark, or Auto appearance. Auto is the default and follows the browser or device color-scheme preference. An explicit Light or Dark choice is stored in that browser.

## Build and deploy

```sh
npm run check
npm run build
npm run preview
```

Connect the repository to Vercel; `vercel.json` configures the Astro build and `dist` output. Vercel's generated URL can be used directly or replaced with a custom domain. Each host application links to its standalone documentation URL.

The default deployment is at the root of its hostname. To build for a path prefix such as `/docs/`, set `DOCFUL_BASE_PATH=/docs/` in the deployment environment. The host application's routing layer must forward requests for that prefix to this Vercel deployment.

## Commands

See [docs/development.md](docs/development.md) for lint, typecheck, test, end-to-end, and benchmark commands. See [docs/content-contract.md](docs/content-contract.md) for the authoring and rendering contract.
