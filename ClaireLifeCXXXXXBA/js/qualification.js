
import {
    userCollection,
    userDoc,
    waitForUser
} from "./firebase.js";

import {
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const list = document.getElementById("qualificationList");

async function showQualifications() {

    await waitForUser();

    const snapshot = await getDocs(
        userCollection("qualifications")
    );

    list.innerHTML = "";

    if (snapshot.empty) {
        list.textContent = "まだ資格が登録されていません。";
        return;
    }

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const card = document.createElement("div");
        card.className = "task-card";

        // 資格名
        const title = document.createElement("h3");
        title.textContent = data.name || "資格名なし";
        card.appendChild(title);

        // 科目
        if (data.subject) {
            const subject = document.createElement("p");
            subject.textContent = "科目：" + data.subject;
            card.appendChild(subject);
        }

        // 計算方法
        if (data.method) {
            const method = document.createElement("p");
            method.textContent = "計算方法：" + data.method;
            card.appendChild(method);
        }

        // 検定内容（ビジネス計算）
        if (data.calculationType) {
            const calcType = document.createElement("p");
            calcType.textContent = "検定内容：" + data.calculationType;
            card.appendChild(calcType);
        }

        // 検定内容（ビジネス文書）
        if (data.documentType) {
            const documentType = document.createElement("p");
            documentType.textContent = "検定内容：" + data.documentType;
            card.appendChild(documentType);
        }

        // 級・レベル
        if (data.grade) {
            const grade = document.createElement("p");
            grade.textContent = "級・レベル：" + data.grade;
            card.appendChild(grade);
        }

        // 取得日
        const date = document.createElement("p");
        date.textContent = "取得日：" + (data.date || "未入力");
        card.appendChild(date);

        // ボタン
        const buttons = document.createElement("div");

        const editButton = document.createElement("button");
        editButton.textContent = "編集";
        editButton.onclick = () => {
            location.href = `qualification-add.html?id=${docSnap.id}`;
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.onclick = async () => {

            await deleteDoc(
                userDoc("qualifications", docSnap.id)
            );

            showQualifications();
        };

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        card.appendChild(buttons);

        list.appendChild(card);

    });
}

showQualifications();
