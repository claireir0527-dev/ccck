import { db, auth } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const STYLE_ID = "clairelife-inapp-style";
const BOX_ID = "clairelife-inapp-message";

function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${BOX_ID}{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:20px}
      #${BOX_ID}.show{display:flex}
      #${BOX_ID} .cl-message-card{width:min(360px,100%);background:#fff;border-radius:22px;padding:24px;box-shadow:0 14px 45px rgba(0,0,0,.25);font-family:"Yu Gothic",sans-serif}
      #${BOX_ID} .cl-message-title{font-size:20px;font-weight:700;margin-bottom:10px}
      #${BOX_ID} .cl-message-body{font-size:15px;line-height:1.7;white-space:pre-wrap;margin-bottom:18px}
      #${BOX_ID} .cl-message-actions{display:flex;gap:10px;justify-content:flex-end}
      #${BOX_ID} button{border:0;border-radius:999px;padding:10px 18px;font-size:14px;cursor:pointer}
      #${BOX_ID} .cl-close{background:#eee;color:#333}
      #${BOX_ID} .cl-action{background:#6b3df5;color:#fff}
    `;
    document.head.appendChild(style);
}

function closeMessage(box) {
    box.classList.remove("show");
    setTimeout(() => box.remove(), 180);
}

function showMessage(data) {
    const id = String(data.id || data.messageId || "current");
    const seenKey = `clairelife_inapp_seen_${id}`;
    if (localStorage.getItem(seenKey) === "1") return;

    addStyle();
    const old = document.getElementById(BOX_ID);
    if (old) old.remove();

    const box = document.createElement("div");
    box.id = BOX_ID;
    box.innerHTML = `
      <div class="cl-message-card" role="dialog" aria-modal="true">
        <div class="cl-message-title"></div>
        <div class="cl-message-body"></div>
        <div class="cl-message-actions">
          <button class="cl-close" type="button">閉じる</button>
          <button class="cl-action" type="button" style="display:none"></button>
        </div>
      </div>`;

    box.querySelector(".cl-message-title").textContent = data.title || "お知らせ";
    box.querySelector(".cl-message-body").textContent = data.body || "";

    const close = () => {
        localStorage.setItem(seenKey, "1");
        closeMessage(box);
    };
    box.querySelector(".cl-close").addEventListener("click", close);
    box.addEventListener("click", e => { if (e.target === box) close(); });

    if (data.buttonText && data.link) {
        const btn = box.querySelector(".cl-action");
        btn.textContent = data.buttonText;
        btn.style.display = "inline-block";
        btn.addEventListener("click", () => {
            localStorage.setItem(seenKey, "1");
            location.href = data.link;
        });
    }

    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add("show"));
}

function startInAppMessage() {
    if (!auth.currentUser) return;
    const ref = doc(db, "appMessages", "current");
    onSnapshot(ref, snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data.active !== true) return;
        showMessage({ ...data, id: data.messageId || snap.id });
    }, err => console.warn("アプリ内メッセージ:", err));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startInAppMessage, { once: true });
} else {
    startInAppMessage();
}
