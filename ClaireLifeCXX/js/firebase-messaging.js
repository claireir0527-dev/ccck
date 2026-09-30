// Firebase Cloud Messaging helper
// 実際のFCM登録処理は firebase.js にあります。
// このファイルは今後FCM関連処理を追加するときの入口として使用できます。

export {
    requestNotificationPermission,
    saveFcmToken
} from "./firebase.js";
