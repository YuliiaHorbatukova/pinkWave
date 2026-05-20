// ======================================================
// СИСТЕМА ЗМІНИ ПАРОЛЯ
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ======================================================
// КОНФІГУРАЦІЯ FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyB4b8F6FY4Sx-D8EoEfMq9xwSjZ8mFxYqI",
    authDomain: "pinkwave-news.firebaseapp.com",
    projectId: "pinkwave-news",
    storageBucket: "pinkwave-news.firebasestorage.app",
    messagingSenderId: "918042852758",
    appId: "1:918042852758:web:c3c2bbc8589225e2e8b1b7"
};

// ======================================================
// ІНІЦІАЛІЗАЦІЯ FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ======================================================
// DOM ЕЛЕМЕНТИ
// ======================================================

const saveProfileBtn = document.getElementById("saveProfileBtn");
const passwordInput = document.getElementById("passwordInput");

// ======================================================
// ЗМІНА ПАРОЛЯ
// ======================================================

if (saveProfileBtn && passwordInput) {

    saveProfileBtn.addEventListener("click", async () => {

        const newPassword = passwordInput.value.trim();

        // Якщо пароль не введено — нічого не робимо
        if (!newPassword) return;

        // Мінімальна довжина
        if (newPassword.length < 6) {
            alert("Пароль мінімум 6 символів");
            return;
        }

        try {

            const user = auth.currentUser;

            if (!user) {
                alert("Користувач не авторизований");
                return;
            }

            // ==================================================
            // ОНОВЛЕННЯ ПАРОЛЯ
            // ==================================================

            await updatePassword(user, newPassword);

            passwordInput.value = "";

            alert("Пароль успішно змінено");

        } catch (error) {

            console.error(error);

            if (error.code === "auth/requires-recent-login") {

                const currentPassword = prompt(
                    "Для зміни пароля введіть поточний пароль"
                );

                if (!currentPassword) return;

                try {

                    const credential = EmailAuthProvider.credential(
                        auth.currentUser.email,
                        currentPassword
                    );

                    await reauthenticateWithCredential(
                        auth.currentUser,
                        credential
                    );

                    await updatePassword(
                        auth.currentUser,
                        newPassword
                    );

                    passwordInput.value = "";

                    alert("Пароль успішно змінено");

                } catch (reauthError) {

                    console.error(reauthError);

                    alert("Невірний поточний пароль");
                }

            } else {

                alert("Не вдалося змінити пароль");
            }
        }
    });
}