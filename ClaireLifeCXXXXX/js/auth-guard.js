import {auth} from "./firebase.js";import{onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";onAuthStateChanged(auth,u=>{if(!u)location.replace("login.html")});
