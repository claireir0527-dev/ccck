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
// 今日の日付
// ===================================

const today = new Date();

const todayDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");


// ===================================
// 今日の通知を読み込む
// ===================================

async function loadTodayNotices() {

    const list =
        document.getElementById("todayNoticeList");

    if (!list) {
        return;
    }


    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の通知を取得
        const snapshot =
            await getDocs(
                userCollection("notices")
            );


        const notices =
            snapshot.docs

                .map(docSnap => ({
                    id: docSnap.id,
                    ...docSnap.data()
                }))

                .filter(notice =>
                    normalizeDate(notice.date) === todayDate
                );


        // 一旦空にする
        list.innerHTML = "";


        // 今日の通知がない場合
        if (notices.length === 0) {

            list.innerHTML = `
                <p style="text-align:center;">
                    今日の通知はありません
                </p>
            `;

            return;
        }


        // 通知を表示
        notices.forEach(notice => {

            list.innerHTML += `

                <div class="card">

                    <div>

                        🔔
                        ${escapeHtml(notice.text)}

                        <br>

                        📅
                        ${escapeHtml(
                            normalizeDate(notice.date)
                        )}

                        ${
                            notice.time
                            ? `<br>⏰ ${escapeHtml(notice.time)}`
                            : ""
                        }

                    </div>


                    <button
                        class="done-btn"
                        onclick="checkTodayNotice('${notice.id}')"
                    >
                        確認済み
                    </button>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "今日の通知の読み込みに失敗しました:",
            error
        );

    }

}


// ===================================
// 日付を統一
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
// 通知を確認済みにする
// ===================================

async function checkTodayNotice(id) {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の通知を削除
        await deleteDoc(
            userDoc(
                "notices",
                id
            )
        );


        // 残りの通知を確認
        const snapshot =
            await getDocs(
                userCollection("notices")
            );


        const remainToday =
            snapshot.docs.some(
                docSnap =>
                    normalizeDate(
                        docSnap.data().date
                    ) === todayDate
            );


        // 今日の通知が全部なくなったらホームへ
        if (!remainToday) {

            location.href =
                "index.html";

        } else {

            location.reload();

        }


    } catch (error) {

        console.error(
            "通知の確認処理に失敗しました:",
            error
        );

    }

}


// ===================================
// HTMLから呼び出せるようにする
// ===================================

window.checkTodayNotice =
    checkTodayNotice;


// ===================================
// 開始
// ===================================

loadTodayNotices();