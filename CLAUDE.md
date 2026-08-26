# notes.toin.in

Markdown notes web app. React + Vite frontend with Firebase backend (Firestore + rules in repo), hosted on Cloudflare Pages.

## Commands
- `npm start` — Vite dev server
- `npm run build` — `tsc && vite build`
- `npm test` — vitest suite (jsdom + Testing Library)
- `npm run preview` — preview the build

## Layout
- `src/` — React + TypeScript app; markdown editing via `@uiw/react-md-editor`, math via remark-math/rehype-katex (sanitized before KaTeX), UI via Ant Design
- `firebase.json`, `firestore.rules` — Firebase config and security rules; rules are email-scoped to the single owner account (review rules when changing data access)
- Hosted on Cloudflare Pages; `build/` is output
- `.github/workflows/backup.yml` — monthly scheduled Firestore backup, encrypted with age before upload

## Notes
- Tests run under vitest via `npm test`.
- Changing Firestore document shapes requires matching updates to `firestore.rules`.
- Editing a note patches only `note.body`; `id`, `title`, and `noteType` are fixed at creation.
