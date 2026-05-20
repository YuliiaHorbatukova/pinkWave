// ===== Імпорти Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, orderBy, updateDoc, getDoc, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ===== КОНФІГУРАЦІЯ =====
const firebaseConfig = {
  apiKey: "AIzaSyB4b8F6FY4Sx-D8EoEfMq9xwSjZ8mFxYqI",
  authDomain: "pinkwave-news.firebaseapp.com",
  projectId: "pinkwave-news",
  storageBucket: "pinkwave-news.firebasestorage.app",
  messagingSenderId: "918042852758",
  appId: "1:918042852758:web:c3c2bbc8589225e2e8b1b7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Коментар

const adminBtn = document.querySelector(".admin");
const logoutBtn = document.getElementById("logoutBtn");

// ==========================
// ПЕРЕХІД В АДМІН-ПАНЕЛЬ (режим редактора зберігається)
// ==========================

adminBtn?.addEventListener("click", () => {
  // вже editor — просто залишаємося в режимі
  localStorage.setItem("isEditorLoggedIn", "true");
  window.location.href = "/index.html?role=editor";
});

// ==========================
// ВИХІД → РЕЖИМ ГОСТЯ
// ==========================

logoutBtn?.addEventListener("click", () => {

  // ==========================
  // ПОВНЕ СКИДАННЯ СТАНУ АВТОРИЗАЦІЇ
  // ==========================
  localStorage.removeItem("isEditorLoggedIn");
  localStorage.removeItem("isUserLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userNickname");
  localStorage.removeItem("userAvatar");

  // ==========================
  // ПЕРЕВЕДЕННЯ В РЕЖИМ ГОСТЯ
  // ==========================
  window.location.href = "/index.html?role=guest";
});

// ===== Авторизація =====
if (localStorage.getItem("isEditorLoggedIn") !== "true") {
  window.location.replace("authorization.html");
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("isEditorLoggedIn");
  window.location.href = "../index.html";
});

// ===== Логіка медіа =====
const newsMediaInput = document.getElementById("newsMedia");
const mediaDropZone = document.getElementById("mediaDropZone");
const mediaPreview = document.getElementById("mediaPreview");

let selectedFile = null;
let editingId = null;
let oldMediaPath = null;

mediaDropZone.addEventListener("click", () => newsMediaInput.click());

mediaDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  mediaDropZone.classList.add("dragover");
});

mediaDropZone.addEventListener("dragleave", () => {
  mediaDropZone.classList.remove("dragover");
});

mediaDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  mediaDropZone.classList.remove("dragover");
  handleMediaFile(e.dataTransfer.files[0]);
});

newsMediaInput.addEventListener("change", (e) => {
  handleMediaFile(e.target.files[0]);
});

function handleMediaFile(file) {
  if (!file) return;

  if (file.size > 20 * 1024 * 1024) {
    showMessage("Файл занадто великий (макс 20 МБ).", "error");
    return;
  }

  selectedFile = file;

  const url = URL.createObjectURL(file);
  mediaPreview.innerHTML = "";

  if (file.type.startsWith("video/")) {
    mediaPreview.innerHTML = `<video src="${url}" controls style="max-width:100%;border-radius:12px;"></video>`;
  } else {
    mediaPreview.innerHTML = `<img src="${url}" style="max-width:100%;border-radius:12px;" />`;
  }
}

// ===== ЕЛЕМЕНТИ =====
const newsForm = document.getElementById("newsForm");
const newsGrid = document.getElementById("newsGrid");
const submitBtn = document.querySelector(".submit-btn");
const formTitle = document.getElementById("formTitle");
const uploadProgressContainer = document.getElementById("uploadProgressContainer");
const uploadProgressBar = document.getElementById("uploadProgressBar");
const customMessage = document.getElementById("customMessage");

// ===== СПОВІЩЕННЯ =====
function showMessage(text, type = "info", duration = 3000) {
  customMessage.textContent = text;
  customMessage.className = `custom-message ${type}`;
  customMessage.style.display = "block";

  setTimeout(() => {
    customMessage.style.display = "none";
  }, duration);
}

