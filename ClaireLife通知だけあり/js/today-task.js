let today = new Date();


let todayDate =
today.getFullYear()
+
"-"
+
String(today.getMonth()+1).padStart(2,"0")
+
"-"
+
String(today.getDate()).padStart(2,"0");



let submits =
JSON.parse(localStorage.getItem("submits"))
|| [];



let list =
document.getElementById("todayTaskList");



submits.forEach(item=>{


    if(item.date == todayDate){


      list.innerHTML += `

<div class="task-card">

<div class="task-title">

${item.title}

</div>


<div class="task-date">

📅 ${item.date}

</div>

<button class="done-btn" onclick="submitTodayTask(${submits.indexOf(item)})">

提出済み

</button>


</div>

`;  

    }


});


function submitTodayTask(index){

    let submits =
    JSON.parse(localStorage.getItem("submits"))
    || [];


    submits.splice(index,1);


    localStorage.setItem(
        "submits",
        JSON.stringify(submits)
    );


    // 今日の提出物が残っているか確認

    let remainToday =
    submits.filter(item => item.date === todayDate);


    if(remainToday.length === 0){

        location.href="index.html";

    }else{

        location.reload();

    }

}