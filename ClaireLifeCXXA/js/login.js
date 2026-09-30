import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");


const show = (text) => {
    message.textContent = text;
};


// ================================
// ログイン
// ================================

document.getElementById("loginButton").onclick = async () => {

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (!emailValue || !passwordValue) {
        show("メールアドレスとパスワードを入力してください。");
        return;
    }

    show("ログインしています…");

    try {

        await signInWithEmailAndPassword(
            auth,
            emailValue,
            passwordValue
        );

        location.replace("index.html");

    } catch (e) {

        console.error(e);

        show("メールアドレスまたはパスワードを確認してください。");

    }

};


// ================================
// 新規アカウント作成
// ================================

document.getElementById("signupButton").onclick = async () => {

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (!emailValue || !passwordValue) {
        show("メールアドレスとパスワードを入力してください。");
        return;
    }

    if (passwordValue.length < 6) {
        show("パスワードは6文字以上にしてください。");
        return;
    }

    show("アカウントを作成しています…");

    try {

        // Firebase Authenticationに登録
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                emailValue,
                passwordValue
            );

        const user = userCredential.user;


        // Firestoreにユーザー情報を作成
        await setDoc(
            doc(db, "users", user.uid),
            {
                email: user.email,
                createdAt: new Date().toISOString()
            }
        );


        show("アカウントを作成しました。");

        location.replace("index.html");

    } catch (e) {

        console.error(e);

        show("アカウントを作成できませんでした。");

    }

};