import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, doc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js";

const firebaseConfig={apiKey:"AIzaSyBrsFoQdQTiNrS5OcaBhWf9UGSH77Iv7OU",authDomain:"cleair-lab.firebaseapp.com",projectId:"cleair-lab",storageBucket:"cleair-lab.firebasestorage.app",messagingSenderId:"692128366961",appId:"1:692128366961:web:75a8c5d40ba1656d3476d0",measurementId:"G-JB5Q29PE15"};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);
function userCollection(name){if(!auth.currentUser)throw new Error("ログインしてください");return collection(db,"users",auth.currentUser.uid,name)}
function userDoc(name,id){if(!auth.currentUser)throw new Error("ログインしてください");return doc(db,"users",auth.currentUser.uid,name,id)}
function waitForUser(){return new Promise((resolve,reject)=>{if(auth.currentUser)return resolve(auth.currentUser);const u=onAuthStateChanged(auth,x=>{u();x?resolve(x):reject(new Error("ログインしてください"))})})}
export {
    db,
    auth,
    userCollection,
    userDoc,
    waitForUser,
    requestNotificationPermission
};
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("通知が許可されていません");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: "BH2ZEVLCrhVTFl5v00WOxuYlckb_26OXtHbjMJ-LCV56s-kTzb4U5YT4gbCb-TRiSrGilEwZ1W2w1JRVkIgMOtM",
            serviceWorkerRegistration: await navigator.serviceWorker.register(
                "/service-worker.js"
            )
        });

        console.log("FCMトークン:", token);

        return token;

    } catch (error) {
        console.error("通知設定エラー:", error);
        return null;
    }
}

onMessage(messaging, (payload) => {
    console.log("通知を受信:", payload);

    if (Notification.permission === "granted") {
        new Notification(
            payload.notification?.title || "ClaireLife",
            {
                body: payload.notification?.body || "新しい通知があります"
            }
        );
    }
});