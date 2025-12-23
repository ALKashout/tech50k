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
        flag: c.flags?.svg || "",
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
      countrySel.appendChild(opt);
    });
    // Custom phone code dropdown with flags
    const phoneCodeDropdown = document.getElementById("phoneCodeDropdown");
    const phoneCodeInput = document.getElementById("phoneCode");
    if (phoneCodeDropdown && phoneCodeInput) {
      phoneCodeDropdown.innerHTML = '';
      // Create the visible dropdown button
      const dropdownBtn = document.createElement("button");
      dropdownBtn.type = "button";
      dropdownBtn.className = "custom-phone-dropdown-btn";
      // Match style to other input fields
      dropdownBtn.style.display = "flex";
      dropdownBtn.style.alignItems = "center";
      dropdownBtn.style.width = "100%";
      dropdownBtn.style.justifyContent = "flex-start";
      dropdownBtn.style.background = "#fff";
      dropdownBtn.style.border = "1px solid #d1d5db";
      dropdownBtn.style.borderRadius = "6px";
      dropdownBtn.style.padding = "6px 12px";
      dropdownBtn.style.cursor = "pointer";
      dropdownBtn.style.minHeight = "38px";
      dropdownBtn.style.fontSize = "1rem";
      dropdownBtn.style.fontFamily = "inherit";
      dropdownBtn.style.boxSizing = "border-box";
      dropdownBtn.style.transition = "border-color 0.2s";
      dropdownBtn.style.outline = "none";
      dropdownBtn.tabIndex = 0;
      dropdownBtn.addEventListener("focus", () => { dropdownBtn.style.borderColor = "#2563eb"; });
      dropdownBtn.addEventListener("blur", () => { dropdownBtn.style.borderColor = "#d1d5db"; });
      // Placeholder
      dropdownBtn.innerHTML = `<span style='color:#888;'>${lang === "ar" ? "رمز الدولة" : "Code"}</span>`;
      phoneCodeDropdown.appendChild(dropdownBtn);

      // Dropdown list
      const dropdownList = document.createElement("div");
      dropdownList.className = "custom-phone-dropdown-list";
      dropdownList.style.position = "absolute";
      dropdownList.style.background = "#fff";
      dropdownList.style.border = "1px solid #d1d5db";
      dropdownList.style.borderRadius = "6px";
      dropdownList.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
      dropdownList.style.zIndex = 1000;
      dropdownList.style.width = "100%";
      dropdownList.style.maxHeight = "220px";
      dropdownList.style.overflowY = "auto";
      dropdownList.style.overflowX = "hidden";
      dropdownList.style.display = "none";
      dropdownList.style.marginTop = "2px";
      dropdownList.style.fontSize = "1rem";
      dropdownList.style.fontFamily = "inherit";
      dropdownList.style.boxSizing = "border-box";
      dropdownList.style.scrollbarColor = "#d1d5db #fff";
      dropdownList.style.scrollbarWidth = "thin";

      mapped.forEach((c) => {
        const item = document.createElement("div");
        item.className = "custom-phone-dropdown-item";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.padding = "6px 12px";
        item.style.cursor = "pointer";
        item.style.gap = "0.5em";
        item.style.tabIndex = 0;
        item.style.fontSize = "1rem";
        item.style.fontFamily = "inherit";
        item.style.transition = "background 0.15s";
        item.addEventListener("mouseover", () => { item.style.background = "#f3f4f6"; });
        item.addEventListener("mouseout", () => { item.style.background = "#fff"; });
        // Flag
        const img = document.createElement("img");
        img.src = c.flag;
        img.alt = c.code;
        img.style.width = "1.2em";
        img.style.height = "1.2em";
        img.style.verticalAlign = "middle";
        img.style.marginRight = "0.4em";
        item.appendChild(img);
        // Dial code
        const codeText = document.createElement("span");
        codeText.textContent = `${c.code} (${c.dial})`;
        item.appendChild(codeText);
        // Click handler
        item.addEventListener("click", () => {
          phoneCodeInput.value = c.dial;
          dropdownBtn.innerHTML = `<img src='${c.flag}' alt='${c.code}' style='width:1.2em;height:1.2em;vertical-align:middle;margin-right:0.4em;'> <span>${c.dial}</span>`;
          dropdownList.style.display = "none";
        });
        dropdownList.appendChild(item);
      });
      phoneCodeDropdown.appendChild(dropdownList);

      // Show/hide logic
      dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownList.style.display = dropdownList.style.display === "block" ? "none" : "block";
      });
      // Hide on outside click
      document.addEventListener("click", (e) => {
        if (!phoneCodeDropdown.contains(e.target)) {
          dropdownList.style.display = "none";
        }
      });
      // Keyboard navigation (optional, basic)
      dropdownBtn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const first = dropdownList.querySelector(".custom-phone-dropdown-item");
          if (first) first.focus();
        }
      });
      dropdownList.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          dropdownList.style.display = "none";
          dropdownBtn.focus();
        }
      });
      // Set required attribute for validation
      phoneCodeInput.setAttribute("required", "required");
    }
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