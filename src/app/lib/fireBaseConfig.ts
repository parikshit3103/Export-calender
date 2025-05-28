// lib/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBcF0P3f71HcIjCyv85kYgzU2tk3vA8VpI",
  authDomain: "vmccp-2530a.firebaseapp.com",
  databaseURL: "https://vmccp-2530a-default-rtdb.firebaseio.com",
  projectId: "vmccp-2530a",
  storageBucket: "vmccp-2530a.firebasestorage.app",
  messagingSenderId: "665956561431",
  appId: "1:665956561431:web:8865d0565929ad7fe52252",
  measurementId: "G-6VS0VST3GG"
};

// ✅ Correct way to initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Export Firebase services
export const database = getDatabase(app); // Realtime Database
export const auth = getAuth(app);         // Firebase Auth
export default app;