---
title: Show Markdown source inside Markdown
author: Example Documentation Team
---

A guide can show both an explanation and the exact Markdown a developer should write. Use a longer outer fence when the example includes its own code fences.

## A complete page example

````markdown
---
title: Example setup guide
author: Example Documentation Team
---

Start with a brief introduction.

## Install

```sh
npm install
```

- [x] Read the guide.
- [ ] Try the command locally.
````

The outer fence contains four backticks; the inner shell fence contains three. That keeps the entire example together as one code block.

## Literal markup

```html
<strong>This is displayed as source code.</strong>
<script>
  console.log("This example does not run.");
</script>
```

Raw HTML is not rendered as authored page content. Put markup in a code fence when readers need to inspect it.

## Try it

Compare the literal HTML in this code block with the safety demonstration on **Start here**. The code block preserves the characters for reading and copying.
