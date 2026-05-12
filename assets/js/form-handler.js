(function () {
  "use strict";

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    return /^[0-9+()\-\s]{10,}$/.test(value);
  }

  function setMessage(node, text, type) {
    node.textContent = text;
    node.className = "form-message " + type;
  }

  function track(eventName, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      payload: payload
    });
  }

  async function submitForm(data) {
    var endpoint = window.SITE_CONFIG && window.SITE_CONFIG.forms ? window.SITE_CONFIG.forms.endpoint : "";

    if (!endpoint || endpoint.indexOf("example.com") > -1) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve({ ok: true });
        }, 400);
      });
    }

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-lead-form]");
    if (!form) {
      return;
    }

    var messageNode = form.querySelector("[data-form-message]");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var data = {
        name: (formData.get("name") || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        email: (formData.get("email") || "").toString().trim(),
        service: (formData.get("service") || "").toString().trim(),
        message: (formData.get("message") || "").toString().trim()
      };

      if (!data.name || !data.phone || !data.service) {
        setMessage(messageNode, "Please fill name, phone, and service type.", "error");
        return;
      }

      if (!isPhone(data.phone)) {
        setMessage(messageNode, "Enter a valid phone number.", "error");
        return;
      }

      if (data.email && !isEmail(data.email)) {
        setMessage(messageNode, "Enter a valid email address.", "error");
        return;
      }

      var submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";

      try {
        var response = await submitForm(data);
        if (!response.ok && response.ok !== undefined) {
          throw new Error("Network response not ok");
        }

        track("lead_form_submit", {
          service: data.service
        });

        setMessage(
          messageNode,
          (window.SITE_CONFIG && window.SITE_CONFIG.forms && window.SITE_CONFIG.forms.successMessage) ||
            "Request sent successfully.",
          "success"
        );
        form.reset();

        var thankYouUrl = (window.SITE_CONFIG && window.SITE_CONFIG.forms && window.SITE_CONFIG.forms.thankYouUrl) || "thank-you.html";

        setTimeout(function () {
          window.location.href = thankYouUrl;
        }, 800);
      } catch (error) {
        setMessage(
          messageNode,
          (window.SITE_CONFIG && window.SITE_CONFIG.forms && window.SITE_CONFIG.forms.errorMessage) ||
            "Could not submit right now.",
          "error"
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Request";
      }
    });

    var clickTrackers = document.querySelectorAll("[data-track-click]");
    clickTrackers.forEach(function (node) {
      node.addEventListener("click", function () {
        track("lead_click", {
          type: node.getAttribute("data-track-click")
        });
      });
    });
  });
})();
