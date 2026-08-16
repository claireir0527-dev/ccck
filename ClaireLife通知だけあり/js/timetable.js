let currentDay="月";


function changeDay(day){

currentDay=day;


document.querySelectorAll(".subject")
.forEach(input=>{

input.value="";

});


loadSchedule();


}



function saveSchedule(){

let subjects=[];


document.querySelectorAll(".subject").forEach(input => {
    subjects.push(input.value.trim());
});

let allEmpty = subjects.every(subject => subject === "");

if(allEmpty){
Swal.fire({

    target: ".app",

    position: "top",


    icon:"warning",

    title:"1つ以上教科を入力してください",

    width:280,

    confirmButtonColor:"#6b3df5"

});
window.scrollTo({

    top:0,

    behavior:"smooth"

});
    return;

}





localStorage.setItem(

"schedule_"+currentDay,

JSON.stringify(subjects)

);

document.querySelectorAll(".subject").forEach(input=>{
    changeIcon(input);
});
Swal.fire({
    
    target: ".app",

    position: "top",

    icon:"success",

    title:"保存しました！",

    width:280,

    confirmButtonColor:"#6b3df5"

});
window.scrollTo({

    top:0,

    behavior:"smooth"

});
}



function loadSchedule(){

let data=
JSON.parse(
localStorage.getItem(
"schedule_"+currentDay
)
)
|| [];


let inputs=
document.querySelectorAll(".subject");


inputs.forEach((input,index)=>{

input.value=data[index] || "";

changeIcon(input);

});


}



window.onload=function(){

document.querySelector(".day-btn").classList.add("active");

loadSchedule();

}





function changeIcon(input){

let icon =
input.parentElement.querySelector(".icon");


let subject=input.value;


if(subject.includes("数学")){

icon.textContent="📐";

}

else if(subject.includes("国語")){

icon.textContent="🔤";

}

else if(subject.includes("英語")){

icon.textContent="ABC";

}

else if(subject.includes("体育")){

icon.textContent="🏃";

}

else if(subject.includes("科学")){

icon.textContent="🔬";

}

else if(subject.includes("社会")){

icon.textContent="🌏";

}

else if(subject.includes("情報")){

icon.textContent="💻";

}
else if(subject.includes("開発")){

icon.textContent="⚙️";

}

else if(subject.includes("地理")){

icon.textContent="🌎";

}
else if(subject.includes("史")){

icon.textContent="📜";

}

else if(subject.includes("政治経済")){

icon.textContent="🏛️";

}

else if(subject.includes("地学")){

icon.textContent="🌋";

}
else if(subject.includes("物理")){

    icon.textContent="⚛️";

}

else if(subject.includes("生物")){

    icon.textContent="🧬";

}

else if(subject.includes("課題研究")){

    icon.textContent="🔎";

}

else if(subject.includes("ビジネス")){

    icon.textContent="💼";

}






else{

icon.textContent="📖";

}

}


function showDay(day, button) {

    currentDay = day;

    document.querySelectorAll(".day-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    loadSchedule();

    console.log(day + "曜日を選択");
}


// =========================
// ホームから来た場合
// 今日の曜日を自動選択
// =========================

window.addEventListener("load", function () {

    const params =
        new URLSearchParams(window.location.search);

    const day =
        params.get("day");

    // 土日ならメッセージを表示して終了
    if (day === "土" || day === "日") {

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

    // パラメータがなければ月曜日を表示
    if (!day) {

        showDay("月", document.querySelector(".day-btn"));

        return;

    }

    const buttons =
        document.querySelectorAll(".day-btn");

    buttons.forEach(button => {

        if (button.textContent.trim() === day) {

            showDay(day, button);

        }

    });

});


