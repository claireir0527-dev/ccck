import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const today = new Date();
today.setHours(0, 0, 0, 0);

const todayText =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

// 提出物は今までどおり localStorage
const submits =
    JSON.parse(localStorage.getItem("submits")) || [];

const submitList = document.getElementById("todaySubmit");

if (submitList) {
    submits.forEach((item) => {
        if (item.date === todayText) {
            submitList.innerHTML += `
                <div class="card">
                    📝 ${item.title}
                    <br>
                    📅 ${item.date}
                </div>
            `;
        }
    });
}

// 通知はFirestore
async function loadTodayNotices() {
    const noticeList = document.getElementById("todayNotice");

    if (!noticeList) {
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "notices"));

        snapshot.docs.forEach((docSnap) => {
            const item = docSnap.data();

            if (item.date === todayText) {
                noticeList.innerHTML += `
                    <div class="card">
                        🔔 ${escapeHtml(item.text)}
                        <br>
                        📅 ${item.date}
                        ${item.time ? `<br>⏰ ${item.time}` : ""}
                    </div>
                `;
            }
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

loadTodayNotices();
