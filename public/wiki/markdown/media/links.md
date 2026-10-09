---
title: Links and autolinks
author: Example Documentation Team
---

Links connect related topics. These examples use several CommonMark and GFM link forms.

## Inline and reference links

[Read the tables example](../../gfm/tables/) to inspect alignment and formatting inside cells.

A [reference-style link][checklist] keeps its destination separate from the paragraph. Reuse [the same checklist link][checklist] elsewhere on the page.

[checklist]: ../../gfm/task-lists/

## Same-page anchors

[Jump to the link review checklist](#link-review-checklist). Heading anchors also appear in the in-page table of contents.

## Autolinks

An explicit autolink: <https://example.com>

GFM also recognizes a bare address: https://example.com

These external addresses are illustrative. The examples do not depend on an external service.

## Relative wiki links

Links above target generated page routes, including the trailing slash, rather than source `.md` files. Because they are relative, they also resolve when the site is hosted below a path prefix such as `/docs/`.

## Link review checklist

- [ ] Follow the local tables link.
- [ ] Follow the reference-style checklist link.
- [ ] Use the same-page anchor.
- [ ] Inspect the URL after each navigation.
