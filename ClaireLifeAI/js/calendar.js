let calendar =
document.getElementById("calendar");


let today = new Date();


let year =
today.getFullYear();


let month =
today.getMonth();



function createCalendar(){


let first =
new Date(year,month,1);


let last =
new Date(year,month+1,0);



let html = `

<div class="calendar-header">

<button onclick="prevMonth()" class="month-btn">◀</button>

<h2>${year}年${month+1}月</h2>

<button onclick="nextMonth()" class="month-btn">▶</button>

</div>

<table class="calendar-table">

<tr>

<th>日</th>
<th>月</th>
<th>火</th>
<th>水</th>
<th>木</th>
<th>金</th>
<th>土</th>

</tr>

<tr>
`;



for(let i=0;i<first.getDay();i++){

html += "<td></td>";

}

let submits =
JSON.parse(localStorage.getItem("submits")) || [];

let notices =
JSON.parse(localStorage.getItem("notices")) || [];

for(let day=1;day<=last.getDate();day++){

    let date =
    year + "-" +
    String(month + 1).padStart(2,"0") + "-" +
    String(day).padStart(2,"0");

    let hasSubmit =
    submits.some(item => item.date === date);

    let hasNotice =
    notices.some(item => item.date === date);

    let mark = "";

if(hasSubmit && hasNotice){

    mark = "<br>📌";

}else if(hasSubmit){

    mark = "<br>📝";

}else if(hasNotice){

    mark = "<br>🔔";

}

    html += `
    <td id="day${day}" onclick="selectDay(${day})">
        ${day}
        ${mark}
    </td>
    `;

    if((first.getDay()+day)%7==0){

        html += "</tr><tr>";

    }

}

html += `

</tr>

</table>

<div id="dayPlan">

日付を選択してください

</div>

`;



calendar.innerHTML=html;
// 今月のときだけ今日の日付を選択
if(
    year === today.getFullYear() &&
    month === today.getMonth()
){
    selectDay(today.getDate());
}


}
function prevMonth(){

    month--;

    if(month < 0){

        month = 11;

        year--;

    }

    createCalendar();

}

function nextMonth(){

    month++;

    if(month > 11){

        month = 0;

        year++;

    }

    createCalendar();

}


function selectDay(day){

    // 前の選択を消す
    document.querySelectorAll(".calendar-table td").forEach(td => {
        td.classList.remove("selected-day");
    });


    // 今選んだ日を紫にする
    document.getElementById("day" + day)
    .classList.add("selected-day");


    let date =
        year + "-" +
        String(month + 1).padStart(2,"0") + "-" +
        String(day).padStart(2,"0");


    let submits =
        JSON.parse(localStorage.getItem("submits")) || [];

    let notices =
        JSON.parse(localStorage.getItem("notices")) || [];

    let submitText = "";

    submits.forEach((item,index) => {

    if(item.date === date){

        submitText += `

<div class="task-card">

<div class="task-title">
${item.title}
</div>

<div class="task-buttons">

<button class="edit-btn" onclick="editSubmit(${index})">
✏️
</button>

<button class="done-btn" onclick="calendarDeleteSubmit(${index})">
🗑️
</button>

</div>

</div>

`;
    }

});
　　

    

    let noticeText = "";

    notices.forEach((item,index) => {

    if(item.date === date){

        
noticeText += `

<div class="task-card">

<div class="task-title">
 ${item.text}
</div>

<div class="task-buttons">

<button class="edit-btn" onclick="editNotice(${index})">
✏️
</button>

<button class="done-btn" onclick="calendarDeleteNotice(${index})">
🗑️
</button>

</div>

</div>

`;
    }

});

 let html = `
<b>${year}年${month+1}月${day}日</b><br><br>
`;

if(submitText !== ""){

    html += `
    📝 提出物<br>
    ${submitText}
    
    `;

}

if(noticeText !== ""){

    html += `
    🔔 通知<br>
    ${noticeText}
    `;

}

if(submitText === "" && noticeText === ""){

    html += "ありません";

}
document.getElementById("dayPlan").innerHTML = html;

document.getElementById("dayPlan").scrollIntoView({

    behavior: "smooth",

    block: "start"

});
   
document.activeElement.blur();
    
}

createCalendar();

function calendarDeleteSubmit(index){

    let submits =
    JSON.parse(localStorage.getItem("submits")) || [];

    submits.splice(index,1);

    localStorage.setItem(
        "submits",
        JSON.stringify(submits)
    );

    createCalendar();

}

function calendarDeleteNotice(index){

    let notices =
    JSON.parse(localStorage.getItem("notices")) || [];

    notices.splice(index,1);

    localStorage.setItem(
        "notices",
        JSON.stringify(notices)
    );

    createCalendar();

}