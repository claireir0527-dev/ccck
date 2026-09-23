import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const today = new Date();

const week = ["日", "月", "火", "水", "木", "金", "土"];

function getTodayString() {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const todayString = getTodayString();

const todayElement = document.getElementById("today");
if (todayElement) {
    todayElement.textContent =
        `${today.getMonth() + 1}月${today.getDate()}日（${week[today.getDay()]}）`;
}

// Firebaseの日付を YYYY-MM-DD にそろえる
function normalizeDate(value) {
    if (!value) return "";

    if (typeof value === "string") {
        return value.slice(0, 10);
    }

    if (value && typeof value.toDate === "function") {
        const d = value.toDate();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    return "";
}

async function getTodayNotices() {
    try {
        const snapshot = await getDocs(collection(db, "notices"));

        return snapshot.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
            .filter(item => normalizeDate(item.date) === todayString);

    } catch (error) {
        console.error("今日の通知取得エラー:", error);
        return [];
    }
}

async function checkTodayNotice() {
    const count = document.getElementById("noticeCount");
    const card = document.getElementById("noticeCard");
    if (!count) return;

    const todayNotices = await getTodayNotices();
    count.textContent = todayNotices.length + "件";

    if (card) {
        card.classList.toggle("today-notice", todayNotices.length > 0);
    }
}

async function openTodayNotice() {
    const todayNotices = await getTodayNotices();

    if (todayNotices.length === 0) {
        Swal.fire({
            icon: "info",
            title: "今日の通知はありません",
            width: 280,
            customClass: { popup: "small-alert" },
            confirmButtonColor: "#6b3df5"
        });
    } else {
        location.href = "today-notice.html";
    }
}

async function getTodaySubmits() {
    try {
        const snapshot = await getDocs(collection(db, "submits"));

        return snapshot.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
            .filter(item => normalizeDate(item.date) === todayString);

    } catch (error) {
        console.error("今日の提出物取得エラー:", error);
        return [];
    }
}

async function checkTodayTasks() {
    const count = document.getElementById("workCount");
    const card = document.getElementById("taskCard");
    if (!count) return;

    const todayTasks = await getTodaySubmits();

    // 今日の提出物が本当にある場合だけ件数を表示
    count.textContent = todayTasks.length + "件";

    if (card) {
        card.classList.toggle("today-task", todayTasks.length > 0);
    }
}

async function openTodayTask() {
    const todayTasks = await getTodaySubmits();

    if (todayTasks.length === 0) {
        Swal.fire({
            icon: "info",
            title: "今日の提出物はありません",
            width: 280,
            customClass: { popup: "small-alert" },
            confirmButtonColor: "#6b3df5"
        });
    } else {
        location.href = "today-task.html";
    }
}

const todayScheduleLink = document.getElementById("todayScheduleLink");
if (todayScheduleLink) {
    todayScheduleLink.addEventListener("click", function (e) {
        e.preventDefault();

        const day = today.getDay();

        if (day === 0 || day === 6) {
            Swal.fire({
                icon: "info",
                title: "今日は休日です",
                width: 280,
                customClass: { popup: "small-alert" },
                confirmButtonColor: "#6b3df5"
            });
            return;
        }

        location.href = "timetable.html?day=" + encodeURIComponent(week[day]);
    });
}

const todayName = week[today.getDay()];
const scheduleText = document.getElementById("todayScheduleText");
if (scheduleText) {
    scheduleText.textContent =
        (todayName === "土" || todayName === "日")
            ? "休日"
            : todayName + "曜日の時間割";
}

const icon = localStorage.getItem("userIcon");
if (icon) {
    const button = document.getElementById("settingButton");
    if (button) {
        button.innerHTML = `<img src="${icon}" class="setting-icon">`;
    }
}

window.openTodayTask = openTodayTask;
window.openTodayNotice = openTodayNotice;

checkTodayTasks();
checkTodayNotice();
