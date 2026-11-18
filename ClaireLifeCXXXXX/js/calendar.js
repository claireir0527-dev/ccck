import {
    userCollection,
    userDoc,
    waitForUser
} from "./firebase.js";

import {
    getDocs,
    deleteDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ===================================
// カレンダー
// ===================================

const calendar =
    document.getElementById("calendar");

const today = new Date();

let year =
    today.getFullYear();

let month =
    today.getMonth();

let notices = [];

let submits = [];
let personalEvents = [];
let selectedDate = "";


// ===================================
// 日付を YYYY-MM-DD に統一
// ===================================

function normalizeDate(value) {

    if (!value) {
        return "";
    }


    // 文字列
    if (typeof value === "string") {

        return value.slice(0, 10);

    }


    // Firebase Timestamp
    if (
        value &&
        typeof value.toDate === "function"
    ) {

        const d =
            value.toDate();


        return (
            d.getFullYear() +
            "-" +
            String(
                d.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                d.getDate()
            ).padStart(2, "0")
        );

    }


    return "";

}
// ===================================
// 予定が期間内の日付か確認
// ===================================

function isEventOnDate(item, date) {
    const startDate = normalizeDate(
        item.startDate || item.date
    );

    const endDate = normalizeDate(
        item.endDate || item.startDate || item.date
    );

    return (
        startDate !== "" &&
        endDate !== "" &&
        date >= startDate &&
        date <= endDate
    );
}

// ===================================
// Firebaseからデータ取得
// ===================================

async function loadData() {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の提出物・通知を取得
        const [
            submitSnapshot,
            noticeSnapshot,
            argumentsSnapshot
        ] = await Promise.all([

            getDocs(
                userCollection("submits")
            ),

            getDocs(
                userCollection("notices")
            ),

            getDocs(
                userCollection("events")
            )

        ]);


        submits =
            submitSnapshot.docs.map(
                docSnap => ({

                    id: docSnap.id,

                    ...docSnap.data()

                })
            );


        notices =
            noticeSnapshot.docs.map(
                docSnap => ({
                    id: docSnap.id,
                    ...docSnap.data()
                })
            );

        personalEvents = argumentsSnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));


    } catch (error) {

        console.error(
            "カレンダーのデータ読み込みに失敗しました:",
            error
        );


        submits = [];

        notices = [];
        personalEvents = [];

    }

}


// ===================================
// カレンダー作成
// ===================================

function createCalendar() {

    if (!calendar) {
        return;
    }


    const first =
        new Date(
            year,
            month,
            1
        );


    const last =
        new Date(
            year,
            month + 1,
            0
        );


    let html = `

        <div class="calendar-header">

            <button
                onclick="prevMonth()"
                class="month-btn"
            >
                ◀
            </button>


            <h2>
                ${year}年${month + 1}月
            </h2>


            <button
                onclick="nextMonth()"
                class="month-btn"
            >
                ▶
            </button>

        </div>


        <table class="calendar-table" style="
    width:100%;
    table-layout:fixed;
    border-collapse:collapse;
">

            <tr>

                <th>日</th>
                <th>月</th>
                <th>火</th>
                <th>水</th>
                <th>木</th>
                <th>金</th>
                <th>土</th>

            </tr>

            <tr>

    `;


    // 月初までの空白
    for (
        let i = 0;
        i < first.getDay();
        i++
    ) {

        html += "<td></td>";

    }


    // 日付
    for (
        let day = 1;
        day <= last.getDate();
        day++
    ) {


        const date =
            year +
            "-" +
            String(
                month + 1
            ).padStart(2, "0") +
            "-" +
            String(day).padStart(2, "0");


        // 提出物があるか
        const hasSubmit =
            submits.some(
                item =>
                    normalizeDate(
                        item.date
                    ) === date
            );
const dayEvents = personalEvents.filter(
    item => isEventOnDate(item, date)
);




let personalEventBands = "";

if (dayEvents.length >= 1) {
    const item = dayEvents[0];

    personalEventBands = `
        <div style="
            display:flex;
            align-items:center;
            width:100%;
            min-height:16px;
            box-sizing:border-box;
            margin-top:3px;
            padding:1px 5px;
            background-color:#a78bfa;
            color:white;
            font-size:10px;
            line-height:12px;
            text-align:left;
            overflow:hidden;
            white-space:nowrap;
        ">
            <span style="
                flex:1;
                min-width:0;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                ${escapeHtml(item.title || "自分の予定")}
            </span>

            ${dayEvents.length >= 2 ? `
                <span style="
                    flex-shrink:0;
                    margin-left:5px;
                    font-weight:bold;
                ">
                    +${dayEvents.length - 1}
                </span>
            ` : ""}
        </div>
    `;
}

console.log("日付:", date);
console.log("この日の予定:", dayEvents);
console.log("作成された帯:", personalEventBands);

        // 通知があるか
        const hasNotice =
            notices.some(
                item =>
                    normalizeDate(
                        item.date
                    ) === date
            );


        let mark = "";


        if (
            hasSubmit &&
            hasNotice
        ) {

            mark = "📌";

        }

        else if (hasSubmit) {

            mark = "📝";

        }

        else if (hasNotice) {

            mark = "🔔";

        }


html += `
    <td
        id="day${day}"
        onclick="selectDay(${day})"
    >
        <div class="calendar-day-number">
            ${day}
        </div>

        ${mark}

        <div class="calendar-event-list">
            ${personalEventBands}
        </div>
    </td>
`;


        // 土曜日で改行
        if (
            (
                first.getDay() +
                day
            ) % 7 === 0
        ) {

            html += "</tr><tr>";

        }

    }


    html += `

            </tr>

        </table>


        <div id="dayPlan">
            日付を選択してください
        </div>

    `;


    calendar.innerHTML =
        html;


    // URLで指定された日付があれば選択（予定追加後の戻り先）
    const requestedDate = new URLSearchParams(location.search).get("date");
    if (requestedDate) {
        const parts = requestedDate.split("-").map(Number);
        if (parts.length === 3 && parts[0] === year && parts[1] === month + 1) {
            selectDay(parts[2]);
            return;
        }
    }

    // 今月なら今日を選択
    if (year === today.getFullYear() && month === today.getMonth()) {
        selectDay(today.getDate());
    }

}


