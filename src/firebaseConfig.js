import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";


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
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

const storage = getStorage(app); 

export { app, auth, googleProvider, db ,storage}; 
