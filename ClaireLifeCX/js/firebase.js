import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, doc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
const firebaseConfig={apiKey:"AIzaSyBrsFoQdQTiNrS5OcaBhWf9UGSH77Iv7OU",authDomain:"cleair-lab.firebaseapp.com",projectId:"cleair-lab",storageBucket:"cleair-lab.firebasestorage.app",messagingSenderId:"692128366961",appId:"1:692128366961:web:75a8c5d40ba1656d3476d0",measurementId:"G-JB5Q29PE15"};
const app=initializeApp(firebaseConfig),db=getFirestore(app),auth=getAuth(app);
function userCollection(name){if(!auth.currentUser)throw new Error("ログインしてください");return collection(db,"users",auth.currentUser.uid,name)}
function userDoc(name,id){if(!auth.currentUser)throw new Error("ログインしてください");return doc(db,"users",auth.currentUser.uid,name,id)}
function waitForUser(){return new Promise((resolve,reject)=>{if(auth.currentUser)return resolve(auth.currentUser);const u=onAuthStateChanged(auth,x=>{u();x?resolve(x):reject(new Error("ログインしてください"))})})}
export {db,auth,userCollection,userDoc,waitForUser};
