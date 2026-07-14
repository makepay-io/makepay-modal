/* MakePay modal - configurable browser embed */
(function () {
  "use strict";

  function warn() {
    if (window.console && window.console.warn) {
      window.console.warn.apply(window.console, arguments);
    }
  }

  if (window.makepay) {
    warn("makepay.js attempted to initialize more than once.");
    return;
  }

  var apiUrlPrefix = "";
  var iframe = null;
  var showing = false;
  var previousOverflow = "";
  var activeOptions = null;
  var onModalWillEnterMethod = function () {};
  var onModalWillLeaveMethod = function () {};
  var onModalReceiveMessageMethod = function () {};

  function stripTrailingSlashes(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function normalizeApiUrlPrefix(value) {
    var normalized = stripTrailingSlashes(value);
    var url;
    if (!normalized) throw new Error("MakePay apiUrlPrefix is required.");
    try { url = new URL(normalized); } catch (_) {
      throw new Error("MakePay apiUrlPrefix must be an absolute URL.");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("MakePay apiUrlPrefix must use http or https.");
    }
    return stripTrailingSlashes(url.toString());
  }

  function setApiUrlPrefix(value) {
    apiUrlPrefix = normalizeApiUrlPrefix(value);
    return window.makepay;
  }

  function configure(options) {
    if (!options || !options.apiUrlPrefix) {
      throw new Error("Configure MakePay with { apiUrlPrefix }.");
    }
    return setApiUrlPrefix(options.apiUrlPrefix);
  }

  function requireApiUrlPrefix() {
    if (!apiUrlPrefix) {
      throw new Error("Configure MakePay before opening checkout: makepay.setApiUrlPrefix(...).");
    }
  }

  function readScriptConfiguration() {
    var script = document.currentScript || document.querySelector("script[data-api-url-prefix]");
    var configuredPrefix = script && script.getAttribute("data-api-url-prefix");
    if (configuredPrefix) apiUrlPrefix = normalizeApiUrlPrefix(configuredPrefix);
  }

  function ensureFrame() {
    if (iframe) return iframe;
    iframe = document.createElement("iframe");
    iframe.name = "makepay";
    iframe.className = "makepay";
    iframe.title = "MakePay checkout";
    iframe.style.cssText = "display:none;border:0;position:fixed;inset:0;height:100%;width:100%;z-index:2147483647;background:#fff";
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
    return iframe;
  }

  function showFrame() {
    var frame = ensureFrame();
    if (!frame.parentNode) document.body.appendChild(frame);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onModalWillEnterMethod();
    frame.style.display = "block";
    showing = true;
  }

  function hideFrame() {
    if (!iframe) return;
    onModalWillLeaveMethod();
    iframe.style.display = "none";
    iframe.src = "about:blank";
    document.body.style.overflow = previousOverflow;
    showing = false;
    activeOptions = null;
  }

  function checkoutUrl(path, options) {
    requireApiUrlPrefix();
    var url = new URL(path, apiUrlPrefix + "/");
    if (window.location && window.location.origin) {
      url.searchParams.set("parentOrigin", window.location.origin);
    }
    if (options && (options.viewType === "minimal" || options.viewType === "full")) {
      url.searchParams.set("viewType", options.viewType);
    }
    return url.toString();
  }

  function appendPaymentFrame(uid, options) {
    if (!String(uid || "").trim()) throw new Error("A MakePay payment UID is required.");
    var frame = ensureFrame();
    if (!frame.parentNode) document.body.appendChild(frame);
    frame.src = checkoutUrl("/embed/payment/" + encodeURIComponent(String(uid).trim()), options);
    activeOptions = options || null;
    showing = true;
    return frame;
  }

  function showPayment(uid, options) {
    appendPaymentFrame(uid, options);
    showFrame();
  }

  function showDonation(slug, options) {
    if (!String(slug || "").trim()) throw new Error("A MakePay donation slug is required.");
    var frame = ensureFrame();
    if (!frame.parentNode) document.body.appendChild(frame);
    frame.src = checkoutUrl("/embed/donations/" + encodeURIComponent(String(slug).trim()), options);
    activeOptions = options || null;
    showFrame();
  }

  function receiveMessage(event) {
    if (!showing || !apiUrlPrefix || event.origin !== new URL(apiUrlPrefix).origin) return;
    var data = event.data;
    if (data && data.source === "makepay" && typeof data.type === "string") {
      var detail = data.payload || null;
      if (activeOptions && typeof activeOptions.onEvent === "function") {
        activeOptions.onEvent({ type: data.type, payload: detail });
      }
      window.dispatchEvent(new CustomEvent(data.type, { detail: detail }));
    }
    if (data === "close" || data && data.source === "makepay" && data.type === "makepay.close_requested") {
      hideFrame();
    }
    onModalReceiveMessageMethod(event);
  }

  function setButtonListeners() {
    document.addEventListener("click", function (event) {
      var target = event.target && event.target.closest && event.target.closest("[data-makepay-payment-link],[data-makepay-donation-slug]");
      if (!target) return;
      var uid = target.getAttribute("data-makepay-payment-link");
      var slug = target.getAttribute("data-makepay-donation-slug");
      if (!uid && !slug) return;
      event.preventDefault();
      var viewType = target.getAttribute("data-makepay-view-type");
      var options = viewType ? { viewType: viewType } : undefined;
      if (uid) showPayment(uid, options); else showDonation(slug, options);
    });
  }

  window.addEventListener("message", receiveMessage, false);
  setButtonListeners();
  readScriptConfiguration();

  window.makepay = {
    init: configure,
    configure: configure,
    setApiUrlPrefix: setApiUrlPrefix,
    showFrame: showFrame,
    hideFrame: hideFrame,
    showPayment: showPayment,
    showInvoice: showPayment,
    appendPaymentFrame: appendPaymentFrame,
    appendAndShowPaymentFrame: showPayment,
    showDonation: showDonation,
    onModalWillEnter: function (method) { onModalWillEnterMethod = method || function () {}; },
    onModalWillLeave: function (method) { onModalWillLeaveMethod = method || function () {}; },
    onModalReceiveMessage: function (method) { onModalReceiveMessageMethod = method || function () {}; }
  };
}());