// ===================================
// カレンダー更新
// ===================================

async function refreshCalendar() {

    await loadData();

    createCalendar();

}


// ===================================
// 前の月
// ===================================

function prevMonth() {

    month--;


    if (month < 0) {

        month = 11;

        year--;

    }


    refreshCalendar();

}


// ===================================
// 次の月
// ===================================

function nextMonth() {

    month++;


    if (month > 11) {

        month = 0;

        year++;

    }


    refreshCalendar();

}


// ===================================
// 日付を選択
// ===================================

function selectDay(day) {

    // 選択解除
    document
        .querySelectorAll(
            ".calendar-table td"
        )
        .forEach(td => {

            td.classList.remove(
                "selected-day"
            );

        });


    // 選択
    const selected =
        document.getElementById(
            "day" + day
        );


    if (selected) {

        selected.classList.add(
            "selected-day"
        );

    }


    const date =
        year +
        "-" +
        String(
            month + 1
        ).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0");


    selectedDate = date;

    // ===================================
    // 提出物
    // ===================================

    let submitText = "";


    submits.forEach(item => {

    if (normalizeDate(item.date) === date) {

        submitText += `
            <div class="task-card">

                <div class="task-title">
                    ${escapeHtml(item.title)}
                </div>

                <div class="task-date">
                    📅 ${escapeHtml(normalizeDate(item.date))}
                </div>

                <div class="task-date">
                    ⏰ ${item.time ? escapeHtml(item.time) : "時間未設定"}
                </div>

                <div class="task-buttons calendar-buttons">

                    <button
                        class="edit-btn"
                        onclick="editSubmit('${item.id}')"
                    >✏️</button>

                    <button
                        class="done-btn"
                        onclick="calendarDeleteSubmit('${item.id}')"
                    >🗑️</button>

                </div>

            </div>
        `;
    }

});
    // ===================================
    // 予定
    // ===================================

    let noticeText = "";
    let eventText = "";




personalEvents.forEach(item => {

    if (isEventOnDate(item, date)) {

        eventText += `
            <div class="task-card personal-event-card">

                <div class="task-title">
                    ${escapeHtml(item.title)}
                </div>

                <div class="task-date">
                    📅 ${escapeHtml(normalizeDate(item.date))}
                </div>

                <div class="task-date">
                    ⏰ ${item.time ? escapeHtml(item.time) : "時間未設定"}
                </div>

                ${item.memo
                    ? `<div>${escapeHtml(item.memo)}</div>`
                    : ""
                }

                <div class="task-buttons calendar-buttons">

                    <button
                        class="edit-btn"
                        onclick="calendarEditEvent('${item.id}')"
                    >✏️</button>

                    <button
                        class="done-btn"
                        onclick="calendarDeleteEvent('${item.id}')"
                    >🗑️</button>

                </div>

            </div>
        `;
    }

});

// ===================================
// 通知
// ===================================

notices.forEach(item => {

    if (normalizeDate(item.date) === date) {

        noticeText += `
            <div class="task-card">

                <div class="task-title">
                    ${escapeHtml(item.text)}
                </div>

                <div class="task-date">
                    📅 ${escapeHtml(normalizeDate(item.date))}
                </div>

                <div class="task-date">
                    ⏰ ${item.time
                        ? escapeHtml(item.time)
                        : "時間未設定"}
                </div>

                <div class="task-buttons calendar-buttons">

                    <button
                        class="edit-btn"
                        onclick="editNotice('${item.id}')"
                    >
                        ✏️
                    </button>

                    <button
                        class="done-btn"
                        onclick="calendarDeleteNotice('${item.id}')"
                    >
                        🗑️
                    </button>

                </div>

            </div>
        `;
    }

});
    // ===================================
    // 日付の内容を表示
    // ===================================

    let html = `

        <b>
            ${year}年${month + 1}月${day}日
        </b>

        <br><br>

    `;


    if (submitText !== "") {

        html += `
            📝 提出物
            <br>
            ${submitText}
        `;

    }


    if (noticeText !== "") {

        html += `
            🔔 通知
            <br>
            ${noticeText}
        `;

    }


    if (eventText !== "") {
        html += `⭐ 自分の予定<br>${eventText}`;
    }

    if (submitText === "" && noticeText === "" && eventText === "") {
        html += "予定はありません";
    }

    html += `
        <button type="button" class="add-calendar-event-btn" onclick="openEventAddPage('${date}')" style="display:block;width:220px;max-width:100%;min-height:48px;box-sizing:border-box;margin:18px auto 0;padding:0 24px;border:0;border-radius:9999px;background:#6b3df5;color:#fff;font-size:16px;font-weight:700;line-height:1.2;text-align:center;cursor:pointer;appearance:none;-webkit-appearance:none;">
            ＋ 予定を追加する
        </button>
    `;


    const plan =
        document.getElementById(
            "dayPlan"
        );


    if (plan) {

        plan.innerHTML =
            html;

        plan.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    if (document.activeElement) {

        document.activeElement.blur();

    }

}


// ===================================
// カレンダーから提出物を削除
// ===================================

async function calendarDeleteSubmit(id) {

    try {

        await waitForUser();


        await deleteDoc(
            userDoc(
                "submits",
                id
            )
        );


        await refreshCalendar();


    } catch (error) {

        console.error(
            "カレンダーから提出物を削除できませんでした:",
            error
        );


        if (
            typeof Swal !== "undefined"
        ) {

            Swal.fire({

                target: ".app",

                icon: "error",

                title: "削除できませんでした",

                width: 280,

                confirmButtonColor:
                    "#6b3df5"

            });

        }

    }

}


// ===================================
// カレンダーから通知を削除
// ===================================

async function calendarDeleteNotice(id) {

    try {

        await waitForUser();


        await deleteDoc(
            userDoc(
                "notices",
                id
            )
        );


        await refreshCalendar();


    } catch (error) {

        console.error(
            "カレンダーから通知を削除できませんでした:",
            error
        );


        if (
            typeof Swal !== "undefined"
        ) {

            Swal.fire({

                target: ".app",

                icon: "error",

                title: "削除できませんでした",

                width: 280,

                confirmButtonColor:
                    "#6b3df5"

            });

        }

    }

}


// ===================================
// 通知編集
// ===================================

function editNotice(id) {

    localStorage.setItem(
        "editNoticeId",
        id
    );

    location.href =
        "add-notice.html";

}


// ===================================
// 提出物編集
// ===================================

function editSubmit(id) {

    localStorage.setItem(
        "editSubmitId",
        id
    );

    location.href =
        "add-submit.html";

}


// ===================================
// 別画面で自分の予定を追加
// ===================================
function openEventAddPage(date) {
    location.href = `add-event.html?date=${encodeURIComponent(date)}`;
}

async function saveCalendarEvent(date) {
    const title = document.getElementById("eventTitle")?.value.trim();
    const time = document.getElementById("eventTime")?.value || "";
    const memo = document.getElementById("eventMemo")?.value.trim() || "";
    if (!title) {
        alert("予定の内容を入力してください");
        return;
    }
    try {
        await waitForUser();
        await addDoc(userCollection("events"), {
            title, date, time, memo,
            createdAt: new Date()
        });
        await refreshCalendar();
        selectDay(Number(date.slice(8, 10)));
    } catch (error) {
        console.error("予定の保存に失敗しました:", error);
        alert("予定を保存できませんでした。ログイン状態と通信を確認してください。");
    }
}

async function calendarDeleteEvent(id) {
    try {
        await waitForUser();
        await deleteDoc(userDoc("events", id));

        const date = selectedDate;

        await loadData();
        createCalendar();

        if (date) {
            selectDay(Number(date.slice(8, 10)));
        }

    } catch (error) {
        console.error("予定の削除に失敗しました:", error);
        alert("予定を削除できませんでした。");
    }
}

// ===================================
// HTMLエスケープ
// ===================================

function escapeHtml(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ===================================
// HTMLから呼び出せるようにする
// ===================================

window.prevMonth =
    prevMonth;

window.nextMonth =
    nextMonth;

window.selectDay =
    selectDay;

window.calendarDeleteSubmit =
    calendarDeleteSubmit;

window.calendarDeleteNotice =
    calendarDeleteNotice;

window.editNotice =
    editNotice;

window.editSubmit =
    editSubmit;
window.openEventAddPage = openEventAddPage;
window.saveCalendarEvent = saveCalendarEvent;
window.calendarDeleteEvent = calendarDeleteEvent;
function calendarEditEvent(id) {
    location.href =
        `add-event.html?edit=${encodeURIComponent(id)}`;
}

window.calendarEditEvent = calendarEditEvent;

// ===================================
// カレンダー開始
// ===================================

async function startCalendar() {

    if (!calendar) {
        return;
    }


    try {

        await waitForUser();

        await loadData();

        createCalendar();


        console.log(
            "カレンダーの読み込み完了"
        );


    } catch (error) {

        console.error(
            "カレンダー開始エラー:",
            error
        );

    }

}


startCalendar();