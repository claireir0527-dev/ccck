import{auth}from"./firebase.js";import{signOut}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";window.logoutClaireLife=async()=>{await signOut(auth);location.replace("login.html")};
