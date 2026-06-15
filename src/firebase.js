import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkCrXkQ9OmxUN6Lq0qWjvXbnQG7offrsk",
  authDomain: "arisan-pkk.firebaseapp.com",
  projectId: "arisan-pkk",
  storageBucket: "arisan-pkk.firebasestorage.app",
  messagingSenderId: "739311603986",
  appId: "1:739311603986:web:e716b52e42bde1577123cb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);