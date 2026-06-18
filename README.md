# Notes App

## Idea Behind

This is a hobby project.

I wanted a personal note-taking app with a modern design and fast performance. I could have created a full multi-user system, but it is intended strictly for personal single-person use.

On the landing page, it asks for a login email/password. In deployment, you set an environment variable for the email, which restricts unauthorized access.

You can create quick notes, write with full markdown support (including code snippets and math), and quickly search through your notes. Notes are automatically sorted by time.

## Screenshots

* [Login](/screenshots/login.png)
* [Home](/screenshots/home.png)
* [Quick Note Add](/screenshots/add-quick-note.png)
* [Quick Note View](/screenshots/view-quick-note.png)
* [Markdown Note Add](/screenshots/add-markdown-note.png)
* [Markdown Note View](/screenshots/view-markdown-note.png)

*(Note: The app has been upgraded to a unified dark theme with glassmorphism UI, so some older screenshots might look a bit different!)*

## Tech Used

* **Build Tool**: [Vite](https://vitejs.dev/) (Migrated from CRA for extremely fast HMR and builds)
* **Authentication**: [Firebase Authentication Email/Password](https://firebase.google.com/docs/auth)
* **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
* **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) 
* **UI Components**: [Ant Design (antd)](https://ant.design/)

## Authentication Setup

1. Enable Email/Password Auth from Firebase.
2. Add your User to Firebase Authentication.
3. For local development, add your email to the `.env` file.

```env
VITE_APP_EMAIL=john@doe.com
```

4. If you are deploying, make sure to add `VITE_APP_EMAIL` to your deployment environment variables (e.g., in Cloudflare Pages settings).

## Firebase Config & Security

### Firebase Credentials

Update the `firebaseConfig` object in [`src/firebase.ts`](/src/firebase.ts) with your project's credentials.

### Cloud Firestore Rules

Enable Firestore and set up the security rules. This project includes a `firestore.rules` file to restrict database access strictly to authenticated users.

For maximum personal security, you should update the `firestore.rules` file to only match your explicit email address (as shown in the inline comments):

```js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Configure your db schema as follows:

```js
note: <map>
  body: <string>
  id: <string>
  noteType: <string>
  title: <string>
```

## Local Development

Start the local dev server using Vite:

```bash
npm install
npm start
```

## Create Production Build

```bash
npm install
npm run build
```

The output will be generated in the `build/` directory, ready to be deployed to Cloudflare Pages.
