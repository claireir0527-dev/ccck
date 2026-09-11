let notices =
JSON.parse(localStorage.getItem("notices")) || [];



function showNotice(){

    let list =
    document.getElementById("noticeList");

    // 通知リスト画面ではない場合
    if(!list){
        return;
    }

    list.innerHTML = "";


    notices.forEach((notice,index)=>{

        let div = document.createElement("div");

        div.className = "card";


        // 昔の通知（文字だけ）にも対応
        if(typeof notice === "string"){

            div.innerHTML =
            `
            <div>
                🔔 ${notice}
            </div>

            <button onclick="deleteNotice(${index})">
                削除
            </button>
            `;

        }

        else{

    let today = new Date();

    today.setHours(0,0,0,0);


    let target = new Date(notice.date);

    target.setHours(0,0,0,0);


    let diff =
    Math.ceil(
        (target - today) / (1000 * 60 * 60 * 24)
    );


    let remainText;
    let remainClass;


    if(diff < 0){

        remainText = "❌ 期限切れ";
        remainClass = "expired";

    }

    else if(diff === 0){

        remainText = "⚠️ 今日";
        remainClass = "today";

    }

    else if(diff === 1){

        remainText = "⏰ 明日";
        remainClass = "tomorrow";

    }

    else{

        remainText = "あと" + diff + "日";
        remainClass = "";

    }



div.innerHTML =
`
<div class="notice-content">

    <div class="notice-text">
        🔔 ${notice.text}
    </div>

    <div class="notice-datetime">

        <span>
            📅 ${notice.date}
        </span>

        ${
            notice.time
            ? `<span>⏰ ${notice.time}</span>`
            : ""
        }

    </div>

    <div class="notice-remain">
        <span class="${remainClass}">
            ${remainText}
        </span>
    </div>

</div>

<div class="task-buttons">

    <button
        class="edit-btn"
        onclick="editNotice(${index})">
        編集
    </button>

    <button
        class="done-btn"
        onclick="deleteNotice(${index})">
        削除
    </button>

</div>
`;}

        list.appendChild(div);

    });

}
function editNotice(index){

    localStorage.setItem(
        "editNoticeIndex",
        index
    );

    location.href="add-notice.html";

}
function addNotice(){

    let text =
    document.getElementById("noticeText").value.trim();

    let date =
    document.getElementById("noticeDate").value;

    let timeInput =
    document.getElementById("noticeTime");

    let time =
    timeInput ? timeInput.value : "";


    // 内容と日付だけ必須
    if(text === "" || date === ""){

        Swal.fire({

            icon: "warning",

            title: "入力してください",

            text: "通知内容と日付を入力してください",

            width: 280,

            confirmButtonColor: "#6b3df5"

        });

        return;

    }


    let notices =
    JSON.parse(localStorage.getItem("notices")) || [];


    let editIndex =
    localStorage.getItem("editNoticeIndex");


    if(editIndex !== null){

        notices[editIndex] = {

            text: text,

            date: date,

            time: time

        };


        localStorage.removeItem(
            "editNoticeIndex"
        );


    }else{

        notices.push({

            text: text,

            date: date,

            time: time

        });

    }


    localStorage.setItem(
        "notices",
        JSON.stringify(notices)
    );


    location.href="notice.html";

}



function deleteNotice(index){

    notices.splice(index,1);


    localStorage.setItem(
        "notices",
        JSON.stringify(notices)
    );


    showNotice();

}



showNotice();


if(document.getElementById("noticeDate")){

    flatpickr("#noticeDate",{

        locale: flatpickr.l10ns.ja,

        dateFormat:"Y-m-d",

        allowInput:false,

        disableMobile:true,

        position:"center"
 });
}

function cancelNotice(){

    document.getElementById("noticeText").value = "";

    document.getElementById("noticeDate").value = "";

    document.getElementById("noticeTime").value = "";

    document.getElementById("timePlaceholder").style.display = "block";


    document.getElementById("cancelNoticeBtn")
    .style.display="none";


    document.getElementById("homeNoticeBtn")
    .style.display="block";

}



function checkNoticeInput(){

    let text =
    document.getElementById("noticeText").value;

    let date =
    document.getElementById("noticeDate").value;

    let time =
    document.getElementById("noticeTime").value;

    let cancel =
    document.getElementById("cancelNoticeBtn");

    let home =
    document.getElementById("homeNoticeBtn");


    if(text != "" || date != "" || time != ""){

        cancel.style.display="block";

        home.style.display="none";

    }else{

        cancel.style.display="none";

        home.style.display="block";

    }

}

document
.getElementById("noticeText")
.addEventListener(
"input",
checkNoticeInput
);



document
.getElementById("noticeDate")
.addEventListener(
"change",
checkNoticeInput
);

document
.getElementById("noticeTime")
.addEventListener(
"change",
checkNoticeInput
);

function goHomeNotice(){

    location.href="index.html";

}

function backNotice(){

    let text =
    document.getElementById("noticeText").value;


    let date =
    document.getElementById("noticeDate").value;



    if(text != "" || date != ""){


        Swal.fire({

    icon: "warning",

    title: "保存されていません",

    text: "入力内容があります",

    width: 280,

    customClass: {
        popup: "small-alert"
    },

    confirmButtonColor: "#6b3df5"

});

    }else{


        location.href="notice-menu.html";


    }

}

window.onload = function(){

    let index =
    localStorage.getItem("editNoticeIndex");


    if(index !== null){

        let notices =
        JSON.parse(localStorage.getItem("notices")) || [];


        document.getElementById("noticeText").value =
        notices[index].text;


        document.getElementById("noticeDate").value =
        notices[index].date;

document.getElementById("noticeTime").value =
notices[index].time || "";

if(notices[index].time){
    document.getElementById("timePlaceholder").style.display = "none";
}
        document.querySelector(".save").textContent =
        "💾 更新";
document.getElementById("homeNoticeBtn").textContent =
"🔙 一覧に戻る";

document.getElementById("homeNoticeBtn").onclick =
function(){

    location.href="notice.html";

};

    }else{

        document.querySelector(".save").textContent =
        "💾 保存";

    }

}
const noticeTime = document.getElementById("noticeTime");
const timePlaceholder = document.getElementById("timePlaceholder");

noticeTime.addEventListener("change", function(){
    if(this.value){
        timePlaceholder.style.display = "none";
    }else{
        timePlaceholder.style.display = "block";
    }
});
