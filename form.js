// form.js - Handles waitlist modal, country/phone code, bilingual UI for both EN/AR

// Helper: fetch country list and phone codes with flags
async function loadCountriesAndCodes(countrySel, phoneSel) {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags");
    const list = await res.json();
    // Sort by English name
    const mapped = list
      .map((c) => ({
        code: c.cca2 || "",
        name: c.name?.common || "",
        flag: c.flags?.emoji || "",
        dial: c.idd?.root ? c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : "") : ""
      }))
      .filter((c) => c.code && c.name && c.dial)
      .sort((a, b) => a.name.localeCompare(b.name));
    // Country dropdown
    countrySel.innerHTML = '<option value="">Select</option>';
    mapped.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.name;
      opt.setAttribute("data-flag", c.flag);
      opt.setAttribute("data-dial", c.dial);
      countrySel.appendChild(opt);
    });
    // Phone code dropdown
    phoneSel.innerHTML = '';
    mapped.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.dial;
      opt.textContent = `${c.flag} ${c.dial} (${c.code})`;
      phoneSel.appendChild(opt);
    });
  } catch {
    countrySel.innerHTML = '<option value="">Unable to load</option>';
    phoneSel.innerHTML = '<option value="">Unable to load</option>';
  }
}

// Helper: switch language (EN/AR)
function setFormLang(lang, root) {
  root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  root.querySelectorAll("[data-en],[data-ar]").forEach((el) => {
    el.textContent = el.getAttribute(`data-${lang}`) || el.textContent;
  });
  // Set placeholders for select
  const countrySel = root.querySelector("#country");
  if (countrySel) countrySel.firstElementChild.textContent = lang === "ar" ? "اختر" : "Select";
  const ageSel = root.querySelector("#ageGroup");
  if (ageSel) ageSel.firstElementChild.textContent = lang === "ar" ? "اختر" : "Select";
  // Submit button
  const submitBtn = root.querySelector("#submitBtn");
  if (submitBtn) submitBtn.textContent = submitBtn.getAttribute(`data-${lang}`);
}

// Modal logic for both EN/AR pages
function setupWaitlistModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  const openBtn = document.querySelector(".hero .cta");
  const closes = modal.querySelectorAll("[data-close]");
  const form = modal.querySelector("#contactForm");
  const countrySel = modal.querySelector("#country");
  const phoneSel = modal.querySelector("#phoneCode");
  const langEnBtn = modal.querySelector("#lang-en");
  const langArBtn = modal.querySelector("#lang-ar");
  let lang = document.documentElement.lang === "ar" ? "ar" : "en";

  function setOpen(isOpen) {
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  if (openBtn) openBtn.addEventListener("click", () => setOpen(true));
  closes.forEach((btn) => btn.addEventListener("click", () => setOpen(false)));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) setOpen(false);
  });

  // Language toggle
  function updateLang(newLang) {
    lang = newLang;
    setFormLang(lang, modal);
    langEnBtn.classList.toggle("active", lang === "en");
    langArBtn.classList.toggle("active", lang === "ar");
  }
  langEnBtn.addEventListener("click", () => updateLang("en"));
  langArBtn.addEventListener("click", () => updateLang("ar"));
  updateLang(lang);

  // Populate country/phone code
  loadCountriesAndCodes(countrySel, phoneSel);

  // Form submission
  if (form) {
    const msg = modal.querySelector("#message");
    const submitBtn = modal.querySelector("#submitBtn");
    const accessKeyInput = modal.querySelector("#access_key");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.textContent = lang === "ar" ? "يرجى تعبئة جميع الحقول بشكل صحيح." : "Please complete the form correctly.";
        msg.style.color = "#f87171";
        return;
      }
      const education = form.querySelector('input[name="education"]:checked')?.value;
      const ageGroup = form.ageGroup?.value;
      const gender = form.querySelector('input[name="gender"]:checked')?.value;
      if (!education || !ageGroup || !gender) {
        msg.textContent = lang === "ar" ? "يرجى تعبئة جميع الحقول بشكل صحيح." : "Please complete the form correctly.";
        msg.style.color = "#f87171";
        return;
      }
      const data = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        country: form.country.value,
        phone: `${form.phoneCode.value} ${form.phoneNumber.value.trim()}`,
        education,
        ageGroup,
        gender,
      };
      const access_key = accessKeyInput?.value?.trim();
      if (!access_key || access_key === "YOUR_WEB3FORMS_ACCESS_KEY") {
        msg.textContent = lang === "ar" ? "يرجى ضبط مفتاح Web3Forms قبل الإرسال." : "Please configure your Web3Forms access key before submitting.";
        msg.style.color = "#f87171";
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = lang === "ar" ? "يتم الإرسال..." : "Sending…";
      msg.textContent = "";
      try {
        const payload = {
          access_key,
          subject: `Waitlist: ${data.fullName}`,
          name: data.fullName,
          email: data.email,
          message: `Country: ${data.country}\nPhone: ${data.phone}\nAge group: ${data.ageGroup}\nGender: ${data.gender}\nEducation: ${data.education}`,
          phone: data.phone,
          age_group: data.ageGroup,
          gender: data.gender,
          to: "aladdin@engineer.com",
        };
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          msg.textContent = lang === "ar" ? "تم الإرسال بنجاح." : "Thanks — your message was sent.";
          msg.style.color = "#22c55e";
          form.reset();
          setTimeout(() => setOpen(false), 900);
        } else {
          msg.textContent = json.message || (lang === "ar" ? "فشل الإرسال." : "Failed to send message.");
          msg.style.color = "#f87171";
        }
      } catch (err) {
        msg.textContent = lang === "ar" ? "خطأ في الشبكة. حاول لاحقاً." : "Network error. Please try again later.";
        msg.style.color = "#f87171";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = lang === "ar" ? "إرسال" : "Submit";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", setupWaitlistModal);
