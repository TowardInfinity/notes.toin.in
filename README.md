# notes app

## Idea behind

This is a hobby project.

I wanted a personal note taking app. I could have created a full user login but that was not the idea it is for personal single person use.

On Landing page it asks for password directly on deployment i set the environment variable for email which is used inside the project.

Create quick note, markdown support, save code snippets for this markdown is used.

Notes are sorted by time.

## Screen SHots

* [Login](/screenshots/login.png)
* [Home](/screenshots/home.png)
* [Quick Note Add](/screenshots/add-quick-note.png)
* [Quick Note View](/screenshots/view-quick-note.png)
* [Markdown Note Add](/screenshots/add-markdown-note.png)
* [Markdown Note View](/screenshots/view-markdown-note.png)

## Tech used

* Authentication: [Firebase Authentication Email/Password](https://firebase.google.com/docs/auth)

* For db: [Cloud Firestore](https://firebase.google.com/docs/firestore)

* hosting: [vercel](https://vercel.com/) or firebase Hosting

* UI Components: [antd](https://ant.design/)

## Authentication Setup

* Enable Email/Password Auth from Firebase
* Add User to firebase.
* for local add it to .env file.

```env
REACT_APP_EMAIL=jogn@doe.com
```

add your email for login.

if you are deploying add it to your deployment env.

## Firebase Config

[Firebase config](/src/firebase.ts)

update `firebaseConfig` according to your setup.

### Cloud Firestore

Enable it, setup rules.

![Cloud Firestore](/screenshots/Cloud-Firestore.png)

configure db as per shown in screenshot.

```js
note: <map>
  body: <string>
  id: <string>
  noteType: <string>
  title: <string>
```

## Start local server

```bash
npm install
npm start
```

## create Build

```bash
npm install
npm run build
```
