// form.js - Handles waitlist modal, country/phone code, bilingual UI for both EN/AR

// Helper: fetch country list and phone codes with flags
async function loadCountriesAndCodes(countrySel, phoneSel, lang) {
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
    countrySel.innerHTML = `<option value="">${lang === "ar" ? "اختر الدولة" : "Select a country"}</option>`;
    mapped.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.name;
      opt.setAttribute("data-flag", c.flag);
      opt.setAttribute("data-dial", c.dial);
      countrySel.appendChild(opt);
    });
    // Phone code dropdown
    phoneSel.innerHTML = `<option value="">${lang === "ar" ? "رمز الدولة" : "Code"}</option>`;
    mapped.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.dial;
      opt.textContent = `${c.code} (${c.dial})`;
      phoneSel.appendChild(opt);
    });
  } catch {
    countrySel.innerHTML = `<option value="">${lang === "ar" ? "تعذر تحميل الدول" : "Unable to load countries"}</option>`;
    phoneSel.innerHTML = `<option value="">${lang === "ar" ? "تعذر تحميل الرموز" : "Unable to load codes"}</option>`;
  }
}

function initializeForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const countrySelect = document.getElementById("country");
  const phoneCodeSelect = document.getElementById("phoneCode");
  const msg = document.getElementById("message");
  const submitBtn = document.getElementById("submitBtn");
  const accessKeyInput = document.getElementById("access_key");
  let currentLang = document.documentElement.lang;

  loadCountriesAndCodes(countrySelect, phoneCodeSelect, currentLang);

  function showMessage(text, isError = false) {
    msg.textContent = text;
    msg.style.color = isError ? "#f87171" : "";
  }

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
        setTimeout(() => {
          const modal = document.getElementById("modal");
          if(modal) modal.setAttribute("aria-hidden", "true");
        }, 900);
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