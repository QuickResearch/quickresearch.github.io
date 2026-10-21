// Sign & suggest page: turns the form into an email the visitor sends from their own mailbox.
(() => {
  "use strict";

  const TO = "kunlunz097@gmail.com";
  // Some mail apps truncate mailto: URLs beyond roughly 2,000 characters.
  const MAILTO_SAFE_LENGTH = 2000;

  const $ = (id) => document.getElementById(id);
  const form = $("sign-form");
  if (!form) return;

  const fields = {
    name: $("name"),
    institute: $("institute"),
    position: $("position"),
    resume: $("resume"),
    suggestions: $("suggestions"),
    consent: $("consent"),
  };
  const sendStep = $("send-step");

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

  function compose() {
    const signing = currentMode() === "sign";
    const anonymous = signing && currentListing() === "anonymous";
    const value = (key) => fields[key].value.trim();
    const name = value("name");
    const institute = value("institute");
    const position = value("position");
    const resume = value("resume");
    const suggestions = value("suggestions");

    const kind = !signing ? "修改建议 Suggestion" : anonymous ? "匿名联署 Anonymous signature" : "联署 Sign";
    const subject = `[Quick Research] ${kind} | ${name} · ${institute}`;
    const lines = [
      "您好，Hello,",
      "",
      signing
        ? "我已阅读《“快”科研联合声明》全文，希望加入联署。"
        : "我已阅读《“快”科研联合声明》，希望对声明提出修改建议。",
      signing
        ? "I have read the Joint Statement on Quick Research in full and would like to sign it."
        : "I have read the Joint Statement on Quick Research and would like to suggest revisions.",
      "",
      `姓名 Name: ${name}`,
      `单位 Institute: ${institute}`,
    ];
    if (position) lines.push(`身份/职位 Position: ${position}`);
    if (signing) lines.push(`署名方式 Listing: ${anonymous ? "匿名联署 Anonymous" : "公开署名 Public"}`);
    lines.push(`声明版本 Version: ${form.dataset.version || "v1.0"}`);
    if (resume) {
      if (resume.includes("\n")) lines.push("", "简历 Resume/CV:", resume);
      else lines.push(`简历 Resume/CV: ${resume}`);
    }
    if (suggestions) lines.push("", "修改建议 Suggestions:", suggestions);
    if (signing && anonymous) {
      lines.push(
        "",
        "本人自愿联署，确认以上信息真实；我选择匿名联署，主页只计入人数，不公开我的姓名与单位。",
        "I sign voluntarily and confirm that the information above is accurate. I choose to sign anonymously: count me, but do not show my name or institute."
      );
    } else if (signing) {
      lines.push(
        "",
        "本人自愿联署，确认以上信息真实，并同意在声明主页公开姓名、身份与单位。",
        "I sign voluntarily, confirm that the information above is accurate, and agree to have my name, position, and institute listed on the statement website."
      );
    }
    return { subject, body: lines.join("\n") };
  }

  function mailLinks({ subject, body }) {
    const to = encodeURIComponent(TO);
    const su = encodeURIComponent(subject);
    return {
      // RFC 6068 asks for CRLF line breaks in mailto: bodies.
      mailto: `mailto:${TO}?subject=${su}&body=${encodeURIComponent(body.replace(/\n/g, "\r\n"))}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${encodeURIComponent(body)}`,
      outlook: `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${su}&body=${encodeURIComponent(body)}`,
    };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fall back to a temporary selection for browsers without the async clipboard.
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  form.addEventListener("change", (event) => {
    if (event.target.name === "mode") applyMode();
    if (event.target.name === "listing") applyListing();
  });

  form.addEventListener("input", (event) => {
    if (event.target.setCustomValidity) event.target.setCustomValidity("");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // Native validation accepts whitespace-only answers; reject those too.
    ["name", "institute", "position", "resume", "suggestions"].forEach((key) => {
      const el = fields[key];
      el.setCustomValidity(el.required && !el.value.trim() ? "请填写此项 / Please fill in this field." : "");
    });
    if (!form.reportValidity()) return;

    const mail = compose();
    const links = mailLinks(mail);
    $("mail-subject").textContent = mail.subject;
    $("mail-body").textContent = mail.body;
    $("send-mailto").href = links.mailto;
    $("send-gmail").href = links.gmail;
    $("send-outlook").href = links.outlook;
    $("long-note").hidden = links.mailto.length <= MAILTO_SAFE_LENGTH;

    form.hidden = true;
    sendStep.hidden = false;
    setStep(2);
    $("send-title").focus();
  });

  $("edit-again").addEventListener("click", () => {
    sendStep.hidden = true;
    form.hidden = false;
    setStep(1);
    fields.name.focus();
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    const label = button.textContent;
    let timer = 0;
    button.addEventListener("click", async () => {
      const ok = await copyText($(button.dataset.copy).textContent);
      button.textContent = ok ? "已复制 Copied" : "复制失败 Failed";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.textContent = label;
      }, 1600);
    });
  });

  if (new URLSearchParams(window.location.search).get("mode") === "suggest") {
    form.elements.mode.value = "suggest";
  }
  applyMode();
  applyListing();
})();
