import { db, userCollection, userDoc, waitForUser } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
// ===================================
// 提出物（Firebase / Firestore）
// ===================================

let submits = [];

async function loadSubmits() {
    try {

        // ログインユーザーを待つ
        await waitForUser();

        const snapshot = await getDocs(
            userCollection("submits")
        );

        submits = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        submits.sort((a, b) => {
            const dateA = `${a.date || ""} ${a.time || ""}`;
            const dateB = `${b.date || ""} ${b.time || ""}`;
            return dateA.localeCompare(dateB);
        });

        showSubmits();

    } catch (error) {

        console.error(
            "提出物の読み込みに失敗しました:",
            error
        );

        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "error",
                title: "提出物を読み込めませんでした",
                text: "Firebase / Firestoreの設定を確認してください",
                width: 280,
                confirmButtonColor: "#6b3df5"
            });
        }
    }
}

function showSubmits() {
    const list = document.getElementById("submitList");

    if (!list) return;

    list.innerHTML = "";

    submits.forEach((item) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(item.date);
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
            remainText = "⚠️ 今日提出！";
            remainClass = "today";
        } else if (diff === 1) {
            remainText = "⏰ 明日提出";
            remainClass = "tomorrow";
        } else {
            remainText = "あと" + diff + "日";
            remainClass = "";
        }

        const div = document.createElement("div");
        div.className = "task-card";

        div.innerHTML = `
            <div class="task-title">
                ${escapeHtml(item.title)}
            </div>

            <div class="task-date">
                📅 ${escapeHtml(item.date)}
                ${item.time ? `　⏰ ${escapeHtml(item.time)}` : ""}
            </div>

            <div class="task-remain ${remainClass}">
                ${remainText}
            </div>

            <div class="task-buttons">
                <button class="edit-btn"
                    onclick="editSubmit('${item.id}')">
                    編集
                </button>

                <button class="done-btn"
                    onclick="deleteSubmit('${item.id}')">
                    提出済み
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

// ===================================
// 追加 / 編集
// ===================================

async function addSubmit() {
    const user = await waitForUser();
    const titleElement = document.getElementById("title");
    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("submitTime");

    const title = titleElement ? titleElement.value.trim() : "";
    const date = dateElement ? dateElement.value : "";
    const time = timeElement ? timeElement.value : "";

    if (title === "") {
        Swal.fire({
            target: ".app",
            position: "top",
            icon: "warning",
            title: "提出物名を入力してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
        return;
    }

    if (date === "") {
        Swal.fire({
            target: ".app",
            position: "top",
            icon: "warning",
            title: "提出日を選択してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
        return;
    }

    try {
        const editId = localStorage.getItem("editSubmitId");

        if (editId) {
            await updateDoc(userDoc("submits", editId), {
                title,
                date,
                time
            });

            localStorage.removeItem("editSubmitId");
        } else {
            await addDoc(userCollection("submits"), {
        userId: user.uid,
                title,
                date,
                time
            });
        }

        Swal.fire({
            target: ".app",
            position: "top",
            icon: "success",
            title: editId ? "更新しました！" : "追加しました！",
            width: 300,
            confirmButtonColor: "#6b3df5"
        }).then(() => {
            location.href = "tasks.html";
        });

    } catch (error) {
        console.error("提出物の保存に失敗しました:", error);

        Swal.fire({
            icon: "error",
            title: "保存できませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

function editSubmit(id) {
    localStorage.setItem("editSubmitId", id);
    location.href = "add-submit.html";
}

async function deleteSubmit(id) {
    try {
        await deleteDoc(userDoc("submits", id));
        await loadSubmits();
    } catch (error) {
        console.error("提出物の削除に失敗しました:", error);

        Swal.fire({
            icon: "error",
            title: "削除できませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

// ===================================
// 日付カレンダー
// ===================================

function setupDatePicker() {
    const dateInput = document.getElementById("date");

    if (!dateInput || typeof flatpickr === "undefined") {
        return;
    }

    flatpickr(dateInput, {
        locale: flatpickr.l10ns.ja,
        dateFormat: "Y-m-d",
        allowInput: false,
        disableMobile: true,
        position: "center"
    });
}

// ===================================
// 編集データ読み込み
// ===================================
async function setupEditPage() {

    const title = document.getElementById("title");
    const date = document.getElementById("date");

    if (!title || !date) {
        return;
    }

    const editId = localStorage.getItem("editSubmitId");

    if (!editId) {
        return;
    }

    try {

        // ログインユーザーを待つ
        await waitForUser();

        // 編集する提出物をIDで直接取得
        const submitRef = userDoc("submits", editId);
        const target = await getDoc(submitRef);

        if (!target.exists()) {

            console.error(
                "編集する提出物が見つかりません:",
                editId
            );

            localStorage.removeItem("editSubmitId");

            Swal.fire({
                icon: "error",
                title: "提出物が見つかりません",
                text: "一覧からもう一度編集してください",
                width: 280,
                confirmButtonColor: "#6b3df5"
            });

            return;
        }

        const data = target.data();

        // =========================
        // 入力欄に元のデータを入れる
        // =========================

        title.value = data.title || "";
        date.value = data.date || "";

        const time =
            document.getElementById("submitTime");

        const placeholder =
            document.getElementById("submitTimePlaceholder");

        if (time) {
            time.value = data.time || "";
        }

        if (placeholder) {
            placeholder.style.display =
                data.time ? "none" : "block";
        }

        // =========================
        // ボタン表示
        // =========================

        const save =
            document.querySelector(".save");

        if (save) {
            save.textContent = "💾 更新";
        }

        const home =
            document.getElementById("homeBtn");

        if (home) {

            home.textContent = "🔙 一覧に戻る";

            home.onclick = function () {
                location.href = "tasks.html";
            };
        }

        // 入力状態を更新
        checkInput();

    } catch (error) {

        console.error(
            "提出物の編集データ読み込みに失敗しました:",
            error
        );

        Swal.fire({
            icon: "error",
            title: "編集データを読み込めませんでした",
            text: "Firebase / Firestoreの設定を確認してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });
    }
}

// ===================================
// 戻る / キャンセル
// ===================================

function backSubmit() {
    const title = document.getElementById("title");
    const date = document.getElementById("date");
    const time = document.getElementById("submitTime");

    if (
        (title && title.value !== "") ||
        (date && date.value !== "") ||
        (time && time.value !== "")
    ) {
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
        location.href = "submit-menu.html";
    }
}

function cancelSubmit() {
    const title = document.getElementById("title");
    const date = document.getElementById("date");
    const time = document.getElementById("submitTime");
    const placeholder = document.getElementById("submitTimePlaceholder");

    if (title) title.value = "";
    if (date) date.value = "";
    if (time) time.value = "";
    if (placeholder) placeholder.style.display = "block";

    localStorage.removeItem("editSubmitId");
    checkInput();
}

function checkInput() {
    const title = document.getElementById("title");
    const date = document.getElementById("date");
    const time = document.getElementById("submitTime");
    const cancel = document.getElementById("cancelBtn");
    const home = document.getElementById("homeBtn");

    if (!title || !date || !time || !cancel || !home) return;

    if (title.value !== "" || date.value !== "" || time.value !== "") {
        cancel.style.display = "block";
        home.style.display = "none";
    } else {
        cancel.style.display = "none";
        home.style.display = "block";
    }
}

function goHome() {
    location.href = "index.html";
}

// ===================================
// 初期化
// ===================================

window.addEventListener("DOMContentLoaded", async function () {
    setupDatePicker();

    const title = document.getElementById("title");
    const date = document.getElementById("date");
    const time = document.getElementById("submitTime");

    if (title) title.addEventListener("input", checkInput);
    if (date) date.addEventListener("change", checkInput);

    if (time) {
        time.addEventListener("change", function () {
            const placeholder = document.getElementById("submitTimePlaceholder");
            if (placeholder) {
                placeholder.style.display = time.value ? "none" : "block";
            }
            checkInput();
        });
    }

    if (document.getElementById("submitList")) {
        await loadSubmits();
    }

    await setupEditPage();
    checkInput();
});

// HTML onclick から呼べるようにする
window.addSubmit = addSubmit;
window.editSubmit = editSubmit;
window.deleteSubmit = deleteSubmit;
window.cancelSubmit = cancelSubmit;
window.goHome = goHome;
window.backSubmit = backSubmit;
window.loadSubmits = loadSubmits;
