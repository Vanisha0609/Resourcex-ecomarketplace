import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWkNNbq1k6UMjcQr_qIp7n4sAkuhgODK8",
  authDomain: "regen-market.firebaseapp.com",
  projectId: "regen-market",
  storageBucket: "regen-market.firebasestorage.app",
  messagingSenderId: "628210137413",
  appId: "1:628210137413:web:3bb20ec082c33e7394a62c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, db }; 
