import { useCallback, useEffect, useState } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { db, messagingPromise } from "./firebase";

const STORAGE_KEY = "otc-push-token";

/** Lets a signed-in user opt in/out of phone push notifications for new
 * Photo Forum posts. Registers a device token in the shared `pushTokens`
 * collection (read only by the Cloud Function that sends the actual push --
 * see functions/index.js -- never by other clients; see firestore.rules). */
export function usePushNotifications(uid: string | undefined) {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagingPromise.then((m) => setSupported(!!m));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    setSubscribed(!!localStorage.getItem(STORAGE_KEY) && Notification.permission === "granted");
  }, []);

  // Show something for messages that arrive while the tab is already open
  // and focused -- FCM only auto-displays a notification for background
  // messages (handled in public/firebase-messaging-sw.js); foreground
  // messages are silent unless the page handles them itself.
  useEffect(() => {
    let unsubscribeMessage: (() => void) | undefined;
    messagingPromise.then((messaging) => {
      if (!messaging) return;
      unsubscribeMessage = onMessage(messaging, (payload) => {
        if (Notification.permission !== "granted") return;
        const title = payload.notification?.title ?? "New Photo Forum post";
        const body = payload.notification?.body ?? "";
        new Notification(title, { body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png` });
      });
    });
    return () => unsubscribeMessage?.();
  }, []);

  const subscribe = useCallback(async () => {
    if (!uid) return;
    setBusy(true);
    setError(null);
    try {
      const messaging = await messagingPromise;
      if (!messaging) {
        setError("Push notifications aren't supported in this browser.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notifications were blocked — enable them in your browser's site settings to turn this on.");
        return;
      }
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}firebase-messaging-sw.js`
      );
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      await setDoc(doc(db, "pushTokens", token), {
        uid,
        token,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, token);
      setSubscribed(true);
    } catch (err) {
      console.error("Failed to subscribe to push notifications", err);
      setError("Couldn't turn on notifications — try again.");
    } finally {
      setBusy(false);
    }
  }, [uid]);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const messaging = await messagingPromise;
      const token = localStorage.getItem(STORAGE_KEY);
      if (messaging) await deleteToken(messaging).catch(() => {});
      if (token) await deleteDoc(doc(db, "pushTokens", token)).catch(() => {});
      localStorage.removeItem(STORAGE_KEY);
      setSubscribed(false);
    } catch (err) {
      console.error("Failed to unsubscribe from push notifications", err);
      setError("Couldn't turn off notifications — try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, subscribed, busy, error, subscribe, unsubscribe };
}
