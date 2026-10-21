// Sign & suggest page: submits the form to Web3Forms, which emails it to the organizers.
(() => {
  "use strict";

  // Web3Forms access key (https://web3forms.com). It identifies the inbox without revealing the address.
  const ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";
  const ENDPOINT = "https://api.web3forms.com/submit";

  const $ = (id) => document.getElementById(id);
  const form = $("sign-form");
  if (!form) return;

  const fields = {
    name: $("name"),
    institute: $("institute"),
    email: $("email"),
    position: $("position"),
    resume: $("resume"),
    suggestions: $("suggestions"),
    consent: $("consent"),
  };
  const sendStep = $("send-step");
  const submitBtn = $("submit-btn");
  const errorBox = $("form-error");

  function currentMode() {
    return form.elements.mode.value === "suggest" ? "suggest" : "sign";
  }

  function currentListing() {
    return form.elements.listing.value === "anonymous" ? "anonymous" : "public";
  }

  function applyListing() {
    const listing = currentListing();
    document.querySelectorAll("[data-show-in-listing]").forEach((el) => {
      el.hidden = el.dataset.showInListing !== listing;
    });
  }

  // Signing needs position, CV, and consent; a suggestion only needs the suggestion itself.
  function applyMode() {
    const mode = currentMode();
    const signing = mode === "sign";
    fields.position.required = signing;
    fields.resume.required = signing;
    fields.consent.required = signing;
    fields.suggestions.required = !signing;
    $("listing-row").hidden = !signing;
    $("consent-row").hidden = !signing;
    document.querySelectorAll("[data-show-in]").forEach((el) => {
      el.hidden = el.dataset.showIn !== mode;
    });
    // An error left over from the other mode would otherwise block submission.
    Object.values(fields).forEach((el) => el.setCustomValidity(""));
  }

  function setStep(n) {
    document.querySelectorAll(".step").forEach((el) => {
      const step = Number(el.dataset.step);
      el.classList.toggle("active", step === n);
      el.classList.toggle("done", step < n);
    });
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  }

  function payload() {
    const signing = currentMode() === "sign";
    const anonymous = signing && currentListing() === "anonymous";
    const value = (key) => fields[key].value.trim();
    const kind = !signing ? "修改建议 Suggestion" : anonymous ? "匿名联署 Anonymous signature" : "联署 Sign";
    const data = {
      access_key: ACCESS_KEY,
      subject: `[Quick Research] ${kind} | ${value("name")} · ${value("institute")}`,
      from_name: "Quick Research 联署页",
      "类型 Type": kind,
      "姓名 Name": value("name"),
      "单位 Institute": value("institute"),
      email: value("email"),
      "身份/职位 Position": value("position") || "—",
      "简历 Resume/CV": value("resume") || "—",
      "修改建议 Suggestions": value("suggestions") || "—",
      "声明版本 Version": form.dataset.version || "v1.0",
    };
    if (signing) {
      data["署名方式 Listing"] = anonymous ? "匿名联署 Anonymous" : "公开署名 Public";
      data["同意 Consent"] = anonymous
        ? "本人自愿联署，确认信息真实；选择匿名联署。I sign voluntarily and choose to sign anonymously."
        : "本人自愿联署，确认信息真实，同意公开姓名、身份与单位。I sign voluntarily and agree to be listed.";
    }
    return { data, signing, anonymous };
  }

  form.addEventListener("change", (event) => {
    if (event.target.name === "mode") applyMode();
    if (event.target.name === "listing") applyListing();
  });

  form.addEventListener("input", (event) => {
    if (event.target.setCustomValidity) event.target.setCustomValidity("");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    // Native validation accepts whitespace-only answers; reject those too.
    ["name", "institute", "position", "resume", "suggestions"].forEach((key) => {
      const el = fields[key];
      el.setCustomValidity(el.required && !el.value.trim() ? "请填写此项 / Please fill in this field." : "");
    });
    if (!form.reportValidity()) return;
    // Bots fill the hidden checkbox; people never see it.
    if (form.elements.botcheck.checked) return;
    if (!ACCESS_KEY || ACCESS_KEY.startsWith("YOUR_")) {
      showError("提交功能尚未配置，请稍后再试。The form is not configured yet. Please try again later.");
      return;
    }

    const { data, signing, anonymous } = payload();
    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "提交中… Sending…";
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || `HTTP ${response.status}`);
    } catch (error) {
      showError(`提交失败，请稍后重试。Submission failed, please try again later. (${error.message})`);
      submitBtn.disabled = false;
      submitBtn.textContent = label;
      return;
    }

    $("done-text").textContent = !signing
      ? "我们已收到你的修改建议，会认真阅读。We have received your suggestion and will read it carefully."
      : anonymous
        ? "我们已收到你的匿名联署，核实后会计入联署人数。We have received your anonymous signature; it will be counted once verified."
        : "我们已收到你的联署，核实后会尽快把你的名字加入名单。We have received your signature; your name will be added once verified.";
    form.hidden = true;
    sendStep.hidden = false;
    setStep(2);
    $("send-title").focus();
  });

  if (new URLSearchParams(window.location.search).get("mode") === "suggest") {
    form.elements.mode.value = "suggest";
  }
  applyMode();
  applyListing();
})();