// ===== ЗБЕРЕЖЕННЯ / ОНОВЛЕННЯ =====
newsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;

  const title = document.getElementById("newsTitle").value;
  const category = document.getElementById("newsCategory").value;
  const content = document.getElementById("newsContent").value;

  try {

    let mediaURL = null;
    let mediaPath = null;
    let mediaType = null;

    if (editingId) {
      const snap = await getDoc(doc(db, "news", editingId));

      if (snap.exists()) {
        mediaURL = snap.data().mediaURL || null;
        mediaPath = snap.data().mediaPath || null;
        mediaType = snap.data().mediaType || null;
      }
    }

    // ===== Завантаження нового файлу =====
    if (selectedFile) {

      const fileName = Date.now() + "_" + selectedFile.name;
      mediaPath = `newsMedia/${fileName}`;

      const storageRef = ref(storage, mediaPath);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadProgressContainer.style.display = "block";
      uploadProgressBar.style.width = "0%";

      await new Promise((resolve, reject) => {

        uploadTask.on("state_changed",

          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgressBar.style.width = progress + "%";
          },

          error => {
            console.error(error);
            showMessage("Помилка при завантаженні файлу ❌", "error");
            submitBtn.disabled = false;
            reject(error);
          },

          async () => {
            mediaURL = await getDownloadURL(uploadTask.snapshot.ref);
            mediaType = selectedFile.type;

            if (editingId && oldMediaPath) {
              await deleteObject(ref(storage, oldMediaPath));
            }

            uploadProgressContainer.style.display = "none";

            resolve();
          }
        );

      });
    }

    if (editingId) {

      await updateDoc(doc(db, "news", editingId), {
        title,
        category,
        content,
        mediaURL,
        mediaPath,
        mediaType
      });

      showMessage("Новину оновлено ✅", "success");

      editingId = null;
      oldMediaPath = null;

      submitBtn.textContent = "Зберегти";
      formTitle.textContent = "Додати нову новину";

    } else {

      await addDoc(collection(db, "news"), {
        title,
        category,
        content,
        mediaURL,
        mediaPath,
        mediaType,
        createdAt: new Date()
      });

      showMessage("Новину збережено ✅", "success");
    }

    selectedFile = null;
    newsForm.reset();
    mediaPreview.innerHTML = "";

    loadNews();

  } catch (error) {

    console.error(error);
    showMessage("Помилка при збереженні ❌", "error");

  }

  submitBtn.disabled = false;
});

// ===== ЗАВАНТАЖЕННЯ НОВИН =====
async function loadNews() {

  newsGrid.innerHTML = "";

  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docItem => {

    const news = docItem.data();

    const card = document.createElement("div");
    card.className = "news-card";

    card.innerHTML = `
      <div class="content">
        <div class="news-meta"><span>${news.category}</span></div>

        ${news.mediaURL
        ? (news.mediaType.startsWith("video/")
          ? `<video src="${news.mediaURL}" controls style="max-width:100%;border-radius:12px;"></video>`
          : `<img src="${news.mediaURL}" style="max-width:100%;border-radius:12px;" />`)
        : ""}

        <h3 class="card-title">${news.title}</h3>
        <p class="card-desc">${news.content}</p>

        <div class="action-buttons">
          <button class="edit-btn" data-id="${docItem.id}">Редагувати</button>
          <button class="delete-btn" data-id="${docItem.id}">Видалити</button>
        </div>
      </div>
    `;

    newsGrid.appendChild(card);
  });

  addDeleteEvents();
  addEditEvents();
}

// ===== ВИДАЛЕННЯ =====
function addDeleteEvents() {

  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const confirmDelete = confirm("Ви впевнені, що хочете видалити новину?");

      if (!confirmDelete) return;

      const id = btn.dataset.id;

      const docRef = doc(db, "news", id);

      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data().mediaPath) {
        await deleteObject(ref(storage, snap.data().mediaPath));
      }

      await deleteDoc(docRef);

      showMessage("Новину видалено 🗑️", "success");

      loadNews();

    });

  });

}

// ===== РЕДАГУВАННЯ =====
function addEditEvents() {

  document.querySelectorAll(".edit-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      const snap = await getDoc(doc(db, "news", id));

      if (snap.exists()) {

        const news = snap.data();

        document.getElementById("newsTitle").value = news.title;
        document.getElementById("newsCategory").value = news.category;
        document.getElementById("newsContent").value = news.content;

        editingId = id;
        oldMediaPath = news.mediaPath || null;

        submitBtn.textContent = "Оновити";
        formTitle.textContent = "Редагування новини";

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }

    });

  });

}

// ===== ПЕРШЕ ЗАВАНТАЖЕННЯ =====
loadNews();