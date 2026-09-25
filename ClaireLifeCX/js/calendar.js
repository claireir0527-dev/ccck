import {
    userCollection,
    userDoc,
    waitForUser
} from "./firebase.js";

import {
    getDocs,
    deleteDoc
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
// Firebaseからデータ取得
// ===================================

async function loadData() {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の提出物・通知を取得
        const [
            submitSnapshot,
            noticeSnapshot
        ] = await Promise.all([

            getDocs(
                userCollection("submits")
            ),

            getDocs(
                userCollection("notices")
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


    } catch (error) {

        console.error(
            "カレンダーのデータ読み込みに失敗しました:",
            error
        );


        submits = [];

        notices = [];

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


        <table class="calendar-table">

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

            mark = "<br>📌";

        }

        else if (hasSubmit) {

            mark = "<br>📝";

        }

        else if (hasNotice) {

            mark = "<br>🔔";

        }


        html += `

            <td
                id="day${day}"
                onclick="selectDay(${day})"
            >

                ${day}

                ${mark}

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


    // 今月なら今日を選択
    if (
        year === today.getFullYear() &&
        month === today.getMonth()
    ) {

        selectDay(
            today.getDate()
        );

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


    // ===================================
    // 提出物
    // ===================================

    let submitText = "";


    submits.forEach(item => {

        if (
            normalizeDate(
                item.date
            ) === date
        ) {

            submitText += `

                <div class="task-card">

                    <div class="task-title">

                        ${escapeHtml(
                            item.title
                        )}

                    </div>


                    <div class="task-date">

                        📅
                        ${escapeHtml(
                            normalizeDate(
                                item.date
                            )
                        )}

                        ${
                            item.time
                            ? `　⏰ ${escapeHtml(item.time)}`
                            : ""
                        }

                    </div>


                    <div class="task-buttons calendar-buttons">

                        <button
                            class="edit-btn"
                            onclick="editSubmit('${item.id}')"
                        >
                            ✏️
                        </button>


                        <button
                            class="done-btn"
                            onclick="calendarDeleteSubmit('${item.id}')"
                        >
                            🗑️
                        </button>

                    </div>

                </div>

            `;

        }

    });


    // ===================================
    // 通知
    // ===================================

    let noticeText = "";


    notices.forEach(item => {

        if (
            normalizeDate(
                item.date
            ) === date
        ) {

            noticeText += `

                <div class="task-card">

                    <div class="task-title">

                        🔔
                        ${escapeHtml(
                            item.text
                        )}

                    </div>


                    <div class="task-date">

                        📅
                        ${escapeHtml(
                            normalizeDate(
                                item.date
                            )
                        )}

                        ${
                            item.time
                            ? `　⏰ ${escapeHtml(item.time)}`
                            : ""
                        }

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


    if (
        submitText === "" &&
        noticeText === ""
    ) {

        html += "ありません";

    }


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