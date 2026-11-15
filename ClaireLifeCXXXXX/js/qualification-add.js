
import {
    userCollection,
    userDoc,
    waitForUser
} from "./firebase.js";

import {
    addDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// ===================================
// HTML要素
// ===================================

const type = document.getElementById("qualificationType");
const otherName = document.getElementById("otherName");
const otherArea = document.getElementById("otherNameArea");

const grade = document.getElementById("qualificationGrade");
const gradeLabel = document.getElementById("gradeLabel");
const gradeArea = document.getElementById("gradeArea");

const date = document.getElementById("qualificationDate");
const saveButton = document.getElementById("saveQualification");
const pageTitle = document.getElementById("pageTitle");

const accountingArea =
    document.getElementById("accountingSubjectArea");
const accountingSubject =
    document.getElementById("accountingSubject");

const informationArea =
    document.getElementById("informationSubjectArea");
const informationSubject =
    document.getElementById("informationSubject");

const businessCalcArea =
    document.getElementById("businessCalcArea");
const businessCalcMethod =
    document.getElementById("businessCalcMethod");
const businessCalcTypeArea =
    document.getElementById("businessCalcTypeArea");
const businessCalcType =
    document.getElementById("businessCalcType");

const businessDocumentArea =
    document.getElementById("businessDocumentArea");
const businessDocumentType =
    document.getElementById("businessDocumentType");

const accountingExamArea =
    document.getElementById("accountingExamArea");
const accountingExam =
    document.getElementById("accountingExam");

const params = new URLSearchParams(location.search);
const editId = params.get("id");// ===================================
// 共通通知
// ===================================

function showNotice(message, icon = "warning") {
    return Swal.fire({
        icon: icon,
        title: message,
        width: 280,
        position: "top",
        confirmButtonText: "OK",
        confirmButtonColor: "#6b3df5",
        didOpen: () => {
            document.querySelector(".swal2-popup").style.marginTop = "70px";
        }
    });
}



// ===================================
// 日付カレンダー
// ===================================

let datePicker = null;

if (typeof flatpickr !== "undefined") {
    datePicker = flatpickr(date, {
        locale: flatpickr.l10ns.ja,
        dateFormat: "Y-m-d",
        allowInput: false,
        disableMobile: true,
        position: "auto"
    });
}

// ===================================
// 級の選択肢を作る
// ===================================

function setGrades(levels, label = "級・レベル") {

    gradeLabel.textContent = label;
    grade.innerHTML = "";

    grade.add(new Option("選択してください", ""));

    levels.forEach(level => {
        grade.add(new Option(level, level));
    });

    gradeArea.style.display = "block";
}

// ===================================
// 資格の種類を変更したとき
// ===================================

type.addEventListener("change", () => {

    // その他の入力欄
    otherArea.style.display =
        type.value === "その他" ? "block" : "none";

    // すべての専用エリアをいったん隠す
    accountingArea.style.display = "none";
    informationArea.style.display = "none";
    businessCalcArea.style.display = "none";
    businessCalcTypeArea.style.display = "none";
    businessDocumentArea.style.display = "none";
    accountingExamArea.style.display = "none";

    // 専用選択欄をリセット
    accountingSubject.value = "";
    informationSubject.value = "";
    businessCalcMethod.value = "";
    businessCalcType.value = "";
    businessDocumentType.value = "";
    accountingExam.value = "";

    // 通常の級選択を表示
    setGrades([
        "1級",
        "2級",
        "3級",
        "その他・無"
    ]);

    // 商業経済検定
    if (type.value === "商業経済検定") {

        setGrades([
            "ビジネス基礎",
            "マーケティング",
            "商品開発と流通",
            "ビジネス法規",
            "ビジネス・マネジメント"
        ], "科目");
    }

    // 簿記実務検定
    if (type.value === "簿記実務検定") {
        // 1級のときだけ科目選択を表示
        accountingArea.style.display = "none";
    }

    // 情報処理検定
    if (type.value === "情報処理検定") {

        informationArea.style.display = "block";
        gradeArea.style.display = "none";
    }

    // ビジネス計算実務検定
    if (type.value === "ビジネス計算実務検定") {

        businessCalcArea.style.display = "block";
        gradeArea.style.display = "none";
    }

    // ビジネス文書実務検定
    if (type.value === "ビジネス文書実務検定") {

        businessDocumentArea.style.display = "block";
        gradeArea.style.display = "none";
    }
// ビジネスコミュニケーション検定
if (type.value === "ビジネスコミュニケーション検定") {
    gradeArea.style.display = "none";
}
    // 会計実務検定
    if (type.value === "会計実務検定") {

    accountingExamArea.style.display = "block";

    gradeArea.style.display = "none";
}
});

// ===================================
// 簿記実務検定：1級の科目
// ===================================

grade.addEventListener("change", () => {

    if (
        type.value === "簿記実務検定" &&
        grade.value === "1級"
    ) {
        accountingArea.style.display = "block";
    } else {
        accountingArea.style.display = "none";
        accountingSubject.value = "";
    }
});

// ===================================
// 情報処理検定：科目を選んだとき
// ===================================

informationSubject.addEventListener("change", () => {

    if (informationSubject.value === "プログラミング") {

        setGrades(["1級", "2級"]);

    } else if (informationSubject.value === "ビジネス情報") {

        setGrades(["1級", "2級", "3級"]);

    } else {
        gradeArea.style.display = "none";
    }
});

// ===================================
// ビジネス計算：電卓・珠算
// ===================================

businessCalcMethod.addEventListener("change", () => {

    businessCalcType.value = "";
    grade.value = "";

    businessCalcTypeArea.style.display =
        businessCalcMethod.value ? "block" : "none";

    gradeArea.style.display = "none";
});

// ===================================
// ビジネス計算：検定内容
// ===================================

businessCalcType.addEventListener("change", () => {

    if (businessCalcType.value) {
        setGrades(["1級", "2級", "3級"]);
    } else {
        gradeArea.style.display = "none";
    }
});

// ===================================
// ビジネス文書：検定内容
// ===================================

businessDocumentType.addEventListener("change", () => {

    if (businessDocumentType.value) {
        setGrades(["1級", "2級", "3級"]);
    } else {
        gradeArea.style.display = "none";
    }
});

// ===================================
// 編集時のデータ読み込み
// ===================================

async function loadQualification() {

    await waitForUser();

    if (!editId) return;

    pageTitle.textContent = "資格の編集";
    saveButton.textContent = "更新する";

    const snapshot = await getDoc(
        userDoc("qualifications", editId)
    );

    if (!snapshot.exists()) {
        alert("資格が見つかりません。");
        location.href = "qualification.html";
        return;
    }

    const data = snapshot.data();

    const knownTypes = [
        "商業経済検定",
        "簿記実務検定",
        "情報処理検定",
        "ビジネス文書実務検定",
        "珠算・電卓実務検定",
        "英語検定",
        "会計実務検定",
        "ビジネス計算実務検定",
        "ビジネスコミュニケーション検定",
        "会計"
    ];

    // 先に資格の種類を設定
    if (knownTypes.includes(data.name)) {
        type.value = data.name;
    } else {
        type.value = "その他";
        otherName.value = data.name || "";
    }

    // 資格の種類に応じた選択欄を表示
    type.dispatchEvent(new Event("change"));

    // 商業経済検定
    if (data.name === "商業経済検定") {
        grade.value = data.grade || "";
    }

    // 簿記実務検定
    if (data.name === "簿記実務検定") {

        grade.value = data.grade || "";

        grade.dispatchEvent(new Event("change"));

        accountingSubject.value = data.subject || "";
    }

    // 情報処理検定
    if (data.name === "情報処理検定") {

        informationSubject.value = data.subject || "";

        informationSubject.dispatchEvent(new Event("change"));

        grade.value = data.grade || "";
    }

    // ビジネス計算実務検定
    if (data.name === "ビジネス計算実務検定") {

        businessCalcMethod.value = data.method || "";
        businessCalcMethod.dispatchEvent(new Event("change"));

        businessCalcType.value = data.calculationType || "";
        businessCalcType.dispatchEvent(new Event("change"));

        grade.value = data.grade || "";
    }

    // ビジネス文書実務検定
    if (data.name === "ビジネス文書実務検定") {

        businessDocumentType.value = data.documentType || "";
        businessDocumentType.dispatchEvent(new Event("change"));

        grade.value = data.grade || "";
    }

    // 会計実務検定
    if (data.name === "会計実務検定") {

        accountingExam.value = data.subject || "";
        grade.value = "無";
    }

    // その他・通常の資格
    if (
        ![
            "商業経済検定",
            "簿記実務検定",
            "情報処理検定",
            "ビジネス計算実務検定",
            "ビジネス文書実務検定",
            "会計実務検定"
        ].includes(data.name)
    ) {
        grade.value = data.grade || "";
    }

    // 取得日
    if (datePicker) {
        datePicker.setDate(data.date || "", true);
    } else {
        date.value = data.date || "";
    }
}

// ===================================
// 登録・更新
// ===================================

saveButton.addEventListener("click", async () => {

    const selectedType = type.value;

    if (!selectedType) {
       await showNotice ("資格の種類を選んでね。");
        return;
    }

    const name =
        selectedType === "その他"
            ? otherName.value.trim()
            : selectedType;

    if (!name) {
        await showNotice("資格名を入力してね。");
        return;
    }

    // 情報処理検定のチェック
    if (
        selectedType === "情報処理検定" &&
        !informationSubject.value
    ) {
        await showNotice("科目を選んでね。");
        return;
    }

    // ビジネス計算のチェック
    if (
        selectedType === "ビジネス計算実務検定" &&
        (!businessCalcMethod.value || !businessCalcType.value)
    ) {
        await showNotice("計算方法と検定内容を選んでね。");
        return;
    }

    // ビジネス文書のチェック
    if (
        selectedType === "ビジネス文書実務検定" &&
        !businessDocumentType.value
    ) {
        await showNotice("検定内容を選んでね。");
        return;
    }

    // 会計実務検定のチェック
    if (
        selectedType === "会計実務検定" &&
        !accountingExam.value
    ) {
        await showNotice("検定試験を選んでね。");
        return;
    }

   // 級のチェック（会計以外）

// 級が必要な資格だけチェック
if (
    selectedType !== "会計実務検定" &&
    selectedType !== "ビジネスコミュニケーション検定" &&
    !grade.value
) {
    await showNotice("級・レベルを選んでね。");
    return;
}
    // 簿記1級の科目チェック
    if (
        selectedType === "簿記実務検定" &&
        grade.value === "1級" &&
        !accountingSubject.value
    ) {
        await showNotice("会計か原価計算を選んでね。");
        return;
    }

    

    // 保存データ
    const data = {

        name: name,

        grade:
    selectedType === "会計実務検定" ||
    selectedType === "ビジネスコミュニケーション検定"
        ? ""
        : grade.value.trim(),
        subject:
            selectedType === "情報処理検定"
                ? informationSubject.value
                : selectedType === "簿記実務検定" &&
                  grade.value === "1級"
                    ? accountingSubject.value
                    : selectedType === "会計実務検定"
                        ? accountingExam.value
                        : "",

        method:
            selectedType === "ビジネス計算実務検定"
                ? businessCalcMethod.value
                : "",

        calculationType:
            selectedType === "ビジネス計算実務検定"
                ? businessCalcType.value
                : "",

        documentType:
            selectedType === "ビジネス文書実務検定"
                ? businessDocumentType.value
                : "",

        date: date.value
    };

    try {

        await waitForUser();

        
if (editId) {

    await updateDoc(
        userDoc("qualifications", editId),
        data
    );

} else {

    await addDoc(
        userCollection("qualifications"),
        data
    );
}

// 完了通知
await Swal.fire({
    icon: "success",
    title: editId ? "更新しました！" : "登録しました！",
    text: "資格の情報を保存しました。",
    width: 280,
    position: "top",
    confirmButtonText: "OK",
    confirmButtonColor: "#6b3df5",
    customClass: {
        popup: "small-alert"
    }
});



    
        location.href = "qualification.html";

    } catch (error) {

        console.error(error);

        alert("保存できませんでした。もう一度試してね。");
    }
});

// ===================================
// 起動
// ===================================

loadQualification();
