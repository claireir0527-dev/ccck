let today = new Date();

let todayText =
today.getFullYear()
+"-"
+String(today.getMonth()+1).padStart(2,"0")
+"-"
+String(today.getDate()).padStart(2,"0");


// 提出物

let submits =
JSON.parse(localStorage.getItem("submits"))
|| [];


let submitList =
document.getElementById("todaySubmit");


submits.forEach(item=>{


if(item.date == todayText){


submitList.innerHTML +=
`
<div class="card">

📝 ${item.title}

<br>

📅 ${item.date}

</div>
`;


}

});


// 通知

let notices =
JSON.parse(localStorage.getItem("notices"))
|| [];


let noticeList =
document.getElementById("todayNotice");


notices.forEach(item=>{


if(item.date == todayText){


noticeList.innerHTML +=
`
<div class="card">

🔔 ${item.text}

<br>

📅 ${item.date}

</div>
`;


}

});