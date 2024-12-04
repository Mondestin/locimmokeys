import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBdkbyCvO0j0qCZC1VdTMoxpLj1lw3CAE8",
  authDomain: "gestionscles.firebaseapp.com",
  projectId: "gestionscles",
  storageBucket: "gestionscles.firebasestorage.app",
  messagingSenderId: "600143472988",
  appId: "1:600143472988:web:0d13ecccd9a2c73d523999",
  measurementId: "G-Q8VLH3L1PN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };