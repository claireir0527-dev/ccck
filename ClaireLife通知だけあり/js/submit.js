// ===================================
// 提出物
// ===================================

function addSubmit(){

    const title =
        document.getElementById("title").value;

    const date =
        document.getElementById("date").value;

    // 提出物名チェック
    if(title.trim() === ""){

        Swal.fire({
            target: ".app",
            position: "top",
            icon: "warning",
            title: "提出物名を入力してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });

        return;
    }

    // 日付チェック
    if(date === ""){

        Swal.fire({
            target: ".app",
            position: "top",
            icon: "warning",
            title: "提出日を選択してください",
            width: 280,
            confirmButtonColor: "#6b3df5"
        });

        return;
    }

    let submits =
        JSON.parse(localStorage.getItem("submits")) || [];

    const editIndex =
        localStorage.getItem("editSubmitIndex");

    // 編集
    if(editIndex !== null){

        submits[Number(editIndex)] = {
            title: title,
            date: date
        };

        localStorage.removeItem("editSubmitIndex");

    }

    // 新規追加
    else{

        submits.push({
            title: title,
            date: date
        });

    }

    localStorage.setItem(
        "submits",
        JSON.stringify(submits)
    );

    Swal.fire({
        target: ".app",
        position: "top",
        icon: "success",
        title: editIndex !== null
            ? "更新しました！"
            : "追加しました！",
        width: 300,
        confirmButtonColor: "#6b3df5"
    }).then(() => {

        location.href = "tasks.html";

    });

}


// ===================================
// 提出物一覧
// ===================================

function loadSubmit(){

    const list =
        document.getElementById("submitList");

    if(!list){
        return;
    }

    let submits =
        JSON.parse(localStorage.getItem("submits")) || [];

    // 日付順
    submits.sort((a,b) => {
        return new Date(a.date) - new Date(b.date);
    });

    list.innerHTML = "";

    submits.forEach((item,index) => {

        const today = new Date();
        today.setHours(0,0,0,0);

        const target = new Date(item.date);
        target.setHours(0,0,0,0);

        const diff =
            Math.ceil(
                (target - today) /
                (1000 * 60 * 60 * 24)
            );

        let remainText;
        let remainClass;

        if(diff < 0){

            remainText = "❌ 期限切れ";
            remainClass = "expired";

        }
        else if(diff === 0){

            remainText = "⚠️ 今日提出！";
            remainClass = "today";

        }
        else if(diff === 1){

            remainText = "⏰ 明日提出";
            remainClass = "tomorrow";

        }
        else{

            remainText = "あと" + diff + "日";
            remainClass = "";

        }

        list.innerHTML += `

<div class="task-card">

    <div class="task-title">
        ${item.title}
    </div>

    <div class="task-date">
        📅 期限：${item.date}
    </div>

    <div class="task-remain ${remainClass}">
        ${remainText}
    </div>

    <div class="task-buttons">

        <button
            class="edit-btn"
            onclick="editSubmit(${index})">
            編集
        </button>

        <button
            class="done-btn"
            onclick="deleteSubmit(${index})">
            提出済み
        </button>

    </div>

</div>

`;

    });

}


// ===================================
// 提出物削除
// ===================================

function deleteSubmit(index){

    let submits =
        JSON.parse(localStorage.getItem("submits")) || [];

    submits.splice(index,1);

    localStorage.setItem(
        "submits",
        JSON.stringify(submits)
    );

    loadSubmit();

}


// ===================================
// 編集
// ===================================

function editSubmit(index){

    localStorage.setItem(
        "editSubmitIndex",
        index
    );

    location.href = "add-submit.html";

}


// ===================================
// 日付カレンダー
// ===================================

function setupDatePicker(){

    const dateInput =
        document.getElementById("date");

    if(!dateInput){
        return;
    }

    flatpickr(dateInput, {

        locale: flatpickr.l10ns.ja,

        dateFormat: "Y-m-d",

        allowInput: false,

        disableMobile: true,

        position: "center"

    });

}


// ===================================
// 戻る
// ===================================

function backSubmit(){

    const title =
        document.getElementById("title").value;

    const date =
        document.getElementById("date").value;

    if(title !== "" || date !== ""){

       Swal.fire({
    icon: "warning",
    title: "提出物名を入力してください",
    width: 280,
    customClass: {
        popup: "small-alert"
    },
    confirmButtonColor: "#6b3df5"
});
    }
    else{

        location.href = "submit-menu.html";

    }

}


// ===================================
// キャンセル
// ===================================

function cancelSubmit(){

    const title =
        document.getElementById("title").value;

    const date =
        document.getElementById("date").value;

    if(title !== "" || date !== ""){

        Swal.fire({

            target: ".app",

            position: "top",

            icon: "question",

            title: "入力内容を消しますか？",

            width: 280,

            showCancelButton: true,

            confirmButtonText: "消す",

            cancelButtonText: "戻る",

            confirmButtonColor: "#6b3df5"

        }).then((result) => {

            if(result.isConfirmed){

                document.getElementById("title").value = "";

                document.getElementById("date").value = "";

                checkInput();

            }

        });

    }

}


// ===================================
// 入力状態によるボタン変更
// ===================================

function checkInput(){

    const title =
        document.getElementById("title").value;

    const date =
        document.getElementById("date").value;

    const cancel =
        document.getElementById("cancelBtn");

    const home =
        document.getElementById("homeBtn");

    if(title !== "" || date !== ""){

        cancel.style.display = "block";
        home.style.display = "none";

    }
    else{

        cancel.style.display = "none";
        home.style.display = "block";

    }

}


// ===================================
// ホーム
// ===================================

function goHome(){

    location.href = "index.html";

}


// ===================================
// ページ読み込み
// ===================================

window.addEventListener("load", function(){

    // 日付カレンダー
    setupDatePicker();

    // 一覧ページなら読み込み
    if(document.getElementById("submitList")){

        loadSubmit();

    }

    // 編集モード
    const index =
        localStorage.getItem("editSubmitIndex");

    if(index !== null){

        const submits =
            JSON.parse(localStorage.getItem("submits")) || [];

        if(submits[index]){

            document.getElementById("title").value =
                submits[index].title;

            document.getElementById("date").value =
                submits[index].date;

            document.querySelector(".save").textContent =
                "💾 更新";

            document.getElementById("homeBtn").textContent =
                "🔙 一覧に戻る";

            document.getElementById("homeBtn").onclick =
                function(){

                    location.href = "tasks.html";

                };

        }

    }

    // 入力状態を確認
    checkInput();

});


// ===================================
// 入力イベント
// ===================================

document.addEventListener("DOMContentLoaded", function(){

    const title =
        document.getElementById("title");

    const date =
        document.getElementById("date");

    if(title){

        title.addEventListener(
            "input",
            checkInput
        );

    }

    if(date){

        date.addEventListener(
            "change",
            checkInput
        );

    }

});
