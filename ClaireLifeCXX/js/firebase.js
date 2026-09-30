import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc
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

        const unsubscribe =
            onAuthStateChanged(auth, user => {

                unsubscribe();

                if (user) {
                    resolve(user);
                } else {
                    reject(
                        new Error("ログインしてください")
                    );
                }

            });

    });
}


// ===================================
// 通知許可・FCM登録
// ===================================

async function requestNotificationPermission() {

    console.log("========== 通知診断開始 ==========");

    try {

        // --------------------------------
        // ① Notification API
        // --------------------------------

        console.log(
            "Notification:",
            "Notification" in window
        );

        if (!("Notification" in window)) {

            console.error(
                "Notification APIがありません"
            );

            alert(
                "この環境では通知を利用できません。"
            );

            return null;
        }


        // --------------------------------
        // ② 現在の通知許可状態
        // --------------------------------

        console.log(
            "現在の通知許可:",
            Notification.permission
        );


        // --------------------------------
        // ③ Service Worker確認
        // --------------------------------

        console.log(
            "Service Worker:",
            "serviceWorker" in navigator
        );

        if (!("serviceWorker" in navigator)) {

            console.error(
                "Service Workerが利用できません"
            );

            alert(
                "Service Workerを利用できません。"
            );

            return null;
        }


        // --------------------------------
        // ④ Service Worker登録
        // --------------------------------

        console.log(
            "Service Workerを登録しています..."
        );

        const registration =
            await navigator.serviceWorker.register(
                "service-worker.js"
            );

        console.log(
            "Service Worker登録成功:",
            registration
        );


        // --------------------------------
        // ⑤ Service Worker準備待ち
        // --------------------------------

        const readyRegistration =
            await navigator.serviceWorker.ready;

        console.log(
            "Service Worker準備完了:",
            readyRegistration
        );


        // --------------------------------
        // ⑥ 通知許可
        // --------------------------------

        let permission =
            Notification.permission;

        if (permission !== "granted") {

            console.log(
                "通知許可を要求します..."
            );

            permission =
                await Notification.requestPermission();

            console.log(
                "通知許可の結果:",
                permission
            );
        }


        // --------------------------------
        // ⑦ 許可されなかった場合
        // --------------------------------

        if (permission !== "granted") {

            console.error(
                "通知が許可されませんでした:",
                permission
            );

            alert(
                "通知が許可されませんでした。\n\n" +
                "現在の状態: " +
                permission
            );

            return null;
        }


        console.log(
            "通知が許可されています"
        );


        // --------------------------------
        // ⑧ FCMトークン取得
        // --------------------------------

        console.log(
            "FCMトークンを取得しています..."
        );

        const token =
            await getToken(messaging, {

                vapidKey:
                    "BH2ZEVLCrhVTFl5v00WOxuYlckb_26OXtHbjMJ-LCV56s-kTzb4U5YT4gbCb-TRiSrGilEwZ1W2w1JRVkIgMOtM",

                serviceWorkerRegistration:
                    readyRegistration

            });


        // --------------------------------
        // ⑨ トークン確認
        // --------------------------------

        console.log(
            "FCMトークン:",
            token
        );


        if (!token) {

            console.error(
                "FCMトークンが取得できませんでした"
            );

            alert(
                "iPhoneの通知許可はできましたが、" +
                "Firebaseへの通知登録に失敗しました。"
            );

            return null;
        }


        // --------------------------------
        // ⑩ 成功
        // --------------------------------

        console.log(
            "========== 通知登録成功 =========="
        );

        alert(
            "🔔 通知の設定が完了しました！"
        );

        return token;


    } catch (error) {

        console.error(
            "========== 通知エラー =========="
        );

        console.error(
            "エラー:",
            error
        );

        console.error(
            "エラー名:",
            error.name
        );

        console.error(
            "エラーメッセージ:",
            error.message
        );

        alert(
            "通知設定でエラーが発生しました。\n\n" +
            "エラー名: " +
            error.name +
            "\n\n" +
            "内容: " +
            error.message
        );

        return null;
    }
}


// ===================================
// FCM前面通知
// ===================================

onMessage(messaging, payload => {

    console.log(
        "通知を受信:",
        payload
    );

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            payload.notification?.title ||
            "ClaireLife",
            {
                body:
                    payload.notification?.body ||
                    "新しい通知があります"
            }
        );

    }

});


// ===================================
// 外部から使えるようにする
// ===================================

export {
    db,
    auth,
    userCollection,
    userDoc,
    waitForUser,
    requestNotificationPermission
};
