# Wiki content contract

## Content type

| Type      | Purpose                                                               | Location              |
| --------- | --------------------------------------------------------------------- | --------------------- |
| Wiki page | Help, FAQ, and development documentation rendered as a navigable page | `public/wiki/**/*.md` |

## Frontmatter schema

| Field    | Type   | Required | Rules                                                                          |
| -------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `title`  | string | Yes      | Non-empty after trimming; displayed as the page title and in navigation/search |
| `author` | string | No       | Non-empty after trimming when provided; displayed with page metadata           |

```yaml
---
title: Getting started
author: Documentation Team
---
```

## Authoring rules

- Markdown file paths under `public/wiki` define page URLs and nested folder hierarchy.
- Use CommonMark plus GFM tables, fenced code blocks, task lists, and autolinks.
- Raw HTML is not rendered. Generated Markdown output is sanitized; unsafe URL protocols are not allowed.
- Section headings generate stable anchors and an in-page table of contents. The page title is separate from the Markdown body and is not included in that table of contents.
- All files under `public/wiki` are public. Do not place secrets or private information there.

## Validation and rendering

- Astro's content collection discovers Markdown recursively and validates frontmatter at build time.
- A Markdown parse error or missing/invalid title fails the build with a file-specific diagnostic.
- The Markdown body is rendered as static HTML. Wiki pages remain readable without browser JavaScript.
- Filesystem modification time is captured during the site build as the page's update timestamp. It is an absolute timestamp, shown in the reader's local timezone with the timezone indicated. Git history is not used as a fallback.
- The full-text index contains page title, section headings, body text, and update timestamp.

## Example file

```markdown
---
title: Account settings
author: Support team
---

Update your profile from the account menu.

## Change your email

Open **Account settings** and enter the new address.
```
