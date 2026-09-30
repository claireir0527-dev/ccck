importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyBrsFoQdQTiNSr5OcaBhWf9UGSH77Iv7OU",
    authDomain: "cleair-lab.firebaseapp.com",
    projectId: "cleair-lab",
    storageBucket: "cleair-lab.firebasestorage.app",
    messagingSenderId: "692128366961",
    appId: "1:692128366961:web:75a8c5d40ba1656d3476d0"
});

const messaging = firebase.messaging();

// IMPORTANT:
// 通知ペイロード（notification）を含むFCMは、ブラウザ/Firebaseが
// バックグラウンドで自動表示します。ここでshowNotification()すると二重表示になるため、
// notificationペイロードはここでは表示しません。
// data-only通知だけを、このService Workerで1回だけ表示します。
messaging.onBackgroundMessage((payload) => {
    console.log("FCMバックグラウンド通知:", payload);

    if (payload.notification) {
        return;
    }

    const data = payload.data || {};
    const title = data.title || "ClaireLife";
    const body = data.body || "新しい通知があります";
    const messageId = payload.messageId || data.messageId || `${title}:${body}`;

    self.registration.showNotification(title, {
        body,
        icon: "images/icon.jpg",
        tag: `clairelife-${messageId}`,
        renotify: false,
        data: {
            link: data.link || "index.html"
        }
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification?.data?.link || "index.html";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    return client.navigate(targetUrl).then(() => client.focus());
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ===================================
// ClaireLife PWAキャッシュ
// ===================================

const CACHE_NAME = "school-app-v5-fcm-reset";
const files = [
    "index.html",
    "css/style.css"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(files))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/js/")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match("index.html"))
    );
});
