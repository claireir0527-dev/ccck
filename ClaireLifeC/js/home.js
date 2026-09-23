
import { db } from "./firebase.js";

import {
collection,
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

// ===================================
// 今日の日付を YYYY-MM-DD にする
// ===================================

function getTodayString() {

const year = today.getFullYear();

const month =
    String(today.getMonth() + 1).padStart(2, "0");

const day =
    String(today.getDate()).padStart(2, "0");

return `${year}-${month}-${day}`;

}

// ===================================
// 今日の日付を表示
// ===================================

const todayElement =
document.getElementById("today");

if (todayElement) {

todayElement.textContent =
    `${today.getMonth() + 1}月${today.getDate()}日（${week[today.getDay()]}）`;


}

// ===================================
// 今日の通知を取得
// ===================================

async function getTodayNotices() {

const todayString = getTodayString();

console.log("今日の日付:", todayString);

try {

    const snapshot =
        await getDocs(
            collection(db, "notices")
        );

    console.log(
        "Firestore通知件数:",
        snapshot.size
    );

    const todayNotices = [];

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        console.log(
            "通知データ:",
            data
        );

        if (data.date === todayString) {

            todayNotices.push({
                id: docSnap.id,
                ...data
            });

        }

    });

    console.log(
        "今日の通知:",
        todayNotices
    );

    return todayNotices;

} catch (error) {

    console.error(
        "通知取得エラー:",
        error
    );

    return [];

}

}

// ===================================
// 今日の通知件数を表示
// ===================================

async function checkTodayNotice() {

const count =
    document.getElementById("noticeCount");

const card =
    document.getElementById("noticeCard");

if (!count) {

    console.error(
        "noticeCount が見つかりません"
    );

    return;
}

const todayNotices =
    await getTodayNotices();

count.textContent =
    todayNotices.length + "件";

if (card) {

    if (todayNotices.length > 0) {

        card.classList.add(
            "today-notice"
        );

    } else {

        card.classList.remove(
            "today-notice"
        );

    }

}

console.log(
    "今日の通知件数:",
    todayNotices.length
);

}

// ===================================
// 今日の通知を開く
// ===================================

async function openTodayNotice() {

const todayNotices =
    await getTodayNotices();

if (todayNotices.length === 0) {

    Swal.fire({

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
// 今日の提出物
// ===================================

async function getTodaySubmits() {

try {

    const snapshot =
        await getDocs(
            collection(db, "submits")
        );

    const todayString =
        getTodayString();

    return snapshot.docs
        .map(docSnap => docSnap.data())
        .filter(item =>
            item.date === todayString
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

if (!count || !card) {

    return;
}

const todayTasks =
    await getTodaySubmits();

if (todayTasks.length > 0) {

    count.textContent =
        "⚠️ 今日提出 " +
        todayTasks.length +
        "件";

    card.classList.add(
        "today-task"
    );

} else {

    count.textContent =
        "0件";

    card.classList.remove(
        "today-task"
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
    function(e) {

        e.preventDefault();

        const day =
            today.getDay();

        if (
            day === 0 ||
            day === 6
        ) {

            Swal.fire({

                icon: "info",

                title: "今日は休日です",

                width: 280,

                customClass: {
                    popup: "small-alert"
                },

                confirmButtonColor:
                    "#6b3df5"

            });

            return;
        }

        const todayName =
            week[day];

        location.href =
            "timetable.html?day=" +
            encodeURIComponent(
                todayName
            );

    }
);
```

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

```
scheduleText.textContent =
    (
        todayName === "土" ||
        todayName === "日"
    )
    ? "休日"
    : todayName + "曜日の時間割";

}

// ===================================
// アイコン
// ===================================

const icon =
localStorage.getItem("userIcon");

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
// ページ読み込み
// ===================================

document.addEventListener(
"DOMContentLoaded",
function() {

    checkTodayTasks();

    checkTodayNotice();

}


);
