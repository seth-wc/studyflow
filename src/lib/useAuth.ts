import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/email-already-in-use": "An account already exists with that email — try signing in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with that email — try creating one instead.",
  "auth/too-many-requests": "Too many attempts — wait a moment and try again.",
  "auth/network-request-failed": "Couldn't reach the server — check your connection.",
};

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return "Something went wrong — please try again.";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string): Promise<string | null> {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch (err) {
      return friendlyError(err);
    }
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (err) {
      return friendlyError(err);
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  return { user, authLoading, signUp, signIn, signOut };
}
