# Product Requirements

## Product summary

docful-doc is a standalone documentation site for web applications. Each host-app developer creates an instance by cloning or forking the docful-doc GitHub project, configures it for that application, and deploys it at a URL they choose. It presents Markdown files as a navigable wiki for help, FAQ, and development documentation. Site creators can brand the site, while readers can browse its page hierarchy, search page content, and copy page content for use in other applications. The application that the documentation supports links to the separately hosted instance by URL.

## Goals

- Turn Markdown files into wiki pages with a clear title and readable content.
- Help readers find pages through a complete, hierarchical navigation and full-text search.
- Help readers jump between sections within a wiki page using an in-page table of contents.
- Let site creators customize the site title, logo, and primary and secondary theme colors.
- Let readers choose light, dark, or automatic appearance.
- Make page content easy to reuse by providing a copy action.
- Show page authors when available and show when each page was last updated.

## Non-goals

- A browser-based editor or content management system for creating and editing Markdown files.
- Requirements for authentication, authorization, or per-page access control.
- A particular web framework, hosting provider, search engine, or Markdown implementation.
- Runtime integration with, or embedding as a component inside, the application that links to the documentation site.

## Users and use cases

| User                       | Need                                                              | Desired outcome                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Site creator               | Present documentation under a recognizable site identity          | Customize the displayed site title, logo, and primary and secondary theme colors                                                                |
| Documentation author       | Publish help, FAQ, or development information from Markdown files | Have each file available as a wiki page, with an optional author attribution                                                                    |
| Host application developer | Create and operate a documentation instance for the application   | Clone or fork the docful-doc GitHub project, configure and deploy an instance, then link to its URL                                             |
| Documentation reader       | Find and read relevant information comfortably                    | Open the standalone site, browse the page hierarchy or search all wiki pages, choose a preferred appearance, then copy page content when needed |

### PR-5: Standalone site delivery

- **Description:** docful-doc shall be deployed as a standalone website with its own URL.
- **Priority:** Must
- **Acceptance criteria:**
  - Readers can access the documentation site directly by URL.
  - A host-application developer can create an instance by cloning or forking the docful-doc GitHub project.
  - The developer configures and deploys the standalone instance at a URL they choose; the application links to that URL without embedding or importing docful-doc.
  - An instance can be deployed either at the root of its own hostname or beneath a configurable URL path prefix, such as `/docs/`.
  - Page routes, navigation links, search results, and static asset URLs work correctly under either deployment base.
  - The documentation site can be built and deployed independently of the host application.

## Functional requirements

### PR-1: Markdown wiki pages

- **Description:** The documentation site shall present Markdown files as wiki pages.
- **Priority:** Must
- **Acceptance criteria:**
  - Each wiki page has a title and content.
  - A page may include an author; pages without an author remain available and readable.
  - Page title and optional author are read from YAML frontmatter; Markdown body is the page content.
  - Page content uses CommonMark plus GitHub Flavored Markdown tables, fenced code blocks, task lists, and autolinks.
  - Raw HTML in Markdown is not rendered.
  - The site displays the source file's actual last-modified date and time for each page.
  - The rendered page provides an action to copy its rendered text for pasting into another application, rather than the Markdown source.

### PR-2: Site identity and theme

- **Description:** Site creators shall be able to customize the documentation site's displayed title, logo, and primary and secondary theme colors.
- **Priority:** Must
- **Acceptance criteria:**
  - The site displays the configured title and logo.
  - The title, logo, and primary and secondary theme colors are customizable for a documentation site through its instance configuration.
  - A configured logo is displayed at no more than 100 CSS pixels high; no other logo format or dimension constraints apply.
  - Theme colors accept standard six-digit hexadecimal color values, with documented defaults used when a color is not configured.
  - The primary color is used for prominent branding and interactive accents; the secondary color is used for supporting accents.
  - Text and controls retain WCAG 2.2 AA contrast against configured theme colors; the interface chooses a suitable foreground color or uses an accessible alternative treatment where needed.

### PR-3: Page navigation and hierarchy

- **Description:** Readers shall be able to navigate to all wiki pages through a page navigation area. Folders shall represent nested page hierarchy.
- **Priority:** Must
- **Acceptance criteria:**
  - Navigation includes every wiki page represented by a Markdown file.
  - Folder structure is reflected as hierarchy in navigation.
  - At each level, folders appear before pages; folders and pages are each sorted alphabetically within their parent folder.
  - The navigation area can be collapsed and reopened.
  - The collapse/expand control is a compact icon button at the left side of the site header, adjacent to the site identity; its accessible name announces the current action (hide or show navigation, or open or close navigation on mobile).
  - When collapsed, the wiki content area can use the space made available by the collapsed navigation.

### PR-4: Full-text search

