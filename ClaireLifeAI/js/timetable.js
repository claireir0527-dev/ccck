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


if(subject.includes("数学")||subject.includes("関数")){

icon.textContent="📐";

}

else if(subject.includes("国語") || subject.includes("古典") || subject.includes("言語")|| subject.includes("表現")){

icon.textContent="🔤";

}

else if(subject.includes("英語")||subject.includes("論理表現")||subject.includes("英会話")){
    
icon.textContent="ABC";

}

else if(subject.includes("体育")||subject.includes("武道")||subject.includes("スポーツ")){

icon.textContent="🏃";

}
else if(subject.includes("家庭基礎")||subject.includes("生活文化")){

icon.textContent="🍳";

}
else if(subject.includes("保健")){

icon.textContent="❤️";

}

else if(subject.includes("地理")){

icon.textContent="🌎";

}
else if(subject.includes("史")){

icon.textContent="📜";

}

else if(subject.includes("政治経済")||subject.includes("公共")){

icon.textContent="🏛️";

}

else if(subject.includes("物理")||subject.includes("生物")||subject.includes("化学")||subject.includes("科学")
    ||subject.includes("地学")){

    icon.textContent="⚛️";
}


else if(subject.includes("音楽")){

    icon.textContent="🎵";

}
else if(subject.includes("美術")){

    icon.textContent="🎨";

}else if(subject.includes("書道")){

    icon.textContent="🖌";

}
else if(subject.includes("HR")||subject.includes("ホームルーム")){

    icon.textContent="🏠";

}

else if(subject.includes("総合的な探究の時間")){

    icon.textContent="🏠";

}

else if(subject.includes("ビジネス基礎")){

    icon.textContent="ℹ️";

}
else if(subject.includes("課題研究")){

    icon.textContent="ℹ️";

}
else if(subject.includes("ビジネスコミュニケーション")){

    icon.textContent="ℹ️";

}
else if(subject.includes("商品開発と流通")){

    icon.textContent="ℹ️";

}
else if(subject.includes("ビジネス法規")){

    icon.textContent="ℹ️";

}
else if(subject.includes("簿記")){

    icon.textContent="ℹ️";

}
else if(subject.includes("財務会計")){

    icon.textContent="ℹ️";

}
else if(subject.includes("原価計算")){

    icon.textContent="ℹ️";

}
else if(subject.includes("情報処理")){

    icon.textContent="ℹ️";

}
else if(subject.includes("観光とマーケティング")){

    icon.textContent="ℹ️";

}
else if(subject.includes("オフィススキル")){

    icon.textContent="ℹ️";

}
else if(subject.includes("ビジネスマネジメント")){

    icon.textContent="ℹ️";

}
else if(subject.includes("ソフトウェア活用")){

    icon.textContent="ℹ️";

}
else if(subject.includes("プログラミング")){

    icon.textContent="ℹ️";

}
else if(subject.includes("マルチメディア実習")||subject.includes("マルチメディア")){

    icon.textContent="ℹ️";

}
else if(subject.includes("情報セキュリティ基礎")||subject.includes("情報セキュリティ")){

    icon.textContent="ℹ️";

}

else if(subject.includes("開発とテクノロジー")){

    icon.textContent="ℹ️";

}
else if(subject.includes("生活とテクノロジー")){

    icon.textContent="ℹ️";

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


