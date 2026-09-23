import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrsFoQdQTiNrS5OcaBhWf9UGSH77Iv7OU",
    authDomain: "cleair-lab.firebaseapp.com",
    projectId: "cleair-lab",
    storageBucket: "cleair-lab.firebasestorage.app",
    messagingSenderId: "692128366961",
    appId: "1:692128366961:web:75a8c5d40ba1656d3476d0",
    measurementId: "G-JB5Q29PE15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase接続成功！");

export { db };
