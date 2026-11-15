
import {
    userCollection,
    waitForUser
} from "./firebase.js";

import {
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const crownCount = document.getElementById("crownCount");
const medalList = document.getElementById("medalList");

async function showMedals() {

    try {
        await waitForUser();

        const snapshot = await getDocs(
            userCollection("qualifications")
        );

        medalList.innerHTML = "";

        const medals = [];

        // 商業経済検定の取得科目
        const commercialSubjects = new Set();

        // ビジネス文書の1級取得内容
        const documentSubjects = new Set();
// 会計実務検定の取得状況
const accountingExams = new Set();
        // ビジネス計算の1級取得内容
        const calculationSubjects = new Set();

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();
            const name = String(data.name || "").trim();
            const grade = String(data.grade || "").trim();

            // 商業経済検定
            if (
                name === "商業経済検定試験"
            ) {
                const subject = grade;

                if ([
                    "マーケティング",
                    "商品開発と流通",
                    "ビジネス法規",
                    "ビジネス・マネジメント"
                ].includes(subject)) {
                    commercialSubjects.add(subject);
                }

                return;
            }

            // ビジネス文書実務検定
            if (
                name === "ビジネス文書実務検定試験"
            ) {
         if (grade === "1級") {
    if (data.documentType === "両方") {
        documentSubjects.add("速度");
        documentSubjects.add("ビジネス文書");
    } else {
        documentSubjects.add(
            String(data.documentType || "").trim()
        );
    }
}

                return;
            }

            // ビジネス計算実務検定
            if (
                name === "ビジネス計算実務検定試験"
            ) {
                if (grade === "1級") {
    if (data.calculationType === "両方") {
        calculationSubjects.add("普通計算");
        calculationSubjects.add("ビジネス計算");
    } else {
        calculationSubjects.add(
            String(data.calculationType || "").trim()
        );
    }
}

                return;
            }

 
  // ビジネスコミュニケーション検定試験
if (name === "ビジネスコミュニケーション検定試験") {

    if (!medals.includes("ビジネスコミュニケーション検定試験")) {
        medals.push("ビジネスコミュニケーション検定試験");
    }

    return;
}       
// 会計実務検定：取得した検定ごとにメダル
if (name === "会計実務検定試験") {

    const subject = String(data.subject || "").trim();

    if ([
        "財務諸表分析検定試験",
        "財務会計検定試験",
        "管理会計検定試験"
    ].includes(subject)) {
        accountingExams.add(subject);
    }

    return;
}
            // その他の通常の1級資格
            if (grade === "1級") {
                medals.push(name || "資格名なし");
            }

        });

        // 商業経済検定：対象4科目中2科目以上
        if (commercialSubjects.size >= 2) {
            medals.push("商業経済検定試験");
        }

        // ビジネス文書：速度とビジネス文書の両方が1級
        if (
            documentSubjects.has("速度") &&
            documentSubjects.has("ビジネス文書")
        ) {
            medals.push("ビジネス文書実務検定試験");
        }
// 会計実務検定：取得した検定ごとにメダル
accountingExams.forEach(exam => {
    medals.push(exam);
});
        // ビジネス計算：普通計算とビジネス計算の両方が1級
        if (
            calculationSubjects.has("普通計算") &&
            calculationSubjects.has("ビジネス計算")
        ) {
            medals.push("ビジネス計算実務検定試験");
        }

        // 冠数表示
        crownCount.textContent = medals.length + "冠達成！";

        // メダルがない場合
        if (medals.length === 0) {

            medalList.innerHTML = `
                <div class="empty-message">
                    まだ一級資格のメダルはありません。<br>
                    一級を取得して金メダルを集めよう！
                </div>
            `;

            return;
        }

        // 金メダル表示
        medals.forEach((qualification) => {

            const item = document.createElement("div");
            item.className = "medal-item";

            const medal = document.createElement("div");
            medal.className = "medal-circle";
            medal.textContent = "★";

            const name = document.createElement("div");
            name.className = "medal-name";
            name.textContent = qualification;

            const grade = document.createElement("div");
            grade.className = "medal-name";
            grade.textContent = "1級認定";

            item.appendChild(medal);
            item.appendChild(name);
            item.appendChild(grade);

            medalList.appendChild(item);

        });

    } catch (error) {

        console.error("メダル読み込みエラー:", error);

        crownCount.textContent = "読み込み失敗";

        medalList.textContent =
            "メダルを読み込めませんでした。再読み込みしてください。";
    }
}

showMedals();
