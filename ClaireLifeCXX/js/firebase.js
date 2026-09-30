import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js";

// ===================================
// Firebase設定
// ===================================

const firebaseConfig = {
    apiKey: "AIzaSyBrsFoQdQTiNrS5OcaBhWf9UGSH77Iv7OU",
    authDomain: "cleair-lab.firebaseapp.com",
    projectId: "cleair-lab",
    storageBucket: "cleair-lab.firebasestorage.app",
    messagingSenderId: "692128366961",
    appId: "1:692128366961:web:75a8c5d40ba1656d3476d0",
    measurementId: "G-JB5Q29PE15"
};

// ===================================
// Firebase初期化
// ===================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

// ===================================
// ユーザー用コレクション
// ===================================

function userCollection(name) {
    if (!auth.currentUser) {
        throw new Error("ログインしてください");
    }

    return collection(
        db,
        "users",
        auth.currentUser.uid,
        name
    );
}

// ===================================
// ユーザー用ドキュメント
// ===================================

function userDoc(name, id) {
    if (!auth.currentUser) {
        throw new Error("ログインしてください");
    }

    return doc(
        db,
        "users",
        auth.currentUser.uid,
        name,
        id
    );
}

// ===================================
// ログインユーザーを待つ
// ===================================

function waitForUser() {
    return new Promise((resolve, reject) => {
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();

            if (user) {
                resolve(user);
            } else {
                reject(new Error("ログインしてください"));
            }
        });
    });
}

// ===================================
// FCMトークン保存
// ===================================

async function saveFcmToken(token) {
    const user = await waitForUser();

    // トークンそのものをドキュメントIDに使わず、
    // SHA-256で安全な固定長IDにする
    const bytes = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const tokenId = Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    await setDoc(
        doc(
            db,
            "users",
            user.uid,
            "fcmTokens",
            tokenId
        ),
        {
            token: token,
            userId: user.uid,
            updatedAt: serverTimestamp(),
            platform: "web"
        },
        { merge: true }
    );

    return tokenId;
}

// ===================================
// 通知許可・FCM登録
// ===================================

async function requestNotificationPermission() {
    console.log("========== ClaireLife FCM登録開始 ==========");

    try {
        const user = await waitForUser();
        console.log("ログインユーザー:", user.uid);

        if (!("Notification" in window)) {
            throw new Error("このブラウザは通知に対応していません");
        }

        if (!("serviceWorker" in navigator)) {
            throw new Error("このブラウザはService Workerに対応していません");
        }

        // FCM WebはHTTPS環境が必要
        if (location.protocol !== "https:" && location.hostname !== "localhost") {
            throw new Error("通知にはHTTPSが必要です。GitHub Pagesで開いてください");
        }

        // Service Worker登録
        const registration =
            await navigator.serviceWorker.register("service-worker.js");

        await navigator.serviceWorker.ready;

        console.log("Service Worker登録成功:", registration);

        // 通知許可
        let permission = Notification.permission;

        if (permission !== "granted") {
            permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
            throw new Error("通知が許可されませんでした");
        }

        // FCMトークン取得
        const token = await getToken(messaging, {
            vapidKey:
                "BH2ZEVLCrhVTFl5v00WOxuYlckb_26OXtHbjMJ-LCV56s-kTzb4U5YT4gbCb-TRiSrGilEwZ1W2w1JRVkIgMOtM",
            serviceWorkerRegistration: registration
        });

        if (!token) {
            throw new Error("FCMトークンを取得できませんでした");
        }

        console.log("FCMトークン取得成功:", token);

        // Firestoreにユーザーごとに保存
        const tokenId = await saveFcmToken(token);

        console.log("FCMトークン保存成功:", tokenId);
        console.log("========== ClaireLife FCM登録完了 ==========");

        return token;

    } catch (error) {
        console.error("========== ClaireLife FCMエラー ==========");
        console.error(error);

        alert(
            "通知設定でエラーが発生しました。\n\n" +
            error.message
        );

        return null;
    }
}

// ===================================
// 前面表示中の通知
// ===================================

onMessage(messaging, payload => {
    console.log("前面通知を受信:", payload);

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        const title =
            payload.notification?.title || "ClaireLife";

        const body =
            payload.notification?.body || "新しい通知があります";

        new Notification(title, {
            body: body,
            icon: "images/icon.jpg"
        });
    }
});

export {
    db,
    auth,
    userCollection,
    userDoc,
    waitForUser,
    requestNotificationPermission,
    saveFcmToken
};
