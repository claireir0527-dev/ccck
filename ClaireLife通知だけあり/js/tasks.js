let tasks =
JSON.parse(localStorage.getItem("tasks")) || [];


function showTasks(){

let list =
document.getElementById("list");

list.innerHTML="";


tasks.forEach((task,index)=>{


let div=document.createElement("div");


div.className="card";


div.innerHTML=
`
<div>
${task.name}<br>
${task.date}
</div>

<button onclick="deleteTask(${index})">
削除
</button>
`;


list.appendChild(div);


});


}



function addTask(){

let name =
document.getElementById("task").value;


let date =
document.getElementById("date").value;


if(name==""){
alert("入力してください");
return;
}


tasks.push({

name:name,
date:date

});


localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);


showTasks();

}



function deleteTask(index){

tasks.splice(index,1);


localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);


showTasks();

}



showTasks();