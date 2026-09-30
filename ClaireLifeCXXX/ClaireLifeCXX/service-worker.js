importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyBrsFoQdQTiNrS5OcaBhWf9UGSH77Iv7OU",
    authDomain: "cleair-lab.firebaseapp.com",
    projectId: "cleair-lab",
    storageBucket: "cleair-lab.firebasestorage.app",
    messagingSenderId: "692128366961",
    appId: "1:692128366961:web:75a8c5d40ba1656d3476d0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("バックグラウンド通知:", payload);

    // notificationペイロードはFCMが自動で表示するため、
    // ここではshowNotificationを実行しません。
    // これにより同じ通知が2回表示されるのを防ぎます。

    // dataのみのメッセージを送った場合だけ、ここで表示します。
    if (!payload.notification && payload.data) {
        const title = payload.data.title || "ClaireLife";
        const options = {
            body: payload.data.body || "新しい通知があります",
            tag: payload.data.tag || "clairelife-notification"
        };

        self.registration.showNotification(title, options);
    }
});
const CACHE_NAME = "school-app-v2";

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

    // JavaScriptは常に最新を取得する
    if (event.request.url.includes("/js/")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => {
                return caches.match("index.html");
            })
    );

});