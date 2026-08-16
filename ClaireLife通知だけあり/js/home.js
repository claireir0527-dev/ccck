// 今日の日付を表示

const today = new Date();

const week = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
];

document.getElementById("today").textContent =
    `${today.getMonth() + 1}月${today.getDate()}日（${week[today.getDay()]}）`;



// 今日提出の提出物を確認

function checkTodayTasks() {

    let submits =
        JSON.parse(localStorage.getItem("submits")) || [];


    // 今日の日付を YYYY-MM-DD にする

    let now = new Date();

    let year = now.getFullYear();

    let month =
        String(now.getMonth() + 1).padStart(2, "0");

    let day =
        String(now.getDate()).padStart(2, "0");

    let todayString =
        `${year}-${month}-${day}`;


    // 今日が提出日の提出物だけ取得

    let todayTasks =
        submits.filter(item => {

            return item.date === todayString;

        });


    // ホームの表示場所

    let count =
        document.getElementById("workCount");

    let card =
        document.getElementById("taskCard");


    if (!count || !card) {
        return;
    }


    // 今日提出がある場合

    if (todayTasks.length > 0) {

        count.textContent =
            "⚠️ 今日提出 " + todayTasks.length + "件";

        card.classList.add("today-task");


    } else {

        count.textContent =
            "0件";

        card.classList.remove("today-task");

    }

}


checkTodayTasks();



// =========================
// 今日の時間割ページへ移動
// =========================


const todayScheduleLink =
    document.getElementById("todayScheduleLink");

if(todayScheduleLink){

    todayScheduleLink.addEventListener("click",function(e){

        e.preventDefault();


        let day = today.getDay();


        if(day == 0 || day == 6){

           Swal.fire({
    icon: "info",
    title: "今日は休日です",
    width: 280,

    customClass: {
        popup: "small-alert"
    },

    confirmButtonColor: "#6b3df5"
});

            return;

        }


        let todayName = week[day];

        location.href =
        "timetable.html?day=" + encodeURIComponent(todayName);

    });

}
const todayName = week[today.getDay()];

const scheduleText =
    document.getElementById("todayScheduleText");

if (scheduleText) {

    if (todayName === "土" || todayName === "日") {

        scheduleText.textContent = "休日";

    } else {

        scheduleText.textContent =
            todayName + "曜日の時間割";

    }

}



// 今日の通知件数を表示

function checkTodayNotice(){

    let notices =
    JSON.parse(localStorage.getItem("notices"))
    || [];


    let now = new Date();


    let year = now.getFullYear();

    let month =
    String(now.getMonth() + 1).padStart(2,"0");

    let day =
    String(now.getDate()).padStart(2,"0");


    let today =
    `${year}-${month}-${day}`;


    let todayNotices =
    notices.filter(notice=>{

        return notice.date === today;

    });


    let count =
    document.getElementById("noticeCount");


    if(count){

        count.textContent =
        todayNotices.length + "件";

    }
let card =
document.getElementById("noticeCard");


if(card){

    if(todayNotices.length > 0){

        card.classList.add("today-task");

    }else{

        card.classList.remove("today-task");

    }

}
}


checkTodayNotice();

function openTodayTask(){

    let submits =
    JSON.parse(localStorage.getItem("submits"))
    || [];

    let now = new Date();

    let today =
    now.getFullYear()
    + "-"
    + String(now.getMonth()+1).padStart(2,"0")
    + "-"
    + String(now.getDate()).padStart(2,"0");

    let todayTasks =
    submits.filter(item => item.date === today);

    if(todayTasks.length === 0){
Swal.fire({
    icon: "info",
    title: "今日の提出物はありません",
    width: 280,

    customClass:{
        popup:"small-alert"
    },

    confirmButtonColor: "#6b3df5"
});
        

    }else{

        location.href = "today-task.html";

    }

}


function openTodayNotice(){

    let notices =
    JSON.parse(localStorage.getItem("notices"))
    || [];

    let now = new Date();

    let today =
    now.getFullYear()
    + "-"
    + String(now.getMonth()+1).padStart(2,"0")
    + "-"
    + String(now.getDate()).padStart(2,"0");

    let todayNotices =
    notices.filter(item => item.date === today);

    if(todayNotices.length === 0){
 Swal.fire({
    icon: "info",
    title: "今日の通知はありません",
    width: 280,

    customClass:{
        popup:"small-alert"
    },

    confirmButtonColor: "#6b3df5"
});
    }else{

        location.href = "today-notice.html";

    }

}

const icon = localStorage.getItem("userIcon");

if (icon) {
    const button = document.getElementById("settingButton");

    button.innerHTML = `<img src="${icon}" class="setting-icon">`;
}
