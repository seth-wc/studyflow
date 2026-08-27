/* eslint-disable no-undef */
// Background push handler for Firebase Cloud Messaging. This runs as its
// own service worker, separate from the PWA's Workbox-generated sw.js.
// It only needs to handle messages that arrive while the app isn't in the
// foreground -- the config values below are the same public Firebase
// client config used everywhere else in the app (see src/lib/firebase.ts
// for why these are safe to have in a plain, unbuilt static file: they're
// not secrets, the real privacy boundary is firestore.rules).
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAm5ni8QcVnsHwkJsXylX9yyfrj9BVwIlw",
  authDomain: "studyflow-70237.firebaseapp.com",
  projectId: "studyflow-70237",
  storageBucket: "studyflow-70237.firebasestorage.app",
  messagingSenderId: "170619221098",
  appId: "1:170619221098:web:1e1d4f2b82caf11dc58613",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Off the Clock Photo Forum";
  const body = payload.notification?.body ?? "Someone posted a new photo.";
  self.registration.showNotification(title, {
    body,
    icon: "/studyflow/icons/icon-192.png",
    data: { url: payload.data?.url ?? "/studyflow/#/forum" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/studyflow/#/forum";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
