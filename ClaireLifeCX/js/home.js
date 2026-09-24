import {
    userCollection,
    waitForUser
} from "./firebase.js";

import {
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ===================================
// 今日の日付
// ===================================

const today = new Date();

const week = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
];


function getTodayString() {

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


const todayString =
    getTodayString();


// ===================================
// ホームの日付表示
// ===================================

const todayElement =
    document.getElementById("today");

if (todayElement) {

    todayElement.textContent =
        `${today.getMonth() + 1}月${today.getDate()}日（${week[today.getDay()]}）`;

}


// ===================================
// 日付を YYYY-MM-DD に統一
// ===================================

function normalizeDate(value) {

    if (!value) {
        return "";
    }


    // 文字列の場合
    if (typeof value === "string") {

        return value.slice(0, 10);

    }


    // Firebase Timestampの場合
    if (
        value &&
        typeof value.toDate === "function"
    ) {

        const d =
            value.toDate();

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    }


    return "";

}


// ===================================
// 今日の通知を取得
// ===================================

async function getTodayNotices() {

    try {

        // ログイン完了を待つ
        await waitForUser();


        const snapshot =
            await getDocs(
                userCollection("notices")
            );


        return snapshot.docs

            .map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }))

            .filter(item =>
                normalizeDate(item.date) === todayString
            );


    } catch (error) {

        console.error(
            "今日の通知取得エラー:",
            error
        );

        return [];

    }

}


// ===================================
// 今日の通知件数
// ===================================

async function checkTodayNotice() {

    const count =
        document.getElementById("noticeCount");

    const card =
        document.getElementById("noticeCard");


    if (!count) {
        return;
    }


    const todayNotices =
        await getTodayNotices();


    count.textContent =
        todayNotices.length + "件";


    if (card) {

        card.classList.toggle(
            "today-notice",
            todayNotices.length > 0
        );

    }

}


// ===================================
// 今日の通知を開く
// ===================================

async function openTodayNotice() {

    const todayNotices =
        await getTodayNotices();


    if (todayNotices.length === 0) {

        Swal.fire({

            target: ".app",

            icon: "info",

            title: "今日の通知はありません",

            width: 280,

            customClass: {
                popup: "small-alert"
            },

            confirmButtonColor: "#6b3df5"

        });

    } else {

        location.href =
            "today-notice.html";

    }

}


// ===================================
// 今日の提出物を取得
// ===================================

async function getTodaySubmits() {

    try {

        // ログイン完了を待つ
        await waitForUser();


        const snapshot =
            await getDocs(
                userCollection("submits")
            );


        return snapshot.docs

            .map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }))

            .filter(item =>
                normalizeDate(item.date) === todayString
            );


    } catch (error) {

        console.error(
            "今日の提出物取得エラー:",
            error
        );

        return [];

    }

}


// ===================================
// 今日の提出物件数
// ===================================

async function checkTodayTasks() {

    const count =
        document.getElementById("workCount");

    const card =
        document.getElementById("taskCard");


    if (!count) {
        return;
    }


    const todayTasks =
        await getTodaySubmits();


    count.textContent =
        todayTasks.length + "件";


    if (card) {

        card.classList.toggle(
            "today-task",
            todayTasks.length > 0
        );

    }

}


// ===================================
// 今日の提出物を開く
// ===================================

async function openTodayTask() {

    const todayTasks =
        await getTodaySubmits();


    if (todayTasks.length === 0) {

        Swal.fire({

            target: ".app",

            icon: "info",

            title: "今日の提出物はありません",

            width: 280,

            customClass: {
                popup: "small-alert"
            },

            confirmButtonColor: "#6b3df5"

        });

    } else {

        location.href =
            "today-task.html";

    }

}


// ===================================
// 今日の時間割
// ===================================

const todayScheduleLink =
    document.getElementById(
        "todayScheduleLink"
    );


if (todayScheduleLink) {

    todayScheduleLink.addEventListener(
        "click",
        function (e) {

            e.preventDefault();


            const day =
                today.getDay();


            // 日曜日・土曜日
            if (
                day === 0 ||
                day === 6
            ) {

                Swal.fire({

                    target: ".app",

                    icon: "info",

                    title: "今日は休日です",

                    width: 280,

                    customClass: {
                        popup: "small-alert"
                    },

                    confirmButtonColor: "#6b3df5"

                });

                return;

            }


            location.href =
                "timetable.html?day=" +
                encodeURIComponent(
                    week[day]
                );

        }
    );

}


// ===================================
// 今日の時間割表示
// ===================================

const todayName =
    week[today.getDay()];


const scheduleText =
    document.getElementById(
        "todayScheduleText"
    );


if (scheduleText) {

    scheduleText.textContent =

        (
            todayName === "土" ||
            todayName === "日"
        )

            ? "休日"

            : todayName +
              "曜日の時間割";

}


// ===================================
// 設定アイコン
// ===================================

const icon =
    localStorage.getItem(
        "userIcon"
    );


if (icon) {

    const button =
        document.getElementById(
            "settingButton"
        );


    if (button) {

        button.innerHTML =
            `<img src="${icon}" class="setting-icon">`;

    }

}


// ===================================
// HTMLから呼び出せるようにする
// ===================================

window.openTodayTask =
    openTodayTask;

window.openTodayNotice =
    openTodayNotice;


// ===================================
// ホームを読み込んだら実行
// ===================================

async function initializeHome() {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 提出物
        await checkTodayTasks();


        // 通知
        await checkTodayNotice();


        console.log(
            "今日の予定を読み込みました"
        );


    } catch (error) {

        console.error(
            "ホーム初期化エラー:",
            error
        );

    }

}


initializeHome();