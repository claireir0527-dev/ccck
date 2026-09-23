import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const today = new Date();

const todayDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

async function loadTodayNotices() {
    const list = document.getElementById("todayNoticeList");

    if (!list) {
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "notices"));

        const notices = snapshot.docs
            .map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }))
            .filter((notice) => notice.date === todayDate);

        list.innerHTML = "";

        notices.forEach((notice) => {
            list.innerHTML += `
                <div class="card">
                    <div>
                        🔔 ${escapeHtml(notice.text)}
                        <br>
                        📅 ${notice.date}
                        ${notice.time ? `<br>⏰ ${notice.time}` : ""}
                    </div>

                    <button class="done-btn"
                        onclick="checkTodayNotice('${notice.id}')">
                        確認済み
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("今日の通知の読み込みに失敗しました:", error);
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function checkTodayNotice(id) {
    try {
        await deleteDoc(doc(db, "notices", id));

        const snapshot = await getDocs(collection(db, "notices"));
        const remainToday = snapshot.docs.some(
            (docSnap) => docSnap.data().date === todayDate
        );

        if (!remainToday) {
            location.href = "index.html";
        } else {
            location.reload();
        }
    } catch (error) {
        console.error("通知の確認処理に失敗しました:", error);
    }
}

window.checkTodayNotice = checkTodayNotice;

loadTodayNotices();
