document.addEventListener("DOMContentLoaded", function() {
  fetch("../waitlist-modal.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("modal-placeholder").innerHTML = data;
      initializeModal();
      initializeForm();
    });
});