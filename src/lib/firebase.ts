import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported, type Messaging } from "firebase/messaging";

// These values are NOT secrets — Firebase's client config is meant to be
// public (it just identifies which project to talk to). The real privacy
// boundary is firestore.rules, which only lets a signed-in user read/write
// their own document. Still pulled from env vars so the actual values live
// in a gitignored .env.local rather than hardcoded, for flexibility.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Push notifications aren't supported everywhere (e.g. some browsers,
// non-HTTPS contexts) -- isSupported() checks that before we ever try to
// call getMessaging(), which throws in unsupported environments. Resolves
// to null there instead of crashing the whole app on load.
export const messagingPromise: Promise<Messaging | null> = isMessagingSupported()
  .then((supported) => (supported ? getMessaging(app) : null))
  .catch(() => null);

// Opt-in only — set VITE_USE_FIREBASE_EMULATOR=true to point at local
// emulators instead of the real project. Off by default so normal local
// development talks to the real (free-tier) Firebase project.
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
