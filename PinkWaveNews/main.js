// ======================================================
// БУРГЕР-МЕНЮ
// ======================================================

const burger = document.querySelector(".burger");
const navbar = document.querySelector(".navbar");

if (burger && navbar) {
    burger.addEventListener("click", () => {
        navbar.classList.toggle("active");
    });
}

// ======================================================
// ІМПОРТ FIREBASE
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

// ======================================================
// DOM НОВИН
// ======================================================

const newsGrid = document.getElementById("newsGrid");

// ======================================================
// КАТЕГОРІЇ
// ======================================================

let currentCategory = "all";

// Лог стану користувача

const isEditor = localStorage.getItem("isEditorLoggedIn") === "true";
const isUser = localStorage.getItem("isUserLoggedIn") === "true";
const isGuest = !isUser && !isEditor;

// ======================================================
// ЗАВАНТАЖЕННЯ НОВИН
// ======================================================

async function loadNews(category = "all") {

    if (!newsGrid) return;

    newsGrid.innerHTML = "";
    currentCategory = category;

    try {

        const q = query(
            collection(db, "news"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((docItem) => {

            const news = docItem.data();

            if (category !== "all" && news.category !== category) return;

            const article = document.createElement("article");
            article.className = "news-card";

            const formattedDate = news.createdAt?.toDate
                ? news.createdAt.toDate().toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })
                : "";

            article.innerHTML = `
  <div class="media">
    ${news.mediaURL
                    ? news.mediaType && news.mediaType.startsWith("video/")
                        ? `<video src="${news.mediaURL}" controls></video>`
                        : `<img src="${news.mediaURL}" alt="${news.title}" />`
                    : ""
                }
  </div>

  <div class="content">
    <div class="news-meta">
      <span class="news-category">${news.category}</span>
      <span class="news-date">${formattedDate}</span>
    </div>

    <h3 class="card-title">${news.title}</h3>
    <p class="card-desc">${news.content}</p>

    <!-- ДІЇ -->
    <div class="card-actions">
      <button class="open-comments" data-id="${docItem.id}">
        Коментарі
      </button>
    </div>

    <!-- КОМЕНТАРІ ПІДТЯГУЮТЬСЯ ЛІНІВО -->
  </div>
`;

            newsGrid.appendChild(article);
        });

    } catch (error) {
        console.error(error);
        newsGrid.innerHTML = `<p style="text-align:center;">Не вдалося завантажити новини</p>`;
    }
}

// ======================================================
// ФІЛЬТР
// ======================================================

const dropdown = document.querySelector(".dropdown");
const dropdownTitle = document.querySelector(".dropdown-title");
const filterButtons = document.querySelectorAll(".filter-option");

if (dropdownTitle && dropdown) {
    dropdownTitle.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            dropdown.classList.toggle("active");
        }
    });
}

filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        if (dropdownTitle) dropdownTitle.innerHTML = button.textContent;

        loadNews(button.dataset.category);

        if (window.innerWidth <= 768) {
            dropdown.classList.remove("active");
        }
    });
});

// ======================================================
// COOKIE-СИСТЕМА
// ======================================================

const cookieBanner = document.getElementById("cookieBanner");
const analytics = document.getElementById("analytics");
const marketing = document.getElementById("marketing");
const acceptAllBtn = document.getElementById("acceptAll");
const saveChoiceBtn = document.getElementById("saveChoice");
const cookieSettingsLink = document.getElementById("cookieSettings");

function loadCookies() {

    if (!cookieBanner) return;

    const saved = localStorage.getItem("cookies");

    if (!saved) {
        cookieBanner.style.display = "flex";
        return;
    }

    const data = JSON.parse(saved);

    if (analytics) analytics.checked = data.analytics;
    if (marketing) marketing.checked = data.marketing;

    cookieBanner.style.display = "none";
}

function saveCookies(data) {
    localStorage.setItem("cookies", JSON.stringify(data));
    if (cookieBanner) cookieBanner.style.display = "none";
}

if (acceptAllBtn && analytics && marketing) {
    acceptAllBtn.addEventListener("click", () => {
        analytics.checked = true;
        marketing.checked = true;

        saveCookies({
            analytics: true,
            marketing: true
        });
    });
}

if (saveChoiceBtn && analytics && marketing) {
    saveChoiceBtn.addEventListener("click", () => {
        saveCookies({
            analytics: analytics.checked,
            marketing: marketing.checked
        });
    });
}

if (cookieSettingsLink && cookieBanner) {
    cookieSettingsLink.addEventListener("click", (e) => {
        e.preventDefault();
        cookieBanner.style.display = "flex";
    });
}

window.addEventListener("load", loadCookies);

// ======================================================
// СТАН АВТОРИЗАЦІЇ
// ======================================================

const headerAuthBtn = document.getElementById("headerAuthBtn");
const heroAuthBtn = document.getElementById("heroAuthBtn");
const publishBtn = document.getElementById("publishBtn");

const isUserLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";
const isEditorLoggedIn = localStorage.getItem("isEditorLoggedIn") === "true";

const userNickname = localStorage.getItem("userNickname");
const userAvatar = localStorage.getItem("userAvatar");

// ======================================================
// ІНІЦІАЛІЗАЦІЯ UI ПРОФІЛЮ
// ======================================================

const profileBox = document.getElementById("profileBox");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");

