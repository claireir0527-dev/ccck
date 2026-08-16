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



let notices =
JSON.parse(localStorage.getItem("notices"))
|| [];



let list =
document.getElementById("todayNoticeList");




notices.forEach((notice,index)=>{


    if(notice.date == todayDate){


        list.innerHTML += `

<div class="card">


<div>

🔔 ${notice.text}

<br>

📅 ${notice.date}


</div>


<button class="done-btn" onclick="checkTodayNotice(${index})">
確認済み
</button>
</div>

`;

    }


});


function checkTodayNotice(index){

    let notices =
    JSON.parse(localStorage.getItem("notices"))
    || [];


    notices.splice(index,1);


    localStorage.setItem(
        "notices",
        JSON.stringify(notices)
    );


    // 今日の通知が残っているか確認

    let remainToday =
    notices.filter(notice => notice.date === todayDate);


    if(remainToday.length === 0){

        location.href="index.html";

    }else{

        location.reload();

    }

}