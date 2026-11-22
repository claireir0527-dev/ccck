import {
    userDoc,
    waitForUser
} from "./firebase.js";

import {
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ===================================
// 現在選択している曜日
// ===================================

let currentDay = "月";


// ===================================
// 曜日変更
// ===================================

function changeDay(day) {

    currentDay = day;

    document.querySelectorAll(".subject").forEach(input => {
        input.value = "";
    });

    loadSchedule();
}


// ===================================
// 時間割保存
// ===================================

async function saveSchedule() {

    const subjects = [];

    document.querySelectorAll(".subject").forEach(input => {
        subjects.push(input.value.trim());
    });


    // 何も入力されていない場合
    const allEmpty = subjects.every(subject => subject === "");

    if (allEmpty) {

        Swal.fire({
            target: ".app",
            position: "top",
            icon: "warning",
            title: "1つ以上教科を入力してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }


    // Firebaseへ保存
    await saveScheduleToFirebase(subjects);
}


// ===================================
// Firebaseへ時間割を保存
// ===================================

async function saveScheduleToFirebase(subjects) {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 現在のユーザーの時間割
        const scheduleRef =
            userDoc("schedules", currentDay);


        // 保存
        await setDoc(scheduleRef, {

            day: currentDay,

            subjects: subjects

        });


        // アイコン更新
        document.querySelectorAll(".subject").forEach(input => {

            changeIcon(input);

        });


        // 保存成功
        await Swal.fire({

            target: ".app",

            position: "top",

            icon: "success",

            title: "保存しました！",

            width: 280,

            confirmButtonColor: "#6b3df5"

        });


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (error) {

        console.error(
            "時間割の保存エラー:",
            error
        );


        Swal.fire({

            target: ".app",

            position: "top",

            icon: "error",

            title: "保存に失敗しました",

            text: "Firebaseの設定を確認してください",

            width: 280,

            confirmButtonColor: "#6b3df5"

        });

    }
}


// ===================================
// Firebaseから時間割を読み込む
// ===================================

async function loadSchedule() {

    try {

        // ログインユーザーを待つ
        await waitForUser();


        // 現在の曜日のデータ
        const scheduleRef =
            userDoc("schedules", currentDay);


        const snapshot =
            await getDoc(scheduleRef);


        let subjects = [];


        if (snapshot.exists()) {

            const data = snapshot.data();

            subjects = data.subjects || [];

        }


        // 画面に表示
        const inputs =
            document.querySelectorAll(".subject");


        inputs.forEach((input, index) => {

            input.value =
                subjects[index] || "";

            changeIcon(input);

        });


    } catch (error) {

        console.error(
            "時間割の読み込みエラー:",
            error
        );


        // エラー時は空欄
        document.querySelectorAll(".subject")
            .forEach(input => {

                input.value = "";

                changeIcon(input);

            });

    }
}


// ===================================
// 教科アイコン
// ===================================

function changeIcon(input) {

    const subject = input.value.trim();

    let icon = input.parentElement.querySelector(".icon");

    if (!icon) return;

 // 空欄でも画像を表示
// 空欄でも薄い画像を表示
if (subject === "") {

    if (icon.tagName !== "IMG") {

        icon.outerHTML =
            '<img class="icon" alt="教科アイコン">';

        icon =
            input.parentElement.querySelector(".icon");
    }

    icon.src = "images/kyouka.jpg";

    icon.alt = "教科アイコン";

    icon.style.opacity = "0.5";

    return;
}
    // 教科が入力されたら画像にする
let image = null;

    if (subject.includes("数学") || subject.includes("関数")) {
        image = "suugaku.jpg";
    }
    else if (subject.includes("国語") || subject.includes("言語") || subject.includes("古典") || subject.includes("表現研究")) {
        image = "kokugo.jpg";
    }
    else if (subject.includes("英語") || subject.includes("英会話") || subject.includes("論理表現") || subject.includes("コミュニケーション")) {
        image = "eigo.jpg";
    }
    else if (subject.includes("体育") || subject.includes("保健") || subject.includes("武道") || subject.includes("スポーツ")) {
        image = "taiiku.jpg";
    }
    else if (subject.includes("科学") || subject.includes("物理") || subject.includes("化学") || subject.includes("地学") || subject.includes("生物") || subject.includes("生命")) {
        image = "rika.jpg";
    }
    else if (subject.includes("公共")) {
        image = "kouminn.jpg";
    }

    
    else if (subject.includes("ビジネス法規")||subject.includes("情報セキュリティ基礎")||subject.includes("セキュリティー")) {
        image = "sekyurityi-.jpg";
    }

    else if (subject.includes("情報") || subject.includes("ソフトウェア活用")  ||  subject.includes("開発") || subject.includes("生活")) {
        image = "zyouhou.jpg";
    }
    else if (subject.includes("地理")) {
        image = "tiri.jpg";
    }
    else if (subject.includes("史")) {
        image = "tiri.jpg";
    }
    else if (subject.includes("政治経済")) {
        image = "kouminn.jpg";
    }
    else if (subject.includes("音楽")) {
        image = "onngaku.jpg";
    }
    else if (subject.includes("美術")) {
        image = "bizyutu.jpg";
    }
    else if (subject.includes("書道")) {
        image = "syodou.jpg";
    }
    else if (subject.includes("家庭") || subject.includes("生活文化")) {
        image = "kateika.jpg";
    }
    
    else if (subject.includes("ビジネス")) {
        image = "bizinesu.jpg";
    }
    else if (subject.includes("商品開発と流通")) {
        image = "ma-ke.jpg";
    }
    else if (subject.includes("簿記") || subject.includes("財務会計") || subject.includes("原価計算")) {
        image = "kaikei.jpg";
    }
    else if (subject.includes("観光とマーケティング")) {
        image = "ma-ke.jpg";
    }
    else if (subject.includes("オフィススキル")||subject.includes("マルチメディア実習")||subject.includes("課題研究")||subject.includes("オフィススキル")) {
        image = "puroguraminngu.jpg";
    }
    else if (subject.includes("ホームルーム")) {
        image = "ho-mu.jpg";
    }
    else if (subject.includes("総合探究")　|| subject.includes("総合的な探究の時間")) {
        image = "sougoutannkyuu.jpg";
    }

// 該当する教科がない場合は本の画像
if (image === null) {

    image = "kyouka.jpg";

}
    // 画像に切り替え
    if (icon.tagName !== "IMG") {
        icon.outerHTML = '<img class="icon" alt="教科アイコン">';
        icon = input.parentElement.querySelector(".icon");
    }
    icon.src = "images/" + image;
    icon.alt = subject + "のアイコン";
    icon.style.opacity = "1";
}

// ===================================
// 曜日を選択
// ===================================

function showDay(day, button) {

    currentDay = day;


    // activeを全部外す
    document.querySelectorAll(".day-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    // 選択した曜日をactive
    if (button) {

        button.classList.add("active");

    }


    // Firebaseから読み込み
    loadSchedule();


    console.log(
        day + "曜日を選択"
    );
}


// ===================================
// ページ読み込み
// ===================================

window.addEventListener("load", function () {


    const params =
        new URLSearchParams(
            window.location.search
        );


    const day =
        params.get("day");


    // ===================================
    // 土曜日・日曜日
    // ===================================

    if (
        day === "土" ||
        day === "日"
    ) {

        Swal.fire({

            target: ".app",

            position: "top",

            icon: "info",

            title: "今日は休日です。",

            width: 280,

            confirmButtonColor: "#6b3df5"

        });

        return;
    }


    // ===================================
    // 曜日指定なし
    // ===================================

    if (!day) {

        const firstButton =
            document.querySelector(".day-btn");


        showDay(
            "月",
            firstButton
        );


        return;
    }


    // ===================================
    // URLの曜日を選択
    // ===================================

    const buttons =
        document.querySelectorAll(".day-btn");


    buttons.forEach(button => {

        if (
            button.textContent.trim() === day
        ) {

            showDay(
                day,
                button
            );

        }

    });

});


// ===================================
// HTMLから呼び出せるようにする
// ===================================

window.showDay =
    showDay;

window.saveSchedule =
    saveSchedule;

window.changeIcon =
    changeIcon;

