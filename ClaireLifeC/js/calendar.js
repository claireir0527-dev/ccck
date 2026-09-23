import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let calendar = document.getElementById("calendar");
let today = new Date();
let year = today.getFullYear();
let month = today.getMonth();
let notices = [];

function getSubmits() {
    return JSON.parse(localStorage.getItem("submits")) || [];
}

async function loadNotices() {
    try {
        const snapshot = await getDocs(collection(db, "notices"));
        notices = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
    } catch (error) {
        console.error("カレンダーの通知読み込みに失敗しました:", error);
        notices = [];
    }
}

function createCalendar() {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const submits = getSubmits();

    let html = `
        <div class="calendar-header">
            <button onclick="prevMonth()" class="month-btn">◀</button>
            <h2>${year}年${month + 1}月</h2>
            <button onclick="nextMonth()" class="month-btn">▶</button>
        </div>
        <table class="calendar-table">
            <tr>
                <th>日</th><th>月</th><th>火</th><th>水</th>
                <th>木</th><th>金</th><th>土</th>
            </tr>
            <tr>
    `;

    for (let i = 0; i < first.getDay(); i++) {
        html += "<td></td>";
    }

    for (let day = 1; day <= last.getDate(); day++) {
        const date = year + "-" +
            String(month + 1).padStart(2, "0") + "-" +
            String(day).padStart(2, "0");

        const hasSubmit = submits.some(item => item.date === date);
        const hasNotice = notices.some(item => item.date === date);

        let mark = "";
        if (hasSubmit && hasNotice) mark = "<br>📌";
        else if (hasSubmit) mark = "<br>📝";
        else if (hasNotice) mark = "<br>🔔";

        html += `
            <td id="day${day}" onclick="selectDay(${day})">
                ${day}${mark}
            </td>
        `;

        if ((first.getDay() + day) % 7 === 0) {
            html += "</tr><tr>";
        }
    }

    html += `
            </tr>
        </table>
        <div id="dayPlan">日付を選択してください</div>
    `;

    calendar.innerHTML = html;

    if (year === today.getFullYear() && month === today.getMonth()) {
        selectDay(today.getDate());
    }
}

function prevMonth() {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    createCalendar();
}

function nextMonth() {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    createCalendar();
}

function selectDay(day) {
    document.querySelectorAll(".calendar-table td").forEach(td => {
        td.classList.remove("selected-day");
    });

    const selected = document.getElementById("day" + day);
    if (selected) selected.classList.add("selected-day");

    const date = year + "-" +
        String(month + 1).padStart(2, "0") + "-" +
        String(day).padStart(2, "0");

    const submits = getSubmits();
    let submitText = "";

    submits.forEach((item, index) => {
        if (item.date === date) {
            submitText += `
                <div class="task-card">
                    <div class="task-title">${escapeHtml(item.title)}</div>
                    <div class="task-buttons">
                        <button class="edit-btn" onclick="editSubmit(${index})">✏️</button>
                        <button class="done-btn" onclick="calendarDeleteSubmit(${index})">🗑️</button>
                    </div>
                </div>
            `;
        }
    });

    let noticeText = "";

    notices.forEach((item) => {
        if (item.date === date) {
            noticeText += `
                <div class="task-card">
                    <div class="task-title">${escapeHtml(item.text)}</div>
                    <div class="task-buttons">
                        <button class="edit-btn" onclick="editNotice('${item.id}')">✏️</button>
                        <button class="done-btn" onclick="calendarDeleteNotice('${item.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }
    });

    let html = `<b>${year}年${month + 1}月${day}日</b><br><br>`;

    if (submitText !== "") html += `📝 提出物<br>${submitText}`;
    if (noticeText !== "") html += `🔔 通知<br>${noticeText}`;
    if (submitText === "" && noticeText === "") html += "ありません";

    const plan = document.getElementById("dayPlan");
    if (plan) {
        plan.innerHTML = html;
        plan.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (document.activeElement) document.activeElement.blur();
}

function calendarDeleteSubmit(index) {
    const submits = getSubmits();
    submits.splice(index, 1);
    localStorage.setItem("submits", JSON.stringify(submits));
    createCalendar();
}

async function calendarDeleteNotice(id) {
    try {
        await deleteDoc(doc(db, "notices", id));
        await loadNotices();
        createCalendar();
    } catch (error) {
        console.error("カレンダーから通知を削除できませんでした:", error);
        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "error",
                title: "削除できませんでした",
                width: 280,
                confirmButtonColor: "#6b3df5"
            });
        }
    }
}

function editNotice(id) {
    localStorage.setItem("editNoticeId", id);
    location.href = "add-notice.html";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.selectDay = selectDay;
window.calendarDeleteSubmit = calendarDeleteSubmit;
window.calendarDeleteNotice = calendarDeleteNotice;
window.editNotice = editNotice;

async function startCalendar() {
    if (!calendar) return;
    await loadNotices();
    createCalendar();
}

startCalendar();
