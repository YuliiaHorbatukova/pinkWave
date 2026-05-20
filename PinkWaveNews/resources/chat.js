// ===============================
// СИСТЕМА ЧАТУ ПІДТРИМКИ (FAQ SYSTEM)
// ===============================

const aiFab = document.getElementById("aiFab");
const aiChat = document.getElementById("aiChat");
const aiToggle = document.getElementById("aiToggle");

const aiFaq = document.getElementById("aiFaq");
const aiMessages = document.getElementById("aiMessages");

const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");

// ===============================
// ПЕРЕВІРКА ЕЛЕМЕНТІВ
// ===============================

if (
    aiFab &&
    aiChat &&
    aiToggle &&
    aiFaq &&
    aiMessages &&
    aiInput &&
    aiSend
) {

    // ===============================
    // ДАНІ FAQ
    // ===============================

    const faq = [
        {
            question: "Що таке PinkWave Новини?",
            answer: "PinkWave Новини — це сучасна платформа для публікації та перегляду актуальних новин у різних категоріях."
        },
        {
            question: "Наскільки достовірні матеріали на сайті?",
            answer: "Усі новини проходять модерацію перед публікацією для забезпечення точності та якості контенту."
        },
        {
            question: "Як зв’язатися зі службою підтримки?",
            answer: "Ви можете написати нам на email: news@pinkwave.edu — ми відповідаємо в робочий час."
        },
        {
            question: "Як змінити або відфільтрувати категорії новин?",
            answer: "Використовуйте меню 'Фільтр' у верхній панелі сайту, щоб обрати потрібну категорію."
        },

        {
            question: "Як часто оновлюються новини?",
            answer: "Новини оновлюються регулярно протягом дня залежно від надходження нової інформації."
        },
        {
            question: "Чи можу я сам публікувати новини?",
            answer: "Так, але доступ до публікації мають лише авторизовані редактори через спеціальну панель."
        },
        {
            question: "Як авторизуватись на сайті?",
            answer: "Для входу натисніть кнопку 'Вхід' у верхньому правому куті сайту. Далі введіть свої дані для авторизації. Якщо у вас ще немає акаунта, скористайтеся опцією 'Реєстрація', щоб створити обліковий запис."
        }
    ];

    // ===============================
    // ВІДКРИТТЯ / ЗАКРИТТЯ ЧАТУ
    // ===============================

    aiFab.addEventListener("click", () => {

        const isOpen = aiChat.style.display === "flex";

        aiChat.style.display = isOpen
            ? "none"
            : "flex";
    });

    aiToggle.addEventListener("click", () => {

        aiChat.style.display = "none";
    });

    // ===============================
    // ІНІЦІАЛІЗАЦІЯ FAQ
    // ===============================

    faq.forEach(item => {

        const btn = document.createElement("button");

        btn.classList.add("faq-btn");

        btn.textContent = item.question;

        btn.addEventListener("click", () => {

            addMessage(item.question, "user");

            setTimeout(() => {
                addMessage(item.answer, "bot");
            }, 300);
        });

        aiFaq.appendChild(btn);
    });

    // ===============================
    // ДОДАВАННЯ ПОВІДОМЛЕННЯ
    // ===============================

    function addMessage(text, type) {

        const msg = document.createElement("div");

        msg.classList.add("ai-msg", type);

        msg.textContent = text;

        aiMessages.appendChild(msg);

        aiMessages.scrollTop =
            aiMessages.scrollHeight;
    }

    // ===============================
    // ПОШУК ВІДПОВІДІ
    // ===============================

    function findAnswer(text) {

        text = text.toLowerCase();

        return faq.find(item =>
            item.question.toLowerCase().includes(text)
        );
    }

    // ===============================
    // ВІДПРАВКА ПОВІДОМЛЕННЯ
    // ===============================

    function sendMessage() {

        const text = aiInput.value.trim();

        if (!text) return;

        addMessage(text, "user");

        const found = findAnswer(text);

        setTimeout(() => {

            addMessage(
                found
                    ? found.answer
                    : "На жаль, я не знайшов відповіді 👆",
                "bot"
            );

        }, 300);

        aiInput.value = "";
    }

    // ===============================
    // КЛІК КНОПКИ
    // ===============================

    aiSend.addEventListener("click", sendMessage);

    // ===============================
    // ПІДТРИМКА ENTER
    // ===============================

    aiInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {
            sendMessage();
        }
    });
}