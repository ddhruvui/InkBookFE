# InkBook client

React 19 + Vite single-page app for InkBook, a study notebook organized
Subject → Chapter → Topic, where each topic is a page of typed blocks. Design decisions are in
[`../SPEC.md`](../SPEC.md). The UI follows design system v3 (SPEC decision 11): every color is a
token in `src/index.css`, with a light “paper” theme and a dark “ink” theme.

## Run locally

Start the server first (see [`../server/README.md`](../server/README.md)), then:

```bash
npm install
npm run dev
```

In dev, leave `VITE_API_URL` empty: Vite proxies `/api` to `http://localhost:5001`
(`vite.config.js`).

Other scripts:

```bash
npm run build
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run preview
```

### Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL with no trailing slash. Empty in dev; set to the deployed server URL in production. |

See `.env.example`.

## How it works

- **State** — `src/store/useNotebookStore.js` (Zustand) holds the whole notebook. Edits change
  it locally and autosave after 1.5 s; the save-status pill (Unsaved / Saving… / Saved) or ⌘S saves right away. Each save sends the full state
  with the version it loaded from; if another device saved in between, the server answers 409
  and the client reloads the newer data instead of overwriting it.
- **Undo** — client-side snapshots, up to 20 (⌘Z outside text fields).
- **Search** (⌘K), recents and important marks are computed client-side, so unsaved edits are included.
- **Blocks** — `src/components/blocks/`: text, code, before/after code, math (KaTeX), to-do,
  link, table, image, diagram (SVG), scan. Text and SVG are sanitized with DOMPurify
  (`src/utils/richtext.js`).
- **Tables** — grid editor with Tab / Enter navigation; pastes from Excel, Sheets, Numbers,
  Markdown, CSV, pipe rows and HTML tables (`src/utils/table.js`, mirrored in the mobile app —
  keep them in sync).
- **AI** — 📷 scan wizard (`src/components/scan/ScanWizard.jsx`) and ✦ chapter summaries, via the server's Gemini routes.
- **Export / print** — `src/utils/exportHtml.js` builds the pages; `src/utils/pdf.js` makes the PDF (jspdf + html2canvas).
- **API client** — `src/api.js`.
- **UI kit** — `src/components/ui/` (`Icon` line-icon set, `Button`, `IconButton`, `Modal`,
  `SaveButton` status pill, `ThemeToggle`) and `src/components/layout/TopBar.jsx` (breadcrumbs + actions).
- **Shortcuts** — ⌘K search (↑/↓, Enter, Tab cycles filters), ⌘S save, ⌘Z undo, ⌘\ hide the sidebar, Esc closes.

## Tests

Vitest + Testing Library in jsdom (`src/test/`). `renderApp()` mounts the real routes in a
`MemoryRouter` with a fresh store and a mocked `src/api.js`, over the fixture notebook in
`fixtures.js`. There is one file per page — dashboard, sidebar, chapter, note, search — plus
store helpers.

## Routes

- `/` — dashboard
- `/subject/:s/chapter/:c` — chapter overview
- `/s/:s/c/:c/t/:t` — topic page

## Deploy

Static site on Render, defined in `render.yaml`: `npm ci && npm run build`, publish `dist`,
with a rewrite of every path to `/index.html` so deep links work. Set `VITE_API_URL` in the
Render dashboard — it is read at build time, so redeploy after changing it.
