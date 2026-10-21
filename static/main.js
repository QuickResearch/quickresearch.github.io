// Statement page: language tabs and the signatory list.
(() => {
  "use strict";

  const STORAGE_KEY = "quick-research-lang";
  const tabs = Array.from(document.querySelectorAll(".lang-tab"));
  const panels = document.querySelectorAll(".lang-panel");
  const reader = document.getElementById("statement");
  const dock = document.querySelector(".lang-dock");
  const list = document.getElementById("list");
  const people = Array.isArray(window.QR_SIGNATORIES) ? window.QR_SIGNATORIES : [];
  const collators = {
    zh: new Intl.Collator("zh-Hans-CN-u-co-pinyin", { sensitivity: "base" }),
    en: new Intl.Collator("en", { sensitivity: "base" }),
  };

  function initialLang() {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "zh" || param === "en") return param;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (_) {
      // Storage can be unavailable (private mode, blocked site data).
    }
    return /^zh\b/i.test(navigator.language || "") ? "zh" : "en";
  }

  // English view prefers the *_en field; Chinese view prefers the base field.
  function pick(person, field, lang) {
    const base = person[field];
    const en = person[field + "_en"];
    return String((lang === "en" ? en || base : base || en) || "").trim();
  }

  function countLine(total, anonymous, lang) {
    if (total === 0) {
      return [lang === "en" ? "Signing is open. Be among the first to sign." : "联署已开放，欢迎成为首批联署者。"];
    }
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = String(total);
    if (lang === "en") {
      const line = [count, total === 1 ? " signatory so far" : " signatories so far"];
      if (anonymous) line.push(` (${anonymous} anonymous)`);
      return line;
    }
    const line = ["目前已有 ", count, " 位学生与科研工作者联署"];
    if (anonymous) line.push(`，其中 ${anonymous} 位匿名`);
    return line;
  }

  function renderSignatories(lang) {
    const body = document.getElementById("sig-body");
    if (!body) return;
    // Anonymous signatures are counted but never listed.
    const anonymous = people.filter((p) => p.anonymous).length;
    const rows = people
      .filter((p) => !p.anonymous)
      .map((p) => [pick(p, "name", lang), pick(p, "position", lang), pick(p, "institute", lang)])
      .filter((cells) => cells[0])
      .sort((a, b) => collators[lang].compare(a[0], b[0]));

    body.replaceChildren(
      ...rows.map((cells) => {
        const tr = document.createElement("tr");
        cells.forEach((text) => {
          const td = document.createElement("td");
          td.textContent = text;
          tr.append(td);
        });
        return tr;
      })
    );
    document.getElementById("sig-table").hidden = rows.length === 0;
    document.getElementById("sig-empty").hidden = rows.length > 0;
    document.getElementById("sig-count").replaceChildren(...countLine(rows.length + anonymous, anonymous, lang));
  }

  function setLang(lang) {
    tabs.forEach((tab) => {
      const on = tab.dataset.lang === lang;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      const on = panel.dataset.panel === lang;
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
    document.querySelectorAll("[data-i18n-zh]").forEach((el) => {
      el.textContent = lang === "en" ? el.dataset.i18nEn : el.dataset.i18nZh;
    });
    document.querySelectorAll("[data-aria-zh]").forEach((el) => {
      el.setAttribute("aria-label", lang === "en" ? el.dataset.ariaEn : el.dataset.ariaZh);
    });
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    renderSignatories(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {
      // Remembering the language is only a convenience.
    }
  }

  // Switching mid-statement keeps the reader in the same section of the other language.
  function switchLang(lang) {
    const limit = (dock ? dock.getBoundingClientRect().bottom : 0) + 24;
    const reading =
      reader.getBoundingClientRect().top < 0 && (!list || list.getBoundingClientRect().top > limit);
    let section = -1;
    if (reading) {
      document.querySelectorAll(".lang-panel.active h2").forEach((heading, i) => {
        if (heading.getBoundingClientRect().top <= limit) section = i;
      });
    }
    setLang(lang);
    if (!reading) return;
    const target = section >= 0 ? document.querySelectorAll(".lang-panel.active h2")[section] : reader;
    (target || reader).scrollIntoView({ block: "start", behavior: "instant" });
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => switchLang(tab.dataset.lang)));

  const tabList = document.querySelector(".lang-tabs");
  if (tabList) {
    tabList.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      switchLang(next.dataset.lang);
    });
  }

  setLang(initialLang());
})();
