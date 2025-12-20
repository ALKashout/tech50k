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

// Modal / form popup — wire after DOM content parsed so modal exists
document.addEventListener("DOMContentLoaded", () => {

  const openBtn = document.querySelector(".hero .cta");
  const modal = document.getElementById("modal");
  const closes = modal ? modal.querySelectorAll("[data-close]") : [];
  const form = document.getElementById("contactForm");
  const langEnBtn = document.getElementById("lang-en");
  const langArBtn = document.getElementById("lang-ar");
  let currentLang = "en";


  function setOpen(isOpen) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }

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


  if (openBtn) {
    openBtn.addEventListener("click", () => setOpen(true));
  }
  if (langEnBtn) langEnBtn.addEventListener("click", () => setLang("en"));
  if (langArBtn) langArBtn.addEventListener("click", () => setLang("ar"));

  closes.forEach((btn) => btn.addEventListener("click", () => setOpen(false)));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal.querySelector(".modal-overlay")) setOpen(false);
    });
  }

  // If the public contact form exists in the modal, wire its behavior

  if (form) {
    const countrySelect = document.getElementById("country");
    const phoneCodeSelect = document.getElementById("phoneCode");
    const msg = document.getElementById("message");
    const submitBtn = document.getElementById("submitBtn");
    const accessKeyInput = document.getElementById("access_key");

    // Load countries and phone codes (REST Countries)
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags")
      .then((res) => res.json())
      .then((list) => {
        const mapped = list
          .map((c) => ({
            code: c.cca2 || "",
            name: c.name?.common || "",
            flag: c.flags?.emoji || "",
            idd: c.idd || {},
          }))
          .filter((c) => c.code && c.name && c.idd?.root)
          .sort((a, b) => a.name.localeCompare(b.name));

        countrySelect.innerHTML = `<option value="">${currentLang === "ar" ? "اختر الدولة" : "Select a country"}</option>`;
        phoneCodeSelect.innerHTML = `<option value="">${currentLang === "ar" ? "رمز الدولة" : "Code"}</option>`;
        mapped.forEach((c) => {
          // Country dropdown
          const opt = document.createElement("option");
          opt.value = c.code;
          opt.textContent = c.name;
          countrySelect.appendChild(opt);
          // Phone code dropdown
          if (c.idd.root) {
            const code = c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] || "" : "");
            const opt2 = document.createElement("option");
            opt2.value = code;
            opt2.innerHTML = `${c.flag ? `<span class='flag'>${c.flag}</span>` : ""}${code}`;
            opt2.setAttribute("data-flag", c.flag || "");
            opt2.setAttribute("data-country", c.name);
            phoneCodeSelect.appendChild(opt2);
          }
        });
      })
      .catch(() => {
        countrySelect.innerHTML = `<option value="">${currentLang === "ar" ? "تعذر تحميل الدول" : "Unable to load countries"}</option>`;
        phoneCodeSelect.innerHTML = `<option value="">${currentLang === "ar" ? "تعذر تحميل الرموز" : "Unable to load codes"}</option>`;
      });


    function showMessage(text, isError = false) {
      msg.textContent = text;
      msg.style.color = isError ? "#f87171" : "";
    }

    // Set initial language
    setLang(currentLang);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        showMessage(currentLang === "ar" ? "يرجى إكمال جميع الحقول بشكل صحيح." : "Please complete the form correctly.", true);
        return;
      }

      const education = document.querySelector('input[name="education"]:checked')?.value;
      if (!education) {
        showMessage(currentLang === "ar" ? "يرجى اختيار أعلى مستوى تعليمي." : "Please select your highest level of education.", true);
        return;
      }

      const ageGroup = form.ageGroup?.value;
      if (!ageGroup) {
        showMessage(currentLang === "ar" ? "يرجى اختيار الفئة العمرية." : "Please select your age group.", true);
        return;
      }

      const gender = document.querySelector('input[name="gender"]:checked')?.value;
      if (!gender) {
        showMessage(currentLang === "ar" ? "يرجى اختيار الجنس." : "Please select your gender.", true);
        return;
      }

      const phoneCode = form.phoneCode.value;
      const phoneNumber = form.phoneNumber.value.trim();
      if (!phoneCode || !phoneNumber) {
        showMessage(currentLang === "ar" ? "يرجى إدخال رقم الهاتف مع رمز الدولة." : "Please enter your phone number and country code.", true);
        return;
      }

      const data = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        country: form.country.value,
        phone: `${phoneCode} ${phoneNumber}`,
        education,
        ageGroup,
        gender,
      };

      const access_key = accessKeyInput?.value?.trim();
      if (!access_key || access_key === "YOUR_WEB3FORMS_ACCESS_KEY") {
        showMessage(currentLang === "ar" ? "يرجى ضبط مفتاح Web3Forms قبل الإرسال." : "Please configure your Web3Forms access key in the hidden field before submitting.", true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = currentLang === "ar" ? "يتم الإرسال..." : "Sending…";
      showMessage("");

      try {
        const payload = {
          access_key,
          subject: `Website form submission: ${data.fullName}`,
          name: data.fullName,
          email: data.email,
          message: `Country: ${data.country}\nPhone: ${data.phone}\nAge group: ${data.ageGroup}\nGender: ${data.gender}\nEducation: ${data.education}`,
          phone: data.phone,
          age_group: data.ageGroup,
          gender: data.gender,
          education: data.education,
          to: "aladdin@engineer.com",
        };

        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          showMessage(currentLang === "ar" ? "تم إرسال رسالتك بنجاح." : "Thanks — your message was sent.");
          form.reset();
          setTimeout(() => setOpen(false), 900);
        } else {
          showMessage(json.message || (currentLang === "ar" ? "فشل في إرسال الرسالة." : "Failed to send message."), true);
        }
      } catch (err) {
        showMessage(currentLang === "ar" ? "خطأ في الشبكة. حاول لاحقاً." : "Network error. Please try again later.", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = currentLang === "ar" ? "إرسال" : "Submit";
      }
    });
  }
});