- **Description:** A search toolbar shall search the text of all wiki pages.
- **Priority:** Must
- **Acceptance criteria:**
  - Readers can enter a search query in a toolbar available on the documentation site.
  - Search considers the content of every wiki page, including pages in nested folders.
  - Search matches page titles, headings, and body text without regard to letter case.
  - Results rank title matches above heading matches, and heading matches above body-only matches.
  - Within each match-rank group, results are sorted by last-updated timestamp, most recent first.
  - Results include a short excerpt containing matching text and link to the matching page.
  - An empty query displays no results.

### PR-6: Reader appearance

- **Description:** Readers shall be able to switch the site's appearance between light, dark, and automatic modes.
- **Priority:** Must
- **Acceptance criteria:**
  - The appearance control offers Light, Dark, and Auto choices.
  - Auto is the default and follows the reader's browser or device color-scheme preference.
  - Choosing Light or Dark applies that appearance regardless of the browser or device preference.
  - An explicit choice is remembered in the reader's browser and restored on later visits; selecting Auto returns control to the browser or device preference.
  - All page surfaces, navigation, search, controls, and text remain readable and meet WCAG 2.2 AA contrast in each appearance mode, including when creator-configured theme colors are used.

### PR-7: In-page table of contents

- **Description:** Wiki pages with section headings shall provide an in-page table of contents so readers can jump directly to a section.
- **Priority:** Must
- **Acceptance criteria:**
  - The table of contents is generated from the rendered page's Markdown headings, excluding the page title.
  - Each entry links to its corresponding section using a stable heading anchor.
  - Heading hierarchy is reflected in the table of contents, and selecting an entry navigates to the section within the current page.
  - The table of contents is available by keyboard and exposed as a labeled navigation landmark to assistive technology.
  - Pages without section headings do not display an empty table of contents.
  - On desktop and tablet, the table of contents is presented alongside page content; on mobile, it remains accessible without reducing the reading area unnecessarily.

## Quality requirements

- **Usability:** Page navigation can be collapsed to provide more room for reading wiki content.
- **Content reuse:** Readers can copy wiki page content for pasting into other applications.
- **Accessibility:** Meet WCAG 2.2 Level AA for navigation, search, copy and appearance controls, logo presentation, and text and control contrast in light and dark modes.
- **Performance targets (approved):** On a representative documentation corpus, meet Core Web Vitals good thresholds at the 75th percentile, measured separately for mobile and desktop: LCP no more than 2.5 seconds, INP no more than 200 milliseconds, and CLS no more than 0.1. Search results should update within 200 milliseconds at the 75th percentile. ([Core Web Vitals thresholds](https://web.dev/articles/vitals))
- **Performance benchmark (approved):** Use a baseline corpus of 500 Markdown pages containing 5 MB of searchable text, with nested folders up to five levels deep and a mix of short FAQ entries and longer technical pages. Add a stress corpus of 2,000 pages and 20 MB of searchable text. Test the latest stable Chrome on a representative desktop and mid-range mobile device, with cold cache and documented CPU/network conditions. Run 30 page-load trials per device class and report the 75th percentile for LCP and CLS; exercise 50 representative search queries on both a cold and warmed index and report the 75th-percentile response time. Validate field Core Web Vitals at the 75th percentile separately for mobile and desktop once sufficient usage data is available.
- **Compatibility:** The interface shall be usable on desktop, tablet, and mobile form factors and support the latest stable releases of Chrome, Edge, Firefox, and Safari on supported form factors.
- **Timestamp display:** Treat the file's last-updated value as an absolute timestamp and display it in the reader's local timezone, with the timezone indicated.
- **Reliability, privacy, and security:** Applicable targets and requirements are **to be defined**.

## Constraints and assumptions

### Constraints

- Wiki page source content is stored in Markdown files.
- Markdown files are located under `public/wiki`; folders within that directory express nested page hierarchy.
- Folders are used to express page nesting.
- Each page must have a title and content; author is optional.
- Page metadata is stored in YAML frontmatter, with a required `title` field and optional `author` field; the Markdown body contains page content.
- Markdown uses CommonMark plus GitHub Flavored Markdown tables, fenced code blocks, task lists, and autolinks. Raw HTML is not rendered.
- The displayed last-updated date and time comes from the source Markdown file's actual last-modified timestamp.
- The last-modified timestamp is the filesystem modification time captured during the site build; Git history is not used as a fallback.
- GitHub repository timezone is not used; timestamps are displayed in the reader's local timezone with the timezone indicated.
- A host-application developer clones or forks the GitHub project and owns the configuration, deployment, and URL for that instance.
- The host application and its docful-doc instance are deployed independently; the host application links to the instance's chosen URL.
- Each instance can be configured for either hostname-root hosting or path-prefix hosting; path-prefix hosting requires the hosting application's routing layer to forward the chosen prefix to the standalone deployment.

## Open questions

## Out of scope

- Editing Markdown page content in the documentation site.
- Implementing architecture or deployment choices before the proposed decisions are reviewed and approved.
