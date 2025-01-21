import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBA80E2oupp1pmSuZCEXN9TfnZ1CQXuts",
  authDomain: "gymtracker-42628.firebaseapp.com",
  projectId: "gymtracker-42628",
  storageBucket: "gymtracker-42628.firebasestorage.app",
  messagingSenderId: "179865169864",
  appId: "1:179865169864:web:1c8c1bb159dcc6f5455afd",
  measurementId: "G-0JP5VNMSVK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
