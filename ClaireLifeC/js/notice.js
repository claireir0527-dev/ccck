import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let notices = [];

function showNotice() {
    const list = document.getElementById("noticeList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    notices.forEach((notice) => {
        const div = document.createElement("div");
        div.className = "card";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(notice.date);
        target.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (target - today) / (1000 * 60 * 60 * 24)
        );

        let remainText;
        let remainClass;

        if (diff < 0) {
            remainText = "❌ 期限切れ";
            remainClass = "expired";
        } else if (diff === 0) {
            remainText = "⚠️ 今日";
            remainClass = "today";
        } else if (diff === 1) {
            remainText = "⏰ 明日";
            remainClass = "tomorrow";
        } else {
            remainText = "あと" + diff + "日";
            remainClass = "";
        }

        div.innerHTML = `
            <div class="notice-content">
                <div class="notice-text">
                    🔔 ${escapeHtml(notice.text)}
                </div>

                <div class="notice-datetime">
                    <span>📅 ${notice.date}</span>
                    ${notice.time ? `<span>⏰ ${notice.time}</span>` : ""}
                </div>

                <div class="notice-remain">
                    <span class="${remainClass}">
                        ${remainText}
                    </span>
                </div>
            </div>

            <div class="task-buttons">
                <button
                    class="edit-btn"
                    onclick="editNotice('${notice.id}')">
                    編集
                </button>

                <button
                    class="done-btn"
                    onclick="deleteNotice('${notice.id}')">
                    削除
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadNotices() {
    try {
        const snapshot = await getDocs(collection(db, "notices"));

        notices = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        notices.sort((a, b) => {
            const dateA = `${a.date || ""} ${a.time || ""}`;
            const dateB = `${b.date || ""} ${b.time || ""}`;
            return dateA.localeCompare(dateB);
        });

        showNotice();
    } catch (error) {
        console.error("通知の読み込みに失敗しました:", error);

        Swal.fire({
            icon: "error",
            title: "通知を読み込めませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

function editNotice(id) {
    localStorage.setItem("editNoticeId", id);
    location.href = "add-notice.html";
}

async function addNotice() {
    const textElement = document.getElementById("noticeText");
    const dateElement = document.getElementById("noticeDate");
    const timeElement = document.getElementById("noticeTime");

    const text = textElement ? textElement.value.trim() : "";
    const date = dateElement ? dateElement.value : "";
    const time = timeElement ? timeElement.value : "";

    if (text === "" || date === "") {
        Swal.fire({
            icon: "warning",
            title: "入力してください",
            text: "通知内容と日付を入力してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
        return;
    }

    try {
        const editId = localStorage.getItem("editNoticeId");

        if (editId) {
            await updateDoc(doc(db, "notices", editId), {
                text: text,
                date: date,
                time: time
            });

            localStorage.removeItem("editNoticeId");
        } else {
            await addDoc(collection(db, "notices"), {
                text: text,
                date: date,
                time: time
            });
        }

        location.href = "notice.html";
    } catch (error) {
        console.error("通知の保存に失敗しました:", error);

        Swal.fire({
            icon: "error",
            title: "保存できませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

async function deleteNotice(id) {
    try {
        await deleteDoc(doc(db, "notices", id));
        await loadNotices();
    } catch (error) {
        console.error("通知の削除に失敗しました:", error);

        Swal.fire({
            icon: "error",
            title: "削除できませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

function cancelNotice() {
    const text = document.getElementById("noticeText");
    const date = document.getElementById("noticeDate");
    const time = document.getElementById("noticeTime");
    const placeholder = document.getElementById("timePlaceholder");
    const cancel = document.getElementById("cancelNoticeBtn");
    const home = document.getElementById("homeNoticeBtn");

    if (text) text.value = "";
    if (date) date.value = "";
    if (time) time.value = "";
    if (placeholder) placeholder.style.display = "block";
    if (cancel) cancel.style.display = "none";
    if (home) home.style.display = "block";

    localStorage.removeItem("editNoticeId");
}

function checkNoticeInput() {
    const text = document.getElementById("noticeText");
    const date = document.getElementById("noticeDate");
    const time = document.getElementById("noticeTime");
    const cancel = document.getElementById("cancelNoticeBtn");
    const home = document.getElementById("homeNoticeBtn");

    if (!text || !date || !time || !cancel || !home) {
        return;
    }

    if (text.value !== "" || date.value !== "" || time.value !== "") {
        cancel.style.display = "block";
        home.style.display = "none";
    } else {
        cancel.style.display = "none";
        home.style.display = "block";
    }
}

function goHomeNotice() {
    location.href = "index.html";
}

function backNotice() {
    const text = document.getElementById("noticeText");
    const date = document.getElementById("noticeDate");

    if (text && date && (text.value !== "" || date.value !== "")) {
        Swal.fire({
            icon: "warning",
            title: "保存されていません",
            text: "入力内容があります",
            width: 280,
            customClass: {
                popup: "small-alert"
            },
            confirmButtonColor: "#6b3df5"
        });
    } else {
        location.href = "notice-menu.html";
    }
}

async function setupNoticeAddPage() {
    const dateElement = document.getElementById("noticeDate");

    if (!dateElement) {
        return;
    }

    if (typeof flatpickr !== "undefined") {
        flatpickr("#noticeDate", {
            locale: flatpickr.l10ns.ja,
            dateFormat: "Y-m-d",
            allowInput: false,
            disableMobile: true,
            position: "center"
        });
    }

    const editId = localStorage.getItem("editNoticeId");

    if (editId) {
        try {
            const snapshot = await getDocs(collection(db, "notices"));
            const target = snapshot.docs.find((item) => item.id === editId);

            if (target) {
                const data = target.data();

                document.getElementById("noticeText").value = data.text || "";
                document.getElementById("noticeDate").value = data.date || "";
                document.getElementById("noticeTime").value = data.time || "";

                if (data.time) {
                    document.getElementById("timePlaceholder").style.display = "none";
                }

                document.querySelector(".save").textContent = "💾 更新";

                const home = document.getElementById("homeNoticeBtn");
                if (home) {
                    home.textContent = "🔙 一覧に戻る";
                    home.onclick = function () {
                        location.href = "notice.html";
                    };
                }
            }
        } catch (error) {
            console.error("編集データの読み込みに失敗しました:", error);
        }
    }

    checkNoticeInput();
}

window.addEventListener("DOMContentLoaded", () => {
    const text = document.getElementById("noticeText");
    const date = document.getElementById("noticeDate");
    const time = document.getElementById("noticeTime");

    if (text) text.addEventListener("input", checkNoticeInput);
    if (date) date.addEventListener("change", checkNoticeInput);
    if (time) {
        time.addEventListener("change", () => {
            const placeholder = document.getElementById("timePlaceholder");
            if (placeholder) {
                placeholder.style.display = time.value ? "none" : "block";
            }
            checkNoticeInput();
        });
    }

    setupNoticeAddPage();
    loadNotices();
});

window.showNotice = showNotice;
window.editNotice = editNotice;
window.addNotice = addNotice;
window.deleteNotice = deleteNotice;
window.cancelNotice = cancelNotice;
window.goHomeNotice = goHomeNotice;
window.backNotice = backNotice;
