// src/configFirebase/Firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserSessionPersistence 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Use session-based persistence (no localStorage, survives tab refresh)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('🛡️ Firebase session persistence enabled');
  })
  .catch((error) => {
    console.error('⚠️ Failed to set Firebase persistence:', error);
  });

export { auth };
