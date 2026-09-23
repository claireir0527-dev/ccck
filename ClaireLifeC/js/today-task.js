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

async function loadTodayTasks() {
    const list = document.getElementById("todayTaskList");

    if (!list) return;

    try {
        const snapshot = await getDocs(collection(db, "submits"));

        const submits = snapshot.docs
            .map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }))
            .filter((item) => item.date === todayDate);

        list.innerHTML = "";

        submits.forEach((item) => {
            list.innerHTML += `
                <div class="task-card">
                    <div class="task-title">
                        ${escapeHtml(item.title)}
                    </div>

                    <div class="task-date">
                        📅 ${escapeHtml(item.date)}
                        ${item.time ? `　⏰ ${escapeHtml(item.time)}` : ""}
                    </div>

                    <button class="done-btn"
                        onclick="submitTodayTask('${item.id}')">
                        提出済み
                    </button>
                </div>
            `;
        });

    } catch (error) {
        console.error("今日の提出物の読み込みに失敗しました:", error);
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

async function submitTodayTask(id) {
    try {
        await deleteDoc(doc(db, "submits", id));

        const snapshot = await getDocs(collection(db, "submits"));
        const remainToday = snapshot.docs.some(
            (docSnap) => docSnap.data().date === todayDate
        );

        if (!remainToday) {
            location.href = "index.html";
        } else {
            location.reload();
        }

    } catch (error) {
        console.error("提出済み処理に失敗しました:", error);
    }
}

window.submitTodayTask = submitTodayTask;

loadTodayTasks();
