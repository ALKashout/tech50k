const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");

  question.addEventListener("click", () => {
    item.classList.toggle("active");

    faqItems.forEach((other) => {
      if (other !== item) {
        other.classList.remove("active");
      }
    });
  });
});

function setLang(lang) {
  currentLang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (langEnBtn && langArBtn) {
    langEnBtn.classList.toggle("active", lang === "en");
    langArBtn.classList.toggle("active", lang === "ar");
  }
  // Update all elements with data-en/data-ar
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.getAttribute(lang === "ar" ? "data-ar" : "data-en");
  });
  // Update placeholders if needed
  const fullName = document.getElementById("fullName");
  if (fullName) fullName.placeholder = lang === "ar" ? "الاسم الكامل" : "Full Name";
  const email = document.getElementById("email");
  if (email) email.placeholder = lang === "ar" ? "البريد الإلكتروني" : "Email";
  const phoneNumber = document.getElementById("phoneNumber");
  if (phoneNumber) phoneNumber.placeholder = lang === "ar" ? "123456789" : "123456789";
  // Update select options for age group
  const ageGroup = document.getElementById("ageGroup");
  if (ageGroup) {
    Array.from(ageGroup.options).forEach((opt) => {
      if (opt.dataset && opt.dataset[lang]) opt.textContent = opt.dataset[lang];
    });
  }
  // Update radio button labels
  document.querySelectorAll(".radio-group span[data-en]").forEach((el) => {
    el.textContent = el.getAttribute(lang === "ar" ? "data-ar" : "data-en");
  });
}

function initializeModal() {
  const openBtn = document.querySelector(".hero .cta");
  const modal = document.getElementById("modal");
  const closes = modal ? modal.querySelectorAll("[data-close]") : [];
  let currentLang = "en";


  function setOpen(isOpen) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => setOpen(true));
  }

  closes.forEach((btn) => btn.addEventListener("click", () => setOpen(false)));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal.querySelector(".modal-overlay")) setOpen(false);
    });
  }
}