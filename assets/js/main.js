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

  document.querySelectorAll("form[data-contact-form]").forEach(function (form) {
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("[type='submit']");
    var endpoint = form.getAttribute("data-form-endpoint") || (data.form && data.form.endpoint);
    var fallbackEmail = (data.form && data.form.fallbackEmail) || "info@unashi.com";

    if (endpoint) {
      form.setAttribute("action", endpoint);
    }

    if (!endpoint && status) {
      status.textContent = "送信ボタンを押すと、info@unashi.com 宛のメール作成画面が開きます。";
      status.setAttribute("data-state", "preview");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.classList.add("is-submitted");

      if (!endpoint) {
        var formData = new FormData(form);
        var subject = formData.get("_subject") || "unashi.com お問い合わせ";
        var body = Array.from(formData.entries())
          .filter(function (entry) {
            return entry[0].charAt(0) !== "_";
          })
          .map(function (entry) {
            return entry[0] + ": " + entry[1];
          })
          .join("\n");
        if (status) {
          status.textContent = fallbackEmail + " 宛のメール作成画面を開きました。";
          status.setAttribute("data-state", "success");
        }
        window.location.href = "mailto:" + fallbackEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = "送信中...";
      }
      if (status) {
        status.textContent = "送信しています。";
        status.setAttribute("data-state", "sending");
      }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Form submit failed");
          }
          form.reset();
          if (status) {
            status.textContent = "送信が完了しました。担当者より折り返しご連絡します。";
            status.setAttribute("data-state", "success");
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "送信に失敗しました。時間をおいて再度お試しいただくか、" + fallbackEmail + " へご連絡ください。";
            status.setAttribute("data-state", "error");
          }
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = "送信する";
          }
        });
    });
  });

  function trackEvent(name, props) {
    if (!name) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", name, props || {});
    }
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: props || {} });
    }
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-track-event]");
    if (!target) return;
    trackEvent(target.getAttribute("data-track-event"), {
      section: target.getAttribute("data-track-section") || "",
      label: target.textContent.trim()
    });
  });
})();
