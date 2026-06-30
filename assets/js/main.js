(function () {
  var data = window.UNASHI_SITE_DATA || { metrics: {}, links: {} };

  document.querySelectorAll("[data-metric]").forEach(function (node) {
    var key = node.getAttribute("data-metric");
    if (data.metrics[key]) {
      node.textContent = data.metrics[key];
    }
  });

  document.querySelectorAll("[data-link]").forEach(function (node) {
    var key = node.getAttribute("data-link");
    if (data.links[key]) {
      node.setAttribute("href", data.links[key]);
    }
  });

  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-global-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll("form[data-preview-form]").forEach(function (form) {
    form.addEventListener("submit", function () {
      form.classList.add("is-submitted");
    });
  });
})();
