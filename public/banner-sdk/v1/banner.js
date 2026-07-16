(function () {
  "use strict";

  var script = document.currentScript;
  if (!script || !script.dataset.banner) return;

  var token = script.dataset.banner;
  var apiBase = (script.dataset.api || window.location.origin).replace(/\/$/, "");
  var visitorKey = "privystack-visitor-id";
  var ephemeralVisitorId;
  var categories = ["analytics", "marketing", "functional", "personalization"];
  var defaults = { analytics: false, marketing: false, functional: false, personalization: false };

  function visitorId() {
    var value;
    try { value = localStorage.getItem(visitorKey); } catch { value = ephemeralVisitorId; }
    if (value && /^ps_v_[a-z0-9-]{8,}$/i.test(value)) return value;
    value = "ps_v_" + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random().toString(36).slice(2));
    try { localStorage.setItem(visitorKey, value); } catch { ephemeralVisitorId = value; }
    return value;
  }

  function request(path, options) {
    return fetch(apiBase + path, Object.assign({ credentials: "omit" }, options || {})).then(function (response) {
      if (!response.ok) throw new Error("PrivyStack request failed");
      return response.json();
    }).then(function (body) { return body.data === undefined ? body : body.data; });
  }

  function button(label, handler, primary) {
    var element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.style.cssText = "border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;cursor:pointer;font:inherit;background:" + (primary || "#fff") + ";color:" + (primary ? "#fff" : "#0f172a");
    element.addEventListener("click", handler);
    return element;
  }

  function post(path, body) {
    return request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  function consent(action, selected, root) {
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (element) { element.disabled = true; });
    return post("/api/banner/consent", {
      bannerToken: token,
      visitorId: visitorId(),
      action: action,
      categories: selected,
      language: document.documentElement.lang || "en",
      pageUrl: window.location.href,
      referrer: document.referrer || undefined
    }).then(function () { root.remove(); }).catch(function (error) {
      Array.prototype.forEach.call(root.querySelectorAll("button"), function (element) { element.disabled = false; });
      var message = root.querySelector("[data-ps-error]");
      if (message) message.hidden = false;
      throw error;
    });
  }

  function preferenceDialog(config, root, current, selected) {
    var dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); dialog.setAttribute("aria-label", "Cookie preferences");
    dialog.style.cssText = "position:fixed;inset:0;z-index:1000000;display:grid;place-items:center;background:rgba(15,23,42,.55);padding:16px";
    var panel = document.createElement("section");
    panel.style.cssText = "width:min(100%,620px);max-height:90vh;overflow:auto;border-radius:12px;background:#fff;color:#0f172a;padding:24px;box-shadow:0 20px 45px rgba(0,0,0,.25)";
    var title = document.createElement("h2"); title.textContent = "Privacy preferences"; title.style.marginTop = "0"; panel.appendChild(title);
    var intro = document.createElement("p"); intro.textContent = "Choose which optional cookie categories you allow. Necessary cookies are always enabled."; panel.appendChild(intro);
    if (current.preference) {
      var details = document.createElement("p");
      details.style.cssText = "font-size:14px;color:#475569";
      details.textContent = "Last updated: " + new Date(current.preference.created_at).toLocaleString() + ". Banner version " + current.bannerVersion + ". Privacy Policy v" + (current.policyVersions.privacy || "—") + ". Cookie Policy v" + (current.policyVersions.cookie || "—") + ".";
      panel.appendChild(details);
    }
    var necessary = document.createElement("p"); necessary.textContent = "Necessary — Always enabled"; necessary.style.fontWeight = "600"; panel.appendChild(necessary);
    categories.forEach(function (name) {
      var label = document.createElement("label"); label.style.cssText = "display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-top:1px solid #e2e8f0";
      var text = document.createElement("span"); text.textContent = name.charAt(0).toUpperCase() + name.slice(1) + " cookies";
      var input = document.createElement("input"); input.type = "checkbox"; input.checked = !!selected[name]; input.setAttribute("data-category", name);
      label.appendChild(text); label.appendChild(input); panel.appendChild(label);
    });
    var actions = document.createElement("div"); actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:20px";
    var close = button("Cancel", function () { dialog.remove(); });
    var save = button("Save preferences", function () {
      var value = {}; categories.forEach(function (name) { value[name] = panel.querySelector("[data-category='" + name + "']").checked; });
      consent("save", value, root).then(function () { dialog.remove(); }).catch(function () {});
    }, config.primaryColor);
    if (current.preference) {
      actions.appendChild(button("Withdraw consent", function () { consent("withdraw", selected, root).then(function () { dialog.remove(); }).catch(function () {}); }));
      actions.appendChild(button("Download receipt", function () {
        request("/api/banner/receipt?bannerToken=" + encodeURIComponent(token) + "&visitorId=" + encodeURIComponent(visitorId())).then(function (receipt) {
          var url = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" }));
          var link = document.createElement("a"); link.href = url; link.download = "consent-receipt.json"; link.click(); URL.revokeObjectURL(url);
        });
      }));
    }
    actions.appendChild(close); actions.appendChild(save); panel.appendChild(actions); dialog.appendChild(panel); document.body.appendChild(dialog); save.focus();
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { dialog.remove(); return; }
      if (event.key !== "Tab") return;
      var focusable = dialog.querySelectorAll("button, input:not([disabled])");
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function show(config, current) {
    var root = document.createElement("aside");
    root.setAttribute("role", "region"); root.setAttribute("aria-label", "Cookie consent");
    root.style.cssText = "position:fixed;z-index:999999;left:16px;right:16px;" + (config.position === "top" ? "top:16px" : config.position === "floating" ? "top:50%;transform:translateY(-50%)" : "bottom:16px") + ";margin:auto;max-width:860px;border-radius:12px;padding:20px;background:" + (config.theme === "dark" ? "#111827" : "#fff") + ";color:" + (config.theme === "dark" ? "#fff" : "#0f172a") + ";box-shadow:0 14px 35px rgba(0,0,0,.24);font-family:system-ui,sans-serif";
    var heading = document.createElement("h2"); heading.textContent = "Your privacy choices"; heading.style.margin = "0 0 8px"; root.appendChild(heading);
    var text = document.createElement("p"); text.textContent = "We use necessary cookies and, with your permission, optional cookies to improve your experience."; text.style.margin = "0 0 16px"; root.appendChild(text);
    var error = document.createElement("p"); error.hidden = true; error.setAttribute("data-ps-error", ""); error.setAttribute("role", "alert"); error.textContent = "We could not save your choice. Please try again."; root.appendChild(error);
    var actions = document.createElement("div"); actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px";
    if (config.showPreferences) actions.appendChild(button("Manage preferences", function () { preferenceDialog(config, root, current, (current.preference && current.preference.categories) || defaults); }));
    if (config.showReject) actions.appendChild(button("Reject non-essential", function () { consent("reject", defaults, root).catch(function () {}); }));
    actions.appendChild(button("Accept all", function () { consent("accept", { analytics:true, marketing:true, functional:true, personalization:true }, root).catch(function () {}); }, config.primaryColor));
    root.appendChild(actions); document.body.appendChild(root); actions.querySelector("button:last-child").focus();
    post("/api/banner/displayed", { bannerToken: token, visitorId: visitorId() }).catch(function () {});
  }

  Promise.all([
    request("/api/banner/runtime/" + encodeURIComponent(token)),
    request("/api/banner/preferences?bannerToken=" + encodeURIComponent(token) + "&visitorId=" + encodeURIComponent(visitorId()))
  ]).then(function (result) { if (result[1].requiresReview) show(result[0], result[1]); }).catch(function () {});
})();
