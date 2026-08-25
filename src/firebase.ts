import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration.
// These values are public identifiers, not secrets; access is controlled
// by Firebase Security Rules and API key restrictions in Google Cloud.
const firebaseConfig = {
  apiKey: "AIzaSyCMF3KEZuv9ybwoVtRN7CXzMUQ1ppWmCCk",
  authDomain: "toin-notes.firebaseapp.com",
  projectId: "toin-notes",
  storageBucket: "toin-notes.appspot.com",
  messagingSenderId: "81961763470",
  appId: "1:81961763470:web:dca378897fc7e69d3bffdf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };