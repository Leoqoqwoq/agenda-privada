/* global importScripts, firebase, clients */
/**
 * Service Worker para mensagens FCM em background.
 * As chaves públicas são lidas de um arquivo gerado em runtime pelo app,
 * ou você pode preencher firebaseConfig abaixo após criar o projeto.
 */
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js"
);

// Preencha com as mesmas chaves públicas NEXT_PUBLIC_FIREBASE_* (não são secretas).
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || undefined,
  authDomain: self.FIREBASE_AUTH_DOMAIN || undefined,
  projectId: self.FIREBASE_PROJECT_ID || undefined,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: self.FIREBASE_APP_ID || undefined,
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ("focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG" && event.data.config) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(event.data.config);
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
          const title = payload.notification?.title || "Lembrete da Agenda";
          self.registration.showNotification(title, {
            body: payload.notification?.body || "",
            data: payload.data || {},
          });
        });
      }
    } catch (err) {
      console.warn("FCM SW config error", err);
    }
  }
});

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  try {
    firebase.initializeApp(firebaseConfig);
    firebase.messaging().onBackgroundMessage((payload) => {
      const title = payload.notification?.title || "Lembrete da Agenda";
      self.registration.showNotification(title, {
        body: payload.notification?.body || "",
        data: payload.data || {},
      });
    });
  } catch (err) {
    console.warn("FCM SW init skipped", err);
  }
}
