---
title: Fenced code blocks
author: Example Documentation Team
---

Fenced code preserves indentation and punctuation. A language label describes the example; this site does not currently apply syntax highlighting.

## TypeScript

```ts
interface ExamplePage {
  title: string;
  author?: string;
}

const page: ExamplePage = {
  title: "Deployment checklist",
  author: "Example Documentation Team",
};

console.log(page.title);
```

## JSON

```json
{
  "name": "Example workspace",
  "publicDocumentation": true,
  "sections": ["Guides", "Reference"]
}
```

## Shell commands

```sh
npm install
npm run dev
```

Run these from the repository directory when setting up a local preview.

## Plain text

```text
public/wiki/
  markdown/
    basics/
    code/
    gfm/
  exploring/
```

## Try it

Copy the page and compare the code indentation with the source. Code examples are text to read and copy; they do not execute in the browser.
