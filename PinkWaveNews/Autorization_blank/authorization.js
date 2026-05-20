// ======================================================
// ІМПОРТИ FIREBASE
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

// ======================================================
// DOM ЕЛЕМЕНТИ
// ======================================================

const form = document.getElementById("authForm");
const errorMessage = document.getElementById("errorMessage");

const loginModeBtn = document.getElementById("loginMode");
const registerModeBtn = document.getElementById("registerMode");

const submitBtn = document.getElementById("submitBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nicknameInput = document.getElementById("nickname");

const nicknameGroup = document.getElementById("nicknameGroup");

// ======================================================
// ОБЛІКОВІ ДАНІ РЕДАКТОРА
// ======================================================

const VALID_EMAIL = "yuliia.horbatiukova.editor@pinkwave.ie";
const VALID_PASSWORD = "12345yullia";

// ======================================================
// РЕЖИМ (LOGIN / REGISTER)
// ======================================================

let mode = "login";

// ======================================================
// РЕЖИМ ВХОДУ
// ======================================================

loginModeBtn?.addEventListener("click", () => {

  mode = "login";

  loginModeBtn.classList.add("active");
  registerModeBtn.classList.remove("active");

  submitBtn.textContent = "Увійти";
  nicknameGroup.style.display = "none";
  errorMessage.style.display = "none";
});

// ======================================================
// РЕЖИМ РЕЄСТРАЦІЇ
// ======================================================

registerModeBtn?.addEventListener("click", () => {

  mode = "register";

  registerModeBtn.classList.add("active");
  loginModeBtn.classList.remove("active");

  submitBtn.textContent = "Зареєструватися";
  nicknameGroup.style.display = "block";
  errorMessage.style.display = "none";
});

// ======================================================
// ВІДПРАВКА ФОРМИ
// ======================================================

form?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput?.value.trim();

  errorMessage.style.display = "none";

  try {

    // ==================================================
    // ЛОГІН РЕДАКТОРА
    // ==================================================

    if (
      email === VALID_EMAIL &&
      password === VALID_PASSWORD
    ) {

      localStorage.setItem("isEditorLoggedIn", "true");
      localStorage.setItem("isUserLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userNickname", "Editor");

      window.location.href = "../Editor_blank/editor.html";
      return;
    }

    // ==================================================
    // ВХІД КОРИСТУВАЧА
    // ==================================================

    if (mode === "login") {

      const userCredential =
        await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // ОТРИМАННЯ НІКНЕЙМУ З FIRESTORE
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      let finalNickname = user.email.split("@")[0];
      let avatarURL = null;

      if (docSnap.exists()) {
        finalNickname = docSnap.data().nickname;
        avatarURL = docSnap.data().avatarURL || null;
      }

      localStorage.setItem("isUserLoggedIn", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userNickname", finalNickname);
      localStorage.setItem("userAvatar", avatarURL || "");

      window.location.href = "../index.html";
      return;
    }

    // ==================================================
    // РЕЄСТРАЦІЯ
    // ==================================================

    if (mode === "register") {

      if (!nickname || nickname.length < 3) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Нік мінімум 3 символи";
        return;
      }

      if (password.length < 6) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Пароль мінімум 6 символів";
        return;
      }

      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: nickname
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nickname: nickname,
        avatarURL: null,
        createdAt: new Date()
      });

      // ЗБЕРЕЖЕННЯ В LOCALSTORAGE (для UI на index)
      localStorage.setItem("isUserLoggedIn", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userNickname", nickname);

      alert("Реєстрація успішна!");

      window.location.href = "../index.html";
    }

  } catch (error) {

    console.error(error);

    errorMessage.style.display = "block";

    if (mode === "login") {
      errorMessage.textContent = "Невірна пошта або пароль";
    } else {

      switch (error.code) {

        case "auth/email-already-in-use":
          errorMessage.textContent = "Користувач вже існує";
          break;

        case "auth/invalid-email":
          errorMessage.textContent = "Некоректна пошта";
          break;

        case "auth/weak-password":
          errorMessage.textContent = "Слабкий пароль";
          break;

        default:
          errorMessage.textContent = "Помилка реєстрації";
      }
    }
  }
});