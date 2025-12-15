fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
    const lang = document.documentElement.lang;

    
    const aboutLink = document.getElementById('about-link');
    const privacyLink = document.getElementById('privacy-link');

    if(lang === 'ar') {
      document.getElementById('footer-desc').textContent = 'تمكين الشباب السوري بالمهارات الرقمية والفرص المستقبلية.';
      document.getElementById('footer-links-title').textContent = 'حول';
      aboutLink.textContent = 'من نحن';
      aboutLink.href = 'about-ar.html';
      privacyLink.textContent = 'سياسة الخصوصية';
      privacyLink.href = 'privacy-ar.html';
      document.getElementById('footer-social-title').textContent = 'تواصل معنا';
      document.getElementById('footer-copy').textContent = '© 2025 TECH50K. جميع الحقوق محفوظة.';
    } else {
      document.getElementById('footer-desc').textContent = 'Empowering Syrian youth with digital skills and opportunities.';
      document.getElementById('footer-links-title').textContent = 'About';
      aboutLink.textContent = 'About Us';
      aboutLink.href = 'about.html';
      privacyLink.textContent = 'Privacy Policy';
      privacyLink.href = 'privacy.html';
      document.getElementById('footer-social-title').textContent = 'Connect with us';
      document.getElementById('footer-copy').textContent = '© 2025 TECH50K. All rights reserved.';
    }

    // target="_blank"
    aboutLink.target = '_blank';
    privacyLink.target = '_blank';
    document.querySelectorAll('.social-icons a').forEach(link => {
      link.target = '_blank';
    });
  });
