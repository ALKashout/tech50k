const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    item.classList.toggle('active');

    faqItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('active');
      }
    });
  });
});

// Modal / form popup — wire after DOM content parsed so modal exists
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('.hero .cta');
  const modal = document.getElementById('modal');
  const closes = modal ? modal.querySelectorAll('[data-close]') : [];
  const form = document.getElementById('contactForm');

  function setOpen(isOpen) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => setOpen(true));
  }

  closes.forEach(btn => btn.addEventListener('click', () => setOpen(false)));

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) setOpen(false);
    });
  }

  // If the public contact form exists in the modal, wire its behavior
  if (form) {
    const countrySelect = document.getElementById('country');
    const msg = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const accessKeyInput = document.getElementById('access_key');

    // Load countries (REST Countries)
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      .then(res => res.json())
      .then(list => {
        const mapped = list
          .map(c => ({ code: c.cca2 || '', name: c.name?.common || '' }))
          .filter(c => c.code && c.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        countrySelect.innerHTML = '<option value="">Select a country</option>';
        mapped.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.code;
          opt.textContent = c.name;
          countrySelect.appendChild(opt);
        });
      })
      .catch(() => {
        countrySelect.innerHTML = '<option value="">Unable to load countries</option>';
      });

    function showMessage(text, isError = false) {
      msg.textContent = text;
      msg.style.color = isError ? '#f87171' : '';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        showMessage('Please complete the form correctly.', true);
        return;
      }

      const education = document.querySelector('input[name="education"]:checked')?.value;
      if (!education) {
        showMessage('Please select your highest level of education.', true);
        return;
      }

      const data = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        country: form.country.value,
        education
      };

      const access_key = accessKeyInput?.value?.trim();
      if (!access_key || access_key === 'YOUR_WEB3FORMS_ACCESS_KEY') {
        showMessage('Please configure your Web3Forms access key in the hidden field before submitting.', true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      showMessage('');

      try {
        const payload = {
          access_key,
          subject: `Website form submission: ${data.fullName}`,
          name: data.fullName,
          email: data.email,
          message: `Country: ${data.country}\nEducation: ${data.education}`,
          to: 'aladdin@engineer.com'
        };

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (res.ok && json.success) {
          showMessage('Thanks — your message was sent.');
          form.reset();
          setTimeout(() => setOpen(false), 900);
        } else {
          showMessage(json.message || 'Failed to send message.', true);
        }
      } catch (err) {
        showMessage('Network error. Please try again later.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }
});
