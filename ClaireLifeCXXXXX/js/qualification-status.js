
import {
    userCollection,
    waitForUser
} from "./firebase.js";

import {
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// ===================================
// 資格データの読み込み
// ===================================

const area = document.getElementById("qualificationStatus");

async function showStatus() {

    await waitForUser();

    const snapshot = await getDocs(
        userCollection("qualifications")
    );

    const qualifications = [];

    snapshot.forEach(docSnap => {
        qualifications.push(docSnap.data());
    });

    area.innerHTML = "";


    // ===================================
    // 表を作る共通関数
    // ===================================

    function addTable(title, columns, rows) {

        const section = document.createElement("section");
        section.className = "qualification-status-section";

        const heading = document.createElement("h3");
        heading.textContent = title;
        section.appendChild(heading);

        const table = document.createElement("table");
        table.className = "qualification-status-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        rows.forEach(row => {

            const tr = document.createElement("tr");

            const label = document.createElement("th");
            label.textContent = row.label;
            tr.appendChild(label);

            row.values.forEach(value => {

                const td = document.createElement("td");
               
td.textContent =
    value === true ? "〇" :
    value === false ? "－" :
    value;

if (value === true) {
    td.className = "acquired";
}
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        area.appendChild(section);
    }

    // ===================================
    // 取得しているか確認する関数
    // ===================================

    function has(name, condition) {
        return qualifications.some(q =>
            q.name === name && condition(q)
        );
    }

    const grades = ["1級", "2級", "3級"];

    // ===================================
    // 情報処理検定
    // ===================================

    addTable(
        "情報処理検定試験",
        ["科目", "1級", "2級", "3級"],
        [
          {
    label: "プログラミング",
    values: [
        has("情報処理検定試験", q =>
            q.subject === "プログラミング" &&
            q.grade === "1級"
        ),
        has("情報処理検定試験", q =>
            q.subject === "プログラミング" &&
            q.grade === "2級"
        ),
        "×"
  　　　　　　　　  ]
　　　　　　　　　　　　　　},
            {
                label: "ビジネス情報",
                values: grades.map(g =>
                    has("情報処理検定試験", q =>
                        q.subject === "ビジネス情報" &&
                        q.grade === g
                    )
                )
            }
        ]
    );

    // ===================================
    // 簿記実務検定
    // ===================================

    
// ===================================
// 簿記実務検定
// ===================================

const section = document.createElement("section");
section.className = "qualification-status-section";

const heading = document.createElement("h3");
heading.textContent = "簿記実務検定試験";
section.appendChild(heading);

const table = document.createElement("table");
table.className = "qualification-status-table";

table.innerHTML = `
    <thead>
        <tr>
            <th>級</th>
            <th>科目</th>
            <th>取得状況</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

const tbody = table.querySelector("tbody");

// 1級・会計
const row1 = document.createElement("tr");

const gradeCell = document.createElement("th");
gradeCell.textContent = "1級";
gradeCell.rowSpan = 2;
row1.appendChild(gradeCell);

const subject1 = document.createElement("td");
subject1.textContent = "会計";
subject1.className = "subject-purple";
row1.appendChild(subject1);

const status1 = document.createElement("td");
const acquired1 = has("簿記実務検定試験", q =>
    q.grade === "1級" && q.subject === "会計"
);
status1.textContent = acquired1 ? "〇" : "－";
if (acquired1) status1.className = "acquired";
row1.appendChild(status1);

tbody.appendChild(row1);

// 1級・原価計算
const row2 = document.createElement("tr");

const subject2 = document.createElement("td");
subject2.textContent = "原価計算";
subject2.className = "subject-purple";
row2.appendChild(subject2);

const status2 = document.createElement("td");
const acquired2 = has("簿記実務検定試験", q =>
    q.grade === "1級" && q.subject === "原価計算"
);
status2.textContent = acquired2 ? "〇" : "－";
if (acquired2) status2.className = "acquired";
row2.appendChild(status2);

tbody.appendChild(row2);

// 2級・3級

// 2級・3級
["2級", "3級"].forEach(g => {

    const tr = document.createElement("tr");

    // 級と科目のマスを結合
    const grade = document.createElement("th");
    grade.colSpan = 2;
    grade.textContent = g;
    tr.appendChild(grade);

    // 取得状況
    const status = document.createElement("td");

    const acquired = has("簿記実務検定試験", q =>
        q.grade === g
    );

    status.textContent = acquired ? "〇" : "－";

    if (acquired) {
        status.className = "acquired";
    }

    tr.appendChild(status);
    tbody.appendChild(tr);
});
section.appendChild(table);
area.appendChild(section);

    // ===================================
    // 商業経済検定
    // ===================================

    const commercialSubjects = [
        "ビジネス基礎",
        "マーケティング",
        "商品開発と流通",
        "ビジネス法規",
        "ビジネス・マネジメント"
    ];

    addTable(
        "商業経済検定試験",
        ["科目", "取得状況"],
        commercialSubjects.map(subject => ({
            label: subject,
            values: [
                has("商業経済検定試験", q => q.grade === subject)
            ]
        }))
    );

    // ===================================
    // ビジネス計算実務検定
    // ===================================

    
// ===================================
// ビジネス計算実務検定
// ===================================

const calcSection = document.createElement("section");
calcSection.className = "qualification-status-section";

const calcHeading = document.createElement("h3");
calcHeading.textContent = "ビジネス計算実務検定試験";
calcSection.appendChild(calcHeading);

const calcTable = document.createElement("table");
calcTable.className = "qualification-status-table";

calcTable.innerHTML = `
    <thead>
        <tr>
            <th>計算方法</th>
            <th>内容</th>
            <th>1級</th>
            <th>2級</th>
            <th>3級</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

const calcTbody = calcTable.querySelector("tbody");

["電卓", "珠算"].forEach(method => {

    ["普通計算", "ビジネス計算"].forEach((type, index) => {

        const tr = document.createElement("tr");

        if (index === 0) {
            const methodCell = document.createElement("th");
            methodCell.textContent = method;
            methodCell.rowSpan = 2;
            tr.appendChild(methodCell);
        }

        const typeCell = document.createElement("td");
        typeCell.textContent = type;
        typeCell.className = "subject-purple";
        tr.appendChild(typeCell);

        grades.forEach(g => {

            const statusCell = document.createElement("td");

            const acquired = has("ビジネス計算実務検定試験", q =>
                q.method === method &&
                q.grade === g &&
                (
                    q.calculationType === type ||
                    q.calculationType === "両方"
                )
            );

            statusCell.textContent = acquired ? "〇" : "－";

            if (acquired) {
                statusCell.className = "acquired";
            }

            tr.appendChild(statusCell);
        });

        calcTbody.appendChild(tr);
    });
});

calcSection.appendChild(calcTable);
area.appendChild(calcSection);
    
  
   // ===================================
// ビジネス文書実務検定
// ===================================

addTable(
    "ビジネス文書実務検定試験",
    ["種類", "1級", "2級", "3級"],
    [
        {
            label: "ビジネス文書",
            values: grades.map(g =>
                has("ビジネス文書実務検定試験", q =>
                    q.grade === g &&
                    (
                        q.documentType === "ビジネス文書" ||
                        q.documentType === "両方"
                    )
                )
            )
        },
        {
            label: "速度",
            values: grades.map(g =>
                has("ビジネス文書実務検定試験", q =>
                    q.grade === g &&
                    (
                        q.documentType === "速度" ||
                        q.documentType === "両方"
                    )
                )
            )
        }
    ]
);
    // ===================================
    // 会計実務検定
    // ===================================

    const accountingExams = [
        "財務諸表分析検定試験",
        "財務会計検定試験",
        "管理会計検定試験"
    ];

    addTable(
        "会計実務検定試験",
        ["検定試験", "取得状況"],
        accountingExams.map(subject => ({
            label: subject,
            values: [
                has("会計実務検定試験", q => q.subject === subject)
            ]
        }))
    );

    // ===================================
    // 英語検定
    // ===================================

    addTable(
        "英語検定試験",
        ["級・レベル", "取得状況"],
        ["1級", "2級", "3級"].map(g => ({
            label: g,
            values: [
                has("英語検定試験", q => q.grade === g)
            ]
        }))
    );

    // ===================================
    // ビジネスコミュニケーション検定
    // ===================================

    addTable(
        "ビジネスコミュニケーション検定試験",
        ["検定", "取得状況"],
        [
            {
                label: "ビジネスコミュニケーション",
                values: [
                    has("ビジネスコミュニケーション検定", () => true)
                ]
            }
        ]
    );

    // ===================================
    // その他の資格
    // ===================================

    const knownNames = [
        "商業経済検定試験",
        "簿記実務検定試験",
        "情報処理検定試験",
        "ビジネス文書実務検定試験",
        "会計実務検定試験",
        "英語検定試験",
        "ビジネス計算実務検定試験",
        "ビジネスコミュニケーション検定試験"
    ];

    const otherQualifications = qualifications.filter(q =>
        !knownNames.includes(q.name)
    );

    if (otherQualifications.length > 0) {

        const rows = otherQualifications.map(q => ({
            label: q.name + (q.grade ? "・" + q.grade : ""),
            values: [true]
        }));

        addTable(
            "その他の資格",
            ["資格名・級", "取得状況"],
            rows
        );
    }
}

// ===================================
// 起動
// ===================================

showStatus().catch(error => {
    console.error(error);
    area.textContent = "資格取得状況を読み込めませんでした。";
});
