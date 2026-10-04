
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configuration Firebase UNGRIFF
const firebaseConfig = {
  apiKey: "TA_CLE_API"AIzaSyDLHStsHHHdRCoy9IKqY3_nRnJ4z4RngCo,
  authDomain: "ungriff-13423.firebaseapp.com",
  projectId: "ungriff-13423",
  storageBucket: "ungriff-13423.firebasestorage.app",
  messagingSenderId: "670145342809",
  appId: "1:670145342809:web:6bad75b2581ff63361f048"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Connexion Google
export function connecterGoogle() {
  return signInWithPopup(auth, provider);
}

// Déconnexion
export function deconnecter() {
  return signOut(auth);
}

// Suivre l'état de connexion
export function suivreConnexion(callback) {
  return onAuthStateChanged(auth, callback);
}
