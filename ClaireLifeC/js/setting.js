function saveName(){

    let input =
    document.getElementById("nameInput");


    let name =
    input.value.trim();


    if(name !== ""){

        localStorage.setItem(
            "userName",
            name
        );

        document.getElementById("userName").textContent=name;

    }


    input.style.display="none";

    document.getElementById("userName").style.display="block";

}


function showName(){

    let name =
    localStorage.getItem("userName")
    || "名前未設定";

    document.getElementById("userName").textContent=name;

}


function editName(){

    let name =
    document.getElementById("userName");

    let input =
    document.getElementById("nameInput");


    name.style.display="none";

    input.style.display="block";


    // 名前未設定なら空欄にする
    if(name.textContent === "名前未設定"){
        input.value = "";
    }else{
        input.value = name.textContent;
    }


    input.focus();

}


const iconImage =
document.getElementById("iconImage");

const profileIcon =
document.getElementById("profileIcon");


if(iconImage){

    iconImage.addEventListener("change",function(){

        const file=this.files[0];

        if(file){

            const reader=new FileReader();

            reader.onload=function(){

                localStorage.setItem(
                    "userIcon",
                    reader.result
                );

                profileIcon.src=reader.result;

            };

            reader.readAsDataURL(file);

        }

    });

}


const savedIcon =
localStorage.getItem("userIcon");


if(savedIcon && profileIcon){

    profileIcon.src=savedIcon;

}


showName();