function renderAvatar(el, avatar, nickname) {
    if (!el) return;

    if (avatar) {
        el.style.backgroundImage = `url(${avatar})`;
        el.textContent = "";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
    } else {
        el.style.backgroundImage = "";
        el.textContent = nickname ? nickname[0].toUpperCase() : "P";
    }
}

if (isUserLoggedIn || isEditorLoggedIn) {

    if (headerAuthBtn) {
        headerAuthBtn.textContent = "Вихід";
        headerAuthBtn.addEventListener("click", logout);
        headerAuthBtn.style.display = "none";
    }

    if (heroAuthBtn) {
        heroAuthBtn.textContent = "Вихід";
        heroAuthBtn.addEventListener("click", logout);
    }

    if (publishBtn) {
        if (isEditorLoggedIn) {
            publishBtn.textContent = "Перейти в панель";
            publishBtn.href = "/Editor_blank/editor.html";
        } else {
            publishBtn.textContent = "Редакторський доступ";
            publishBtn.href = "/Autorization_blank/authorization.html";
        }
    }

    if (profileBox) profileBox.style.display = "flex";

    if (profileName) profileName.textContent = userNickname || "Profile";

    renderAvatar(profileAvatar, userAvatar, userNickname);
}

// ======================================================
// ВИХІД З АККАУНТА
// ======================================================

function logout(e) {

    e.preventDefault();

    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("isEditorLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("userAvatar");

    window.location.reload();
}

// ======================================================
// МОДАЛЬНЕ ВІКНО ПРОФІЛЮ
// ======================================================

const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const nicknameInput = document.getElementById("nicknameInput");
const passwordInput = document.getElementById("passwordInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const avatarInput = document.getElementById("avatarInput");
const bigAvatar = document.getElementById("bigAvatar");

let tempAvatar = null;

// ВІДКРИТТЯ МОДАЛКИ
if (profileBox && profileModal) {

    profileBox.addEventListener("click", () => {

        profileModal.style.display = "flex";

        const modalNickname = document.getElementById("modalNickname");
        const modalEmail = document.getElementById("modalEmail");

        const email = localStorage.getItem("userEmail");
        const nickname = localStorage.getItem("userNickname");
        const avatar = localStorage.getItem("userAvatar");

        if (modalNickname) modalNickname.textContent = nickname || "Profile";
        if (modalEmail) modalEmail.textContent = email || "user@gmail.com";

        if (avatar) {
            bigAvatar.style.backgroundImage = `url(${avatar})`;
            bigAvatar.textContent = "";
        } else {
            bigAvatar.style.backgroundImage = "";
            bigAvatar.textContent = nickname ? nickname[0].toUpperCase() : "P";
        }

    });

}

// ЗАКРИТТЯ МОДАЛКИ
if (closeProfileModal && profileModal) {
    closeProfileModal.addEventListener("click", () => {
        profileModal.style.display = "none";
    });
}

if (profileModal) {
    profileModal.addEventListener("click", (e) => {
        if (e.target === profileModal) {
            profileModal.style.display = "none";
        }
    });
}

// ======================================================
// ЗАВАНТАЖЕННЯ АВАТАРКИ
// ======================================================

if (avatarInput) {

    avatarInput.addEventListener("change", (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            tempAvatar = reader.result;

            if (bigAvatar) {
                bigAvatar.style.backgroundImage = `url(${tempAvatar})`;
                bigAvatar.textContent = "";
            }
        };

        reader.readAsDataURL(file);
    });
}

// ЗБЕРЕЖЕННЯ ПРОФІЛЮ

if (saveProfileBtn) {

    saveProfileBtn.addEventListener("click", async () => {

        const newNickname = nicknameInput.value.trim();
        const email = localStorage.getItem("userEmail");

        const currentNickname = localStorage.getItem("userNickname");

        const newPassword = passwordInput.value.trim();

        if (!newNickname && !tempAvatar && !newPassword) {
            alert("Внесіть зміни");
            return;
        }

        if (newNickname && newNickname.length < 3) {
            alert("Нік мінімум 3 символи");
            return;
        }

        const finalNickname = newNickname || currentNickname;

        localStorage.setItem("userNickname", finalNickname);

        if (tempAvatar) {
            localStorage.setItem("userAvatar", tempAvatar);
        }

        if (profileName) profileName.textContent = finalNickname;

        renderAvatar(profileAvatar, tempAvatar || localStorage.getItem("userAvatar"), finalNickname);

        const modalNickname = document.getElementById("modalNickname");
        if (modalNickname) modalNickname.textContent = finalNickname;

        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);

            snapshot.forEach(async (docSnap) => {

                const data = docSnap.data();

                if (data.email === email) {

                    const updateData = {
                        avatarURL: tempAvatar || data.avatarURL || null
                    };

                    if (newNickname) {
                        updateData.nickname = finalNickname;
                    }

                    await updateDoc(doc(db, "users", docSnap.id), updateData);
                }
            });

        } catch (err) {
            console.error(err);
        }

        nicknameInput.value = "";
        passwordInput.value = "";
        tempAvatar = null;

        if (newNickname || tempAvatar) {
            alert("Профіль оновлено");
        }
    });
}

// ======================================================
// ІНІЦІАЛІЗАЦІЯ
// ======================================================

loadNews();