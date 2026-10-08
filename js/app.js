/**
 * MeowBot 2.0 shell — navigation, chrome, easter eggs
 */
(function () {
  "use strict";

  const cfg = window.MEOW_CONFIG || {};
  let profileOpens = 0;

  function $(s, r) {
    return (r || document).querySelector(s);
  }
  function $$(s, r) {
    return Array.from((r || document).querySelectorAll(s));
  }

  function applyConfig() {
    const b = cfg.brand || {};
    const d = cfg.developer || {};
    const st = cfg.studio || {};
    const links = cfg.links || {};
    $$("[data-brand-desc]").forEach((el) => {
      if (b.shortDescription) el.textContent = b.shortDescription;
    });
    $$("[data-dev-name]").forEach((el) => (el.textContent = d.name || "COMMANDER04"));
    $$("[data-dev-user]").forEach((el) => (el.textContent = d.username || ""));
    $$("[data-dev-bio]").forEach((el) => (el.textContent = d.bio || ""));
    $$("[data-studio-name]").forEach((el) => (el.textContent = st.name || ""));
    $$("[data-studio-desc]").forEach((el) => (el.textContent = st.description || ""));
    $$("[data-link]").forEach((el) => {
      const key = el.getAttribute("data-link");
      const url = links[key];
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.addEventListener("click", (e) => e.preventDefault());
      }
    });
    const gc = $("[data-game-count]");
    if (gc && window.MeowGames) gc.textContent = String(MeowGames.catalog.length);
  }

  function showView(name) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.getAttribute("data-view") === name));
    $$("[data-nav]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-nav") === name);
    });
    if (name === "progress") renderProgress();
    if (name === "shop") renderShop();
    if (name === "profile") {
      renderProfile();
      profileOpens++;
      if (profileOpens >= 3) {
        if (MeowStorage.unlockAchievement("triple_meow")) toast(MeowI18n.t("hidden_ach"));
      }
    }
    if (name === "home") refreshChrome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function refreshChrome() {
    const p = MeowStorage.getProgress();
    const ach = MeowStorage.getAchievements();
    $$("[data-stat-games]").forEach((el) => (el.textContent = String(p.totalGames || 0)));
    $$("[data-stat-level]").forEach((el) => (el.textContent = String(p.level || 1)));
    $$("[data-stat-xp]").forEach((el) => (el.textContent = String(p.xp || 0)));
    $$("[data-stat-ach]").forEach((el) => (el.textContent = String(Object.keys(ach).length)));
    const pct = Math.min(100, Math.round(((p.xp || 0) / Math.max(1, p.xpNeed || 100)) * 100));
    $$("[data-xp-bar]").forEach((el) => {
      requestAnimationFrame(() => (el.style.width = pct + "%"));
    });
    $$("[data-currency]").forEach((el) => (el.textContent = String(MeowStorage.getShop().currency || 0)));

    const assist = $("#home-assist");
    if (assist) assist.textContent = MeowAssistant.lineFor("idle");

    const ch = MeowDaily.getChallenge();
    const daily = $("#home-daily");
    if (daily) {
      const tt = MeowI18n.t;
      daily.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div>
            <strong style="font-size:0.9rem">${ch.label}</strong>
            <p class="muted" style="font-size:0.78rem;margin-top:4px">${ch.done ? tt("daily_done") : tt("daily_reset")}</p>
          </div>
          ${!ch.done ? `<button type="button" class="btn btn-sm" data-open-playground data-game="${ch.game}">${tt("play")}</button>` : ""}
        </div>`;
      daily.querySelectorAll("[data-open-playground]").forEach((b) => {
        b.onclick = (e) => {
          e.preventDefault();
          MeowPlayground.open({ game: ch.game });
        };
      });
    }

    const feat = $("#home-featured");
    if (feat && window.MeowGames) {
      const popular = MeowGames.catalog.filter((g) => g.popular);
      const g = popular[Math.floor(Math.random() * Math.max(1, popular.length))] || MeowGames.catalog[0];
      if (g) {
        const sc = MeowStorage.getGameScore(g.id);
        feat.innerHTML = `
          <strong style="font-size:0.95rem">${g.name}</strong>
          <p class="muted" style="font-size:0.8rem;margin:4px 0 12px">${g.desc || ""}</p>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="muted" style="font-size:0.75rem">${MeowI18n.t("best")} ${sc.bestTime != null ? sc.bestTime + " ms" : sc.best || "—"}</span>
            <button type="button" class="btn btn-sm" data-play-feat="${g.id}">${MeowI18n.t("play")}</button>
          </div>`;
        feat.querySelector("[data-play-feat]").onclick = () => MeowPlayground.open({ game: g.id });
      }
    }
  }

  function renderProgress() {
    const p = MeowStorage.getProgress();
    const panel = $("#progress-panel");
    if (panel) {
      const tt = MeowI18n.t;
      panel.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-variant-numeric:tabular-nums">
          <div><span class="muted" style="font-size:0.72rem">${tt("level")}</span><div style="font-size:1.2rem;font-weight:650">${p.level}</div></div>
          <div><span class="muted" style="font-size:0.72rem">${tt("xp")}</span><div style="font-size:1.2rem;font-weight:650">${p.xp} / ${p.xpNeed}</div></div>
          <div><span class="muted" style="font-size:0.72rem">${tt("games")}</span><div style="font-weight:650">${p.totalGames || 0}</div></div>
          <div><span class="muted" style="font-size:0.72rem">${tt("best_score")}</span><div style="font-weight:650">${p.bestScore || 0}</div></div>
          <div><span class="muted" style="font-size:0.72rem">${tt("play_time")}</span><div style="font-weight:650">${Math.round((p.playTimeMs || 0) / 60000)} ${tt("min")}</div></div>
          <div><span class="muted" style="font-size:0.72rem">${tt("reaction")}</span><div style="font-weight:650">${p.bestReaction != null ? p.bestReaction + " ms" : "—"}</div></div>
        </div>
        <div class="xp-line" style="margin-top:14px"><i style="width:${Math.min(100, Math.round((p.xp / Math.max(1, p.xpNeed)) * 100))}%"></i></div>`;
    }
    const ach = MeowStorage.getAchievements();
    const grid = $("#ach-grid");
    if (grid) {
      const tt = MeowI18n.t;
      grid.innerHTML = MeowAchievements.allLocalized().map((d) => {
        const on = !!ach[d.id];
        return `<div class="ach-item ${on ? "on" : ""} ${d.hidden && !on ? "hidden-ach" : ""}">
          <strong>${d.hidden && !on ? tt("hidden_ach") : d.title}</strong>
          <span>${d.hidden && !on ? (MeowI18n.getLang() === "en" ? "Keep exploring" : "ادامه بده و کشف کن") : d.desc}</span>
        </div>`;
      }).join("");
    }
    const fav = p.favoriteGame && MeowGames.registry[p.favoriteGame];
    const stats = $("#stats-panel");
    if (stats) {
      const scores = MeowStorage.getGames();
      let most = null, mostN = 0;
      Object.keys(scores).forEach((id) => {
        if ((scores[id].plays || 0) > mostN) {
          mostN = scores[id].plays;
          most = id;
        }
      });
      const tt = MeowI18n.t;
      stats.innerHTML = `
        <p style="font-size:0.9rem">${tt("favorite")}: <strong>${fav ? fav.name : "—"}</strong></p>
        <p style="font-size:0.9rem;margin-top:8px">${tt("most_played")}: <strong>${most && MeowGames.registry[most] ? MeowGames.registry[most].name : "—"}</strong> (${mostN})</p>
        <p style="font-size:0.9rem;margin-top:8px">${tt("total_score")}: <strong>${p.totalScore || 0}</strong></p>`;
    }
  }

  function renderShop() {
    refreshChrome();
    const shop = MeowStorage.getShop();
    const box = $("#shop-list");
    if (!box) return;
    box.innerHTML = MeowShop.list()
      .map((item) => {
        const owned = (shop.owned || []).includes(item.id);
        const eq =
          shop.equipped &&
          (shop.equipped.theme === item.id || shop.equipped.frame === item.id || shop.equipped.badge === item.id);
        return `<div class="shop-item">
          <div class="info">
            <strong>${item.name}</strong>
            <span>${item.desc} · ${item.price === 0 ? MeowI18n.t("free") : item.price + " " + MeowI18n.t("coins")}</span>
          </div>
          ${
            owned
              ? `<button type="button" class="btn btn-sm" data-equip="${item.id}">${eq ? MeowI18n.t("equipped") : MeowI18n.t("equip")}</button>`
              : `<button type="button" class="btn btn-sm btn-primary" data-buy="${item.id}">${MeowI18n.t("buy")}</button>`
          }
        </div>`;
      })
      .join("");
    box.querySelectorAll("[data-buy]").forEach((b) => {
      b.onclick = () => {
        const r = MeowShop.buy(b.getAttribute("data-buy"));
        toast(r.ok ? MeowI18n.t("unlocked") : (r.error === "Not enough coins" ? MeowI18n.t("not_enough") : r.error === "Owned" ? MeowI18n.t("owned") : MeowI18n.t("failed")));
        renderShop();
      };
    });
    box.querySelectorAll("[data-equip]").forEach((b) => {
      b.onclick = () => {
        MeowShop.equip(b.getAttribute("data-equip"));
        toast(MeowI18n.t("equipped"));
        renderShop();
      };
    });
  }

  function renderProfile() {
    const u = MeowStorage.getUser();
    const shop = MeowStorage.getShop();
    const p = MeowStorage.getProgress();
    const head = $("#profile-head");
    if (head) {
      const framed = shop.equipped && shop.equipped.frame;
      head.innerHTML = `
        <div class="avatar-lg ${framed ? "framed" : ""}">${(u.name || "P").charAt(0).toUpperCase()}</div>
        <div>
          <strong>${u.name || (MeowI18n.getLang() === "en" ? "Player" : "بازیکن")}</strong>
          <p class="muted" style="font-size:0.8rem">${MeowI18n.t("level")} ${p.level}</p>
        </div>`;
    }
    $("#pf-name").value = u.name || "";
    $("#pf-bio").value = u.bio || "";
    const chips = $("#theme-chips");
    if (chips) {
      const themes = Object.keys(MeowThemes.THEMES);
      const cur = MeowStorage.getSettings().theme || "midnight";
      chips.innerHTML = themes
        .map(
          (t) =>
            `<button type="button" class="chip ${t === cur ? "active" : ""}" data-theme="${t}">${t}</button>`
        )
        .join("");
      chips.querySelectorAll("[data-theme]").forEach((b) => {
        b.onclick = () => {
          const t = b.getAttribute("data-theme");
          const s = MeowStorage.getSettings();
          s.theme = t;
          MeowStorage.setSettings(s);
          MeowThemes.apply(t);
          const shop = MeowStorage.getShop();
          shop.equipped = shop.equipped || {};
          shop.equipped.theme = "theme_" + t;
          if (!(shop.owned || []).includes("theme_" + t)) {
            shop.owned = shop.owned || [];
            shop.owned.push("theme_" + t);
          }
          MeowStorage.setShop(shop);
          renderProfile();
        };
      });
    }
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function setupSearch() {
    const input = $("#global-search");
    const out = $("#search-results");
    if (!input || !out) return;
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        out.innerHTML = "";
        return;
      }
      const rows = [];
      (MeowGames.catalog || []).forEach((g) => {
        if (g.name.toLowerCase().includes(q) || (g.desc || "").toLowerCase().includes(q)) {
          rows.push({ type: "game", id: g.id, title: g.name, sub: g.desc });
        }
      });
      MeowAchievements.allLocalized().forEach((a) => {
        if (!a.hidden && ((a.title || "").toLowerCase().includes(q) || (a.desc || "").toLowerCase().includes(q))) {
          rows.push({ type: "ach", title: a.title, sub: a.desc });
        }
      });
      const navMap = {
        home: MeowI18n.t("nav_home"),
        progress: MeowI18n.t("nav_progress"),
        shop: MeowI18n.t("nav_shop"),
        profile: MeowI18n.t("nav_profile"),
        about: MeowI18n.t("nav_about"),
        world: MeowI18n.t("world_title"),
      };
      Object.keys(navMap).forEach((s) => {
        const title = navMap[s];
        if (s.includes(q) || title.toLowerCase().includes(q)) {
          rows.push({ type: "nav", id: s, title: title, sub: MeowI18n.t("section") });
        }
      });
      out.innerHTML = rows
        .slice(0, 20)
        .map((r) => {
          if (r.type === "game")
            return `<button type="button" class="list-row" data-sg="${r.id}"><div class="meta"><strong>${r.title}</strong><span>${r.sub || ""}</span></div></button>`;
          if (r.type === "nav")
            return `<button type="button" class="list-row" data-sn="${r.id}"><div class="meta"><strong>${r.title}</strong><span>Section</span></div></button>`;
          return `<div class="list-row"><div class="meta"><strong>${r.title}</strong><span>${r.sub}</span></div></div>`;
        })
        .join("");
      out.querySelectorAll("[data-sg]").forEach((b) => {
        b.onclick = () => MeowPlayground.open({ game: b.getAttribute("data-sg") });
      });
      out.querySelectorAll("[data-sn]").forEach((b) => {
        b.onclick = () => showView(b.getAttribute("data-sn"));
      });
    };
  }

  function setupNav() {
    document.body.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav]");
      if (nav && nav.getAttribute("data-nav")) {
        e.preventDefault();
        const v = nav.getAttribute("data-nav");
        if (v === "playground") {
          MeowPlayground.open();
          return;
        }
        showView(v);
      }
    });
    $("#btn-search").onclick = () => showView("search");
    const langBtn = $("#btn-lang");
    if (langBtn) {
      langBtn.onclick = () => {
        const next = MeowI18n.getLang() === "fa" ? "en" : "fa";
        MeowI18n.setLang(next);
        onLangChange();
      };
    }
    $("#pf-save").onclick = () => {
      const u = MeowStorage.getUser();
      u.name = $("#pf-name").value.trim() || (MeowI18n.getLang() === "en" ? "Player" : "بازیکن");
      u.bio = $("#pf-bio").value.trim();
      MeowStorage.setUser(u);
      toast(MeowI18n.t("saved"));
      renderProfile();
    };
    $("#world-daily").onclick = () => {
      const ch = MeowDaily.getChallenge();
      MeowPlayground.open({ game: ch.game });
    };
    const top = $("#to-top");
    window.addEventListener(
      "scroll",
      () => {
        $("#topbar").classList.toggle("scrolled", window.scrollY > 8);
        top.classList.toggle("show", window.scrollY > 400);
      },
      { passive: true }
    );
    top.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Konami-like: M-E-O-W
  const secret = [];
  window.addEventListener("keydown", (e) => {
    secret.push(e.key.toLowerCase());
    if (secret.length > 4) secret.shift();
    if (secret.join("") === "meow") {
      if (MeowStorage.unlockAchievement("konami")) {
        MeowStorage.addXp(50);
        toast(MeowI18n.t("secret"));
      }
    }
  });

  function boot() {
    MeowThemes.init();
    // language: always FA unless user chose EN
    const lang = (MeowStorage.getSettings().lang === "en") ? "en" : "fa";
    MeowI18n.setLang(lang);
    updateLangBtn();
    applyConfig();
    setupNav();
    setupSearch();
    refreshChrome();
    const h = (location.hash || "#home").replace("#", "");
    if (h && h !== "playground") showView(h);
  }

  function updateLangBtn() {
    const b = $("#btn-lang");
    if (!b) return;
    const lang = MeowI18n.getLang();
    b.textContent = lang === "fa" ? "EN" : "FA";
    b.title = lang === "fa" ? "English" : "فارسی";
  }

  function onLangChange() {
    updateLangBtn();
    refreshChrome();
    const active = document.querySelector(".view.active");
    if (active) {
      const name = active.getAttribute("data-view");
      if (name === "progress") renderProgress();
      if (name === "shop") renderShop();
      if (name === "profile") renderProfile();
    }
  }

  window.MeowApp = { showView, refreshChrome, toast, onLangChange };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
