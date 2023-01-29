// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMF3KEZuv9ybwoVtRN7CXzMUQ1ppWmCCk",
  authDomain: "toin-notes.firebaseapp.com",
  databaseURL: "https://toin-notes-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toin-notes",
  storageBucket: "toin-notes.appspot.com",
  messagingSenderId: "81961763470",
  appId: "1:81961763470:web:dca378897fc7e69d3bffdf",
  measurementId: "G-S7FKFMBM33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

export {auth, database, firestore};