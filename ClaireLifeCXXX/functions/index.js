const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
setGlobalOptions({ region: "asia-northeast1", maxInstances: 10 });

const db = getFirestore();
const messaging = getMessaging();

function makeTitle(type) {
  return type === "notice" ? "📢 ClaireLife 通知" : "📚 ClaireLife 提出物";
}

function makeBody(type, data) {
  if (type === "notice") {
    const text = data.text || "新しい通知があります";
    return `新しい通知：${text}`;
  }
  const title = data.title || "新しい提出物があります";
  const date = data.date ? `（提出日：${data.date}）` : "";
  return `新しい提出物：${title}${date}`;
}

async function getUniqueTokens() {
  const snap = await db.collectionGroup("fcmTokens").get();
  const seen = new Set();
  const entries = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const token = typeof data.token === "string" ? data.token.trim() : "";
    if (!token || seen.has(token)) continue;
    seen.add(token);
    entries.push({ ref: doc.ref, token });
  }

  return entries;
}

async function sendToAllRegisteredDevices(type, data, eventId) {
  const logRef = db.collection("notificationLogs").doc(eventId);

  // Firestoreイベントの再試行で同じ通知を二重送信しないためのロック。
  const locked = await db.runTransaction(async (tx) => {
    const existing = await tx.get(logRef);
    if (existing.exists && existing.data()?.status === "sent") return false;
    tx.set(logRef, {
      status: "sending",
      type,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return true;
  });

  if (!locked) return { skipped: true, sent: 0 };

  const entries = await getUniqueTokens();
  if (entries.length === 0) {
    await logRef.set({ status: "sent", sent: 0, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { skipped: false, sent: 0 };
  }

  let sent = 0;
  let failed = 0;
  const badRefs = [];

  // FCMは1回のsendEachで最大500メッセージ。
  for (let i = 0; i < entries.length; i += 500) {
    const batch = entries.slice(i, i + 500);
    const messages = batch.map(({ token }) => ({
      token,
      notification: {
        title: makeTitle(type),
        body: makeBody(type, data)
      },
      webpush: {
        notification: {
          tag: `clairelife-${eventId}`,
          renotify: false
        }
      },
      data: {
        type,
        eventId,
        url: "./index.html"
      }
    }));

    const response = await messaging.sendEach(messages);

    response.responses.forEach((result, index) => {
      if (result.success) {
        sent += 1;
        return;
      }
      failed += 1;
      const code = result.error?.code || "";
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        badRefs.push(batch[index].ref);
      }
    });
  }

  // 使えなくなったトークンは次回から送信しない。
  await Promise.all(badRefs.map((ref) => ref.delete()));

  await logRef.set({
    status: "sent",
    sent,
    failed,
    removedInvalidTokens: badRefs.length,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  return { skipped: false, sent, failed };
}

exports.notifyAllOnNoticeCreated = onDocumentCreated(
  "users/{userId}/notices/{noticeId}",
  async (event) => {
    const data = event.data?.data() || {};
    await sendToAllRegisteredDevices("notice", data, `notice-${event.params.userId}-${event.params.noticeId}`);
  }
);

exports.notifyAllOnSubmitCreated = onDocumentCreated(
  "users/{userId}/submits/{submitId}",
  async (event) => {
    const data = event.data?.data() || {};
    await sendToAllRegisteredDevices("submit", data, `submit-${event.params.userId}-${event.params.submitId}`);
  }
);

// 現在登録されている通知先を全削除するための管理用関数。
// これを1回実行してから各端末で通知を再登録すると、古いトークンを一掃できます。
exports.resetAllFcmTokens = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です。");
  }

  // 最初の運用では、ログイン済みユーザー自身が1回だけ実行できます。
  // 実行後は全端末が再登録されるまで通知は届きません。
  const snap = await db.collectionGroup("fcmTokens").get();
  const refs = snap.docs.map((d) => d.ref);

  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  return { deleted: refs.length };
});
