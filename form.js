document.addEventListener('DOMContentLoaded', async () => {
    const lang = document.documentElement.lang || 'en';
    const isArabic = lang === 'ar';
    const formUrl = 'form.html';

    try {
        const res = await fetch(formUrl);
        if (!res.ok) throw new Error('Failed to load form.html');
        const html = await res.text();

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        const modal = wrapper.firstElementChild;
        if (!modal) return;

        document.body.appendChild(modal);
        wireModal(modal, isArabic);
    } catch (err) {
        console.error('Error loading popup form:', err);
    }
});

function wireModal(modal, isArabic) {
    const openBtn = document.querySelector('.hero .cta');
    const closeBtns = modal.querySelectorAll('[data-close]');
    const form = modal.querySelector('#contactForm');

    function setOpen(open) {
        modal.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    openBtn?.addEventListener('click', () => setOpen(true));
    closeBtns.forEach(btn => btn.addEventListener('click', () => setOpen(false)));
    modal.addEventListener('click', e => {
        if (e.target === modal.querySelector('.modal-overlay')) setOpen(false);
    });

    if (!form) return;

    modal.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    // تعديل موقع زر الإغلاق
    const closeBtn = modal.querySelector('.modal-close');
    if (isArabic) {
        closeBtn.style.left = '12px';
        closeBtn.style.right = 'auto';
    } else {
        closeBtn.style.right = '12px';
        closeBtn.style.left = 'auto';
    }

    const texts = isArabic
        ? {
            title: 'تواصل معنا',
            name: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            country: 'بلد الإقامة',
            phone: 'رقم الهاتف',
            age: 'الفئة العمرية',
            submit: 'إرسال',
            sending: 'جارٍ الإرسال…',
            sent: 'تم إرسال النموذج بنجاح',
            error: 'يرجى تعبئة النموذج بشكل صحيح',
            selectCountry: 'اختر الدولة'
        }
        : {
            title: 'Contact Us',
            name: 'Full Name',
            email: 'Email',
            country: 'Country of Residence',
            phone: 'Phone number',
            age: 'Age group',
            submit: 'Submit',
            sending: 'Sending…',
            sent: 'Form sent successfully',
            error: 'Please complete the form correctly',
            selectCountry: 'Select a country'
        };

    // تحديث النصوص الرئيسية
    modal.querySelector('#modal-title').textContent = isArabic
        ? 'انضم إلى القائمة الانتظارية'
        : 'Join the Waitlist';

    modal.querySelector('#modal-sub').textContent = isArabic
        ? 'املأ النموذج أدناه للانضمام إلى المبادرة.'
        : 'Fill the form below to join the initiative.';

    const options = isArabic
        ? {
            ageGroups: [
                { value: '', text: 'اختر الفئة العمرية' },
                { value: 'under_13', text: 'أقل من 13' },
                { value: '13_17', text: '13-17' },
                { value: '18_24', text: '18-24' },
                { value: '25_34', text: '25-34' },
                { value: '35_44', text: '35-44' },
                { value: '45_54', text: '45-54' },
                { value: '55_64', text: '55-64' },
                { value: '65_plus', text: '65 أو أكثر' },
            ],
            gender: [
                { selector: '#gender-female', text: 'أنثى' },
                { selector: '#gender-male', text: 'ذكر' },
            ],
            education: [
                { value: 'High school or equivalent', text: 'الثانوية أو ما يعادلها' },
                { value: "Bachelor's degree", text: 'درجة البكالوريوس' },
                { value: "Master's degree", text: 'درجة الماجستير' },
                { value: 'Doctorate', text: 'درجة الدكتوراه' },
                { value: 'Other', text: 'أخرى' },
            ],
        }
        : {
            ageGroups: [
                { value: '', text: 'Select your age group' },
                { value: 'under_13', text: 'Under 13' },
                { value: '13_17', text: '13-17' },
                { value: '18_24', text: '18-24' },
                { value: '25_34', text: '25-34' },
                { value: '35_44', text: '35-44' },
                { value: '45_54', text: '45-54' },
                { value: '55_64', text: '55-64' },
                { value: '65_plus', text: '65 or older' },
            ],
            gender: [
                { selector: '#gender-female', text: 'Female' },
                { selector: '#gender-male', text: 'Male' },
            ],
            education: [
                { value: 'High school or equivalent', text: 'High school or equivalent' },
                { value: "Bachelor's degree", text: "Bachelor's degree" },
                { value: "Master's degree", text: "Master's degree" },
                { value: 'Doctorate', text: 'Doctorate' },
                { value: 'Other', text: 'Other' },
            ],
        };

    // تحديث Labels
    modal.querySelector('#form-heading').textContent = texts.title;
    modal.querySelector('#label-name').textContent = texts.name;
    modal.querySelector('#label-email').textContent = texts.email;
    modal.querySelector('#label-country').textContent = texts.country;
    modal.querySelector('#label-phone').textContent = texts.phone;
    modal.querySelector('#label-age').textContent = texts.age;

    // تحديث Age Group
    const ageSelect = modal.querySelector('#ageGroup');
    ageSelect.innerHTML = '';
    options.ageGroups.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        ageSelect.appendChild(option);
    });

    // تحديث Gender
    options.gender.forEach(g => {
        const el = modal.querySelector(g.selector);
        if (el) el.textContent = g.text;
    });

    // تحديث Education
    options.education.forEach(e => {
        const radio = modal.querySelector(`input[name="education"][value="${e.value}"]`);
        if (radio) {
            // اذا لم يوجد span للعرض ضيفه
            let span = radio.parentElement.querySelector('.edu-text');
            if (!span) {
                span = document.createElement('span');
                span.className = 'edu-text';
                radio.parentElement.appendChild(span);
            }
            span.textContent = e.text;
        }
    });

    // زر Submit
    const submitBtn = modal.querySelector('#submitBtn');
    submitBtn.textContent = texts.submit;

    // Countries
    const countrySelect = modal.querySelector('#country');
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
        .then(res => res.json())
        .then(list => {
            const countries = list
                .map(c => ({ code: c.cca2, name: c.name.common }))
                .filter(c => c.code && c.name)
                .sort((a, b) => a.name.localeCompare(b.name));

            countrySelect.innerHTML = `<option value="">${texts.selectCountry}</option>`;
            countries.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.code;
                opt.textContent = c.name;
                countrySelect.appendChild(opt);
            });
        })
        .catch(err => {
            console.error('Failed to load countries', err);
            countrySelect.innerHTML = `<option value="">${texts.selectCountry}</option>`;
        });

    // Phone Codes
    const phoneCodeSelect = modal.querySelector('#phoneCode');
    fetch('https://restcountries.com/v3.1/all?fields=idd,cca2')
        .then(res => res.json())
        .then(list => {
            const phoneCodes = list
                .map(c => ({
                    code: c.cca2,
                    prefix: c.idd && c.idd.root ? c.idd.root + (c.idd.suffixes && c.idd.suffixes.length > 0 ? c.idd.suffixes[0] : '') : null,
                }))
                .filter(c => c.code && c.prefix)

            phoneCodeSelect.innerHTML = `<option value="">--</option>`;
            const uniquePhoneCodes = [...new Map(phoneCodes.map(item => [item['prefix'], item])).values()];

            uniquePhoneCodes.sort((a, b) => a.code.localeCompare(b.code));

            uniquePhoneCodes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.prefix;
                opt.textContent = `${c.code} (${c.prefix})`;
                phoneCodeSelect.appendChild(opt);
            });
        })
        .catch(err => {
            console.error('Failed to load phone codes', err);
            phoneCodeSelect.innerHTML = `<option value="">--</option>`;
        });

    // Form submit
    const message = modal.querySelector('#message');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        if (!form.checkValidity()) {
            message.textContent = texts.error;
            message.style.color = '#f87171';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = texts.sending;
        message.textContent = '';

        setTimeout(() => {
            message.textContent = texts.sent;
            message.style.color = '#22c55e';
            submitBtn.disabled = false;
            submitBtn.textContent = texts.submit;
            form.reset();
            setTimeout(() => setOpen(false), 800);
        }, 800);
    });
}
