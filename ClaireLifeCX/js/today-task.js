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
// 今日の提出物を読み込む
// ===================================

async function loadTodayTasks() {

    const list =
        document.getElementById("todayTaskList");

    if (!list) {
        return;
    }


    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の提出物を取得
        const snapshot =
            await getDocs(
                userCollection("submits")
            );


        const submits =
            snapshot.docs

                .map(docSnap => ({
                    id: docSnap.id,
                    ...docSnap.data()
                }))

                .filter(item =>
                    normalizeDate(item.date) === todayDate
                );


        // 一旦空にする
        list.innerHTML = "";


        // 今日の提出物がない場合
        if (submits.length === 0) {

            list.innerHTML = `
                <p style="text-align:center;">
                    今日の提出物はありません
                </p>
            `;

            return;
        }


        // 表示
        submits.forEach(item => {

            list.innerHTML += `

                <div class="task-card">

                    <div class="task-title">
                        ${escapeHtml(item.title)}
                    </div>


                    <div class="task-date">

                        📅 ${escapeHtml(
                            normalizeDate(item.date)
                        )}

                        ${
                            item.time
                            ? `　⏰ ${escapeHtml(item.time)}`
                            : ""
                        }

                    </div>


                    <button
                        class="done-btn"
                        onclick="submitTodayTask('${item.id}')"
                    >
                        提出済み
                    </button>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "今日の提出物の読み込みに失敗しました:",
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
// 提出済みにする
// ===================================

async function submitTodayTask(id) {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 自分の提出物を削除
        await deleteDoc(
            userDoc(
                "submits",
                id
            )
        );


        // 残りを確認
        const snapshot =
            await getDocs(
                userCollection("submits")
            );


        const remainToday =
            snapshot.docs.some(
                docSnap =>
                    normalizeDate(
                        docSnap.data().date
                    ) === todayDate
            );


        // 今日の提出物が全部なくなったらホームへ
        if (!remainToday) {

            location.href =
                "index.html";

        } else {

            location.reload();

        }


    } catch (error) {

        console.error(
            "提出済み処理に失敗しました:",
            error
        );

    }

}


// ===================================
// HTMLから呼び出せるようにする
// ===================================

window.submitTodayTask =
    submitTodayTask;


// ===================================
// 開始
// ===================================

loadTodayTasks();