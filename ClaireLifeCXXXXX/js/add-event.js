
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

const params = new URLSearchParams(location.search);
const date = params.get("date") || "";
const editId = params.get("edit") || "";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const errorArea = document.getElementById("eventError");
const saveButton = document.getElementById("saveEventButton");
const startInput = document.getElementById("eventStartDate");
const endInput = document.getElementById("eventEndDate");
// 通知画面と同じカレンダー
const startPicker = flatpickr(startInput, {
    locale: flatpickr.l10ns.ja,
    dateFormat: "Y-m-d",
    allowInput: false,
    disableMobile: true,
    position: "center"
});

const endPicker = flatpickr(endInput, {
    locale: flatpickr.l10ns.ja,
    dateFormat: "Y-m-d",
    allowInput: false,
    disableMobile: true,
    position: "center"
});
const dateLabel = document.getElementById("eventDate");

function isValidDate(value) {
    if (!datePattern.test(value)) return false;

    const [y, m, d] = value.split("-").map(Number);
    const check = new Date(y, m - 1, d);

    return (
        check.getFullYear() === y &&
        check.getMonth() === m - 1 &&
        check.getDate() === d
    );
}

function updateDateLabel() {
    const start = startInput.value;
    const end = endInput.value;

    if (!isValidDate(start) || !isValidDate(end)) {
        dateLabel.textContent = "📅 開始日と終了日を選択してください";
        return;
    }

    const [sy, sm, sd] = start.split("-").map(Number);
    const [ey, em, ed] = end.split("-").map(Number);

    if (start === end) {
        dateLabel.textContent = ` ${sy}年${sm}月${sd}日の予定`;
    } else {
        dateLabel.textContent =
            ` ${sy}年${sm}月${sd}日 ～ ${ey}年${em}月${ed}日`;
    }
}
// ===================================
// 編集する予定を読み込む
// ===================================

async function loadEventForEdit() {
    try {
        await waitForUser();

        const eventRef = userDoc("events", editId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            errorArea.textContent = "予定が見つかりません。";
            saveButton.disabled = true;
            return;
        }

        const data = eventSnap.data();

        const startDate = data.startDate || data.date;
        const endDate = data.endDate || startDate;

        document.getElementById("eventTitle").value = data.title || "";
        document.getElementById("eventTime").value = data.time || "";
        document.getElementById("eventMemo").value = data.memo || "";

        startPicker.setDate(startDate, false);
        endPicker.set("minDate", startDate);
        endPicker.setDate(endDate, false);

        updateDateLabel();

        document.querySelector(".event-page h2").textContent =
            "自分の予定を編集";

        saveButton.textContent = "更新する";

        document.getElementById("backLink").href =
            `calendar.html?date=${encodeURIComponent(startDate)}`;

        document.getElementById("cancelLink").href =
            `calendar.html?date=${encodeURIComponent(startDate)}`;

    } catch (error) {
        console.error("予定の読み込みに失敗しました:", error);
        errorArea.textContent = "予定を読み込めませんでした。";
        saveButton.disabled = true;
    }
}
// カレンダーから受け取った日付を設定
// 新規追加の場合
if (!editId && !isValidDate(date)) {
    dateLabel.textContent = "日付が正しく指定されていません";
    saveButton.disabled = true;
    errorArea.textContent =
        "カレンダーに戻って日付を選び直してください。";

} else if (!editId) {
    startPicker.setDate(date, false);
    endPicker.setDate(date, false);

    endPicker.set("minDate", date);

    document.getElementById("backLink").href =
        `calendar.html?date=${encodeURIComponent(date)}`;

    document.getElementById("cancelLink").href =
        `calendar.html?date=${encodeURIComponent(date)}`;

    updateDateLabel();
}

startPicker.set("onChange", (selectedDates, dateStr) => {
    endPicker.set("minDate", dateStr);

    if (endInput.value && endInput.value < dateStr) {
        endPicker.setDate(dateStr, true);
    }

    updateDateLabel();
});

endPicker.set("onChange", updateDateLabel);
// 編集モードなら予定を読み込む
if (editId) {
    loadEventForEdit();
}
saveButton.addEventListener("click", async () => {
    const title = document.getElementById("eventTitle").value.trim();
    const startDate = startInput.value;
    const endDate = endInput.value;
    const time = document.getElementById("eventTime").value;
    const memo = document.getElementById("eventMemo").value.trim();

    errorArea.textContent = "";

    if (!title) {
        errorArea.textContent = "予定の内容を入力してください。";
        document.getElementById("eventTitle").focus();
        return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        errorArea.textContent = "開始日と終了日を正しく選択してください。";
        return;
    }

    if (endDate < startDate) {
        errorArea.textContent = "終了日は開始日以降にしてください。";
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "保存中...";

    try {
        await waitForUser();

        if (editId) {
    // 編集：既存の予定を更新
    await updateDoc(userDoc("events", editId), {
        title,
        date: startDate,
        startDate,
        endDate,
        time,
        memo
    });
} else {
    // 新規追加
    await addDoc(userCollection("events"), {
        title,
        date: startDate,
        startDate,
        endDate,
        time,
        memo,
        createdAt: new Date()
    });
}

        location.href =
            `calendar.html?date=${encodeURIComponent(startDate)}`;

    } catch (error) {
        console.error("予定の保存に失敗しました:", error);

        errorArea.textContent =
            "保存できませんでした。ログイン状態と通信を確認してください。";

        saveButton.disabled = false;
        saveButton.textContent = "保存する";
    }
});
