# Notes App

## Idea Behind

This is a hobby project.

I wanted a personal note-taking app with a modern design and fast performance. I could have created a full multi-user system, but it is intended strictly for personal single-person use.

On the landing page, it asks for a login email/password. The email you see there is set via an environment variable at deploy time and baked into the public bundle — it is UX sugar only (it pre-fills the form). Real access control lives in [`firestore.rules`](/firestore.rules), which scopes every read/write to exactly that one email address, so the corresponding account must exist in Firebase (created manually in the console; there is no self-signup path).

You can create quick notes or write full markdown notes with math rendering ($...$ inline, $$...$$ display, via KaTeX), quickly search through your notes, and notes are sorted newest-first by creation time.

## Screenshots

* [Login](/screenshots/login.png)
* [Home](/screenshots/home.png)
* [Quick Note Add](/screenshots/add-quick-note.png)
* [Quick Note View](/screenshots/view-quick-note.png)
* [Markdown Note Add](/screenshots/add-markdown-note.png)
* [Markdown Note View](/screenshots/view-markdown-note.png)

*(Note: screenshots predate the v0.8 redesign — the app now uses a dark theme with subtle glass accents, so these may look a bit different!)*

## Tech Used

* **Build Tool**: [Vite](https://vitejs.dev/) (Migrated from CRA for extremely fast HMR and builds)
* **Authentication**: [Firebase Authentication Email/Password](https://firebase.google.com/docs/auth)
* **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (with IndexedDB offline persistence)
* **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)
* **UI Components**: [Ant Design (antd)](https://ant.design/)
* **Math Rendering**: [KaTeX](https://katex.org/) via remark-math/rehype-katex
* **Testing**: [Vitest](https://vitest.dev/) + Testing Library

## Authentication Setup

1. Enable Email/Password Auth from Firebase.
2. Add your user to Firebase Authentication — manually from the console, since there is no self-signup path.
3. For local development, add your email to the `.env` file:

```env
VITE_APP_EMAIL=john@doe.com
```

4. If you are deploying, make sure to add `VITE_APP_EMAIL` to your deployment environment variables (e.g., in Cloudflare Pages settings).

To be clear about what this variable does and does not do: it is compiled into the public JavaScript bundle and used purely as UX sugar (pre-filling the login form). Anyone visiting the site can read it, and by itself it restricts nothing. Actual access control is the Firestore rule matching that exact email address (below) — combined with sign-up being disabled so nobody else can ever create an account holding that email.

## Firebase Config & Security

### Firebase Credentials

Update the `firebaseConfig` object in [`src/firebase.ts`](/src/firebase.ts) with your project's credentials.

### Cloud Firestore Rules

Enable Firestore and set up the security rules. This project includes a `firestore.rules` file that restricts database access to a single hard-coded owner email:

```js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email == 'your-email@example.com';
    }
  }
}
```

Replace `your-email@example.com` with your own address (or mirror the shipped `firestore.rules`).

### Manual Hardening Checklist

Done once in the Google Cloud / Firebase consoles:

* **Disable self-registration**: Authentication → Sign-in method → Email/Password — disable open sign-up so strangers cannot even create accounts against this project.
* **Enable App Check** for Firestore and Identity Toolkit.
* **Restrict the web API key** (Google Cloud Console → Credentials): referrer allowlist limited to your hosting domain, API restrictions limited to Identity Toolkit API and Cloud Firestore API.
* **Consider Firestore point-in-time recovery (PITR)** as a safety net against accidental writes/deletes.

### Schema

Configure your db schema as follows:

```js
note: <map>
  body: <string>
  id: <string>
  noteType: <string>   // 'QUICK' | 'MARKDOWN'
  title: <string>
```

At creation time both `id` and `title` are the epoch-milliseconds string (`String(Date.now())`). Displayed titles are derived from the first non-empty line of the body. Editing a note patches **only** `note.body` — `id`, `title`, and `noteType` never change after creation.

## Local Development

Start the local dev server using Vite:

```bash
npm install
npm start
```

## Tests

```bash
npm test
```

Runs the vitest suite (jsdom + Testing Library).

## Create Production Build

```bash
npm install
npm run build
```

The output will be generated in the `build/` directory, ready to be deployed to Cloudflare Pages.

## Backups

A scheduled GitHub Action ([`.github/workflows/backup.yml`](/.github/workflows/backup.yml)) runs on the 1st of every month: it dumps the `notes` collection, encrypts the JSON with [`age`](https://github.com/FiloSottile/age), uploads the encrypted artifact (90-day retention), and deletes the plaintext. Decrypt a downloaded artifact with:

```bash
age -d -i ~/.age/notes-backup-private.key -o notes.json backups/notes-YYYY-MM-DD.json.age
```
