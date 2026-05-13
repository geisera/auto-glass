(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};

  function getValue(path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : "";
    }, config);
  }

  function fillTextBindings() {
    var nodes = document.querySelectorAll("[data-config-text]");
    nodes.forEach(function (node) {
      node.textContent = getValue(node.getAttribute("data-config-text"));
    });
  }

  function fillHrefBindings() {
    var nodes = document.querySelectorAll("[data-config-href]");
    nodes.forEach(function (node) {
      var hrefValue = getValue(node.getAttribute("data-config-href"));
      if (hrefValue) {
        node.setAttribute("href", hrefValue);
      }
    });
  }

  function getRelativePrefixToRoot() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    var segments = path.split("/").filter(Boolean);

    if (segments.length && /\.html?$/i.test(segments[segments.length - 1])) {
      segments.pop();
    }

    return segments.length ? "../".repeat(segments.length) : "";
  }

  function isRootIndexPage() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    var segments = path.split("/").filter(Boolean);

    return !segments.length || (segments.length === 1 && /^index\.html?$/i.test(segments[0]));
  }

  function resolveNavHref(href, prefix, onRootIndex) {
    if (!href) {
      return href;
    }

    if (/^[a-z]+:/i.test(href) || href.indexOf("../") === 0 || href.indexOf("./") === 0) {
      return href;
    }

    if (href.charAt(0) === "#") {
      return onRootIndex ? href : prefix + "index.html" + href;
    }

    if (href.charAt(0) === "/") {
      return prefix + href.replace(/^\/+/, "");
    }

    return prefix + href;
  }

  function renderNav() {
    var navList = document.querySelector("[data-nav-list]");
    if (!navList || !Array.isArray(config.navigation)) {
      return;
    }

    var prefix = getRelativePrefixToRoot();
    var onRootIndex = isRootIndexPage();

    navList.innerHTML = config.navigation
      .map(function (item) {
        var href = resolveNavHref(item.href, prefix, onRootIndex);
        return '<li><a href="' + href + '">' + item.label + "</a></li>";
      })
      .join("");
  }

  function renderServices() {
    var container = document.querySelector("[data-services-grid]");
    if (!container || !Array.isArray(config.services)) {
      return;
    }

    container.innerHTML = config.services
      .map(function (service) {
        var href = service.href || "#hero-form";
        return (
          '<a class="service-card-link" href="' +
          href +
          '">' +
          '<article class="info-card">' +
          "<h3>" +
          service.title +
          "</h3>" +
          "<p>" +
          service.description +
          "</p>" +
          "</article>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderReasons() {
    var container = document.querySelector("[data-reasons-grid]");
    if (!container || !Array.isArray(config.reasons)) {
      return;
    }

    container.innerHTML = config.reasons
      .map(function (reason) {
        return (
          '<article class="reason-card">' +
          "<h3>" +
          reason.title +
          "</h3>" +
          "<p>" +
          reason.description +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderValuePoints() {
    var container = document.querySelector("[data-value-grid]");
    if (!container || !Array.isArray(config.valuePoints)) {
      return;
    }

    container.innerHTML = config.valuePoints
      .map(function (point) {
        return (
          '<article class="value-card">' +
          "<h3>" +
          point.title +
          "</h3>" +
          "<p>" +
          point.description +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderCities() {
    var container = document.querySelector("[data-cities-list]");
    if (!container || !config.serviceArea || !Array.isArray(config.serviceArea.cities)) {
      return;
    }

    function slugifyCity(city) {
      return city
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    container.innerHTML = config.serviceArea.cities
      .map(function (city) {
        var slug = slugifyCity(city);
        return '<li class="city-chip"><a href="' + slug + '/">' + city + "</a></li>";
      })
      .join("");
  }

  function renderFaq() {
    var container = document.querySelector("[data-faq-groups]");
    if (!container || !Array.isArray(config.faqGroups)) {
      return;
    }

    container.innerHTML = config.faqGroups
      .map(function (group) {
        var items = group.items
          .map(function (item) {
            return (
              "<details>" +
              "<summary>" +
              item.q +
              "</summary>" +
              "<p>" +
              item.a +
              "</p>" +
              "</details>"
            );
          })
          .join("");

        return (
          '<article class="faq-group">' +
          "<h3>" +
          group.title +
          "</h3>" +
          items +
          "</article>"
        );
      })
      .join("");
  }

  function renderFooterLinks() {
    var container = document.querySelector("[data-footer-links]");
    if (!container || !Array.isArray(config.footerLinks)) {
      return;
    }

    function resolveFooterHref(href, prefix) {
      if (!href || /^(?:[a-z]+:|#|\/)/i.test(href)) {
        return href;
      }
      return prefix + href;
    }

    var prefix = getRelativePrefixToRoot();

    container.innerHTML = config.footerLinks
      .map(function (item) {
        var href = resolveFooterHref(item.href, prefix);
        return '<li><a href="' + href + '">' + item.label + "</a></li>";
      })
      .join("");
  }

  function applyMeta() {
    var phoneLinkNodes = document.querySelectorAll("[data-phone-link]");
    phoneLinkNodes.forEach(function (node) {
      node.setAttribute("href", "tel:" + (config.contact ? config.contact.phoneRaw : ""));
    });

    var mailLinkNodes = document.querySelectorAll("[data-email-link]");
    mailLinkNodes.forEach(function (node) {
      node.setAttribute("href", "mailto:" + (config.contact ? config.contact.email : ""));
    });

    var yearNode = document.querySelector("[data-current-year]");
    if (yearNode) {
      yearNode.textContent = new Date().getFullYear();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillTextBindings();
    fillHrefBindings();
    renderNav();
    renderServices();
    renderReasons();
    renderValuePoints();
    renderCities();
    renderFaq();
    renderFooterLinks();
    applyMeta();
  });
})();
