// Firebase client init for Google Sign-In
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9uk3F06HwtSogB82TY8nWBkK4uSTGwX4",
  authDomain: "signin-9c34a.firebaseapp.com",
  projectId: "signin-9c34a",
  storageBucket: "signin-9c34a.firebasestorage.app",
  messagingSenderId: "239648282929",
  appId: "1:239648282929:web:f4a93f24d04e6515407810",
  measurementId: "G-62JQS7ST6N",
};

let firebaseApp;
let auth;
let googleProvider;

// Initialize only in browser (prevent SSR issues)
if (typeof window !== "undefined") {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider };
