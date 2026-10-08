/**
 * Meow Playground hub — preserves all games via MeowGames
 */
(function (w) {
  "use strict";

  function tt(k) { return (window.MeowI18n && MeowI18n.t(k)) || k; }

  const CATS = [
    { id: "all", labelKey: "cat_all" },
    { id: "popular", labelKey: "cat_popular" },
    { id: "speed", labelKey: "cat_speed" },
    { id: "brain", labelKey: "cat_brain" },
    { id: "arcade", labelKey: "cat_arcade" },
    { id: "meow", labelKey: "cat_meow" },
    { id: "random", labelKey: "cat_random" },
  ];

  const SORTS = [
    { id: "popular", labelKey: "sort_popular" },
    { id: "name", labelKey: "sort_name" },
    { id: "best", labelKey: "sort_best" },
    { id: "recent", labelKey: "sort_recent" },
  ];

  let currentCat = "all";
  let currentSort = "popular";
  let searchQ = "";
  let activeGame = null;
  let gameRunning = false;
  let gameStartedAt = 0;

  const resultMessages = {
    fa: {
      high: ["رکورد شخصی جدید.", "تمیز بود.", "دور قوی‌ای بود."],
      mid: ["خوب بود.", "ادامه بده.", "بد نبود."],
      low: ["گرم شدی.", "هر وقت آماده بودی دوباره.", "تمرین کمک می‌کنه."],
    },
    en: {
      high: ["New personal best.", "That was clean.", "Strong run."],
      mid: ["Solid.", "Keep going.", "Not bad."],
      low: ["Warm-up done.", "Try again when ready.", "Practice helps."],
    },
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function gamesInCat(cat) {
    const list = (window.MeowGames && MeowGames.catalog) || [];
    if (cat === "all") return list.slice();
    if (cat === "popular") return list.filter((g) => g.popular);
    return list.filter((g) => g.cat === cat);
  }

  function filteredList() {
    let list = gamesInCat(currentCat);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.desc || "").toLowerCase().includes(q) ||
          g.id.includes(q)
      );
    }
    const scores = MeowStorage.getGames();
    if (currentSort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (currentSort === "best")
      list.sort((a, b) => ((scores[b.id] || {}).best || 0) - ((scores[a.id] || {}).best || 0));
    else if (currentSort === "recent")
      list.sort((a, b) => ((scores[b.id] || {}).lastAt || 0) - ((scores[a.id] || {}).lastAt || 0));
    else list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.name.localeCompare(b.name));
    return list;
  }

  function openPlayground(opts) {
    const overlay = $("#pg-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("pg-open");
    if (opts && opts.game) startGame(opts.game);
    else showHub();
  }

  function closePlayground() {
    if (gameRunning && !confirm(tt("leave_game"))) return;
    gameRunning = false;
    activeGame = null;
    const overlay = $("#pg-overlay");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("pg-open");
    if (window.MeowApp && MeowApp.refreshChrome) MeowApp.refreshChrome();
  }

  function showHub() {
    gameRunning = false;
    activeGame = null;
    const view = $("#pg-view");
    if (!view) return;
    const ch = MeowDaily.getChallenge();
    const p = MeowStorage.getProgress();
    view.innerHTML = `
      <header class="pg-top">
        <div>
          <h1 class="pg-title">${tt("playground_title")}</h1>
          <p class="pg-sub">${tt("choose_game")}</p>
        </div>
        <button type="button" class="icon-btn" id="pg-close" aria-label="${tt("close")}">×</button>
      </header>
      <div class="pg-toolbar">
        <input type="search" class="pg-search" id="pg-search" placeholder="${tt("search_games")}" value="${searchQ.replace(/"/g, "")}" />
        <select id="pg-sort" class="pg-select" aria-label="${tt("sort")}">
          ${SORTS.map((s) => `<option value="${s.id}" ${s.id === currentSort ? "selected" : ""}>${tt(s.labelKey)}</option>`).join("")}
        </select>
      </div>
      <div class="pg-cats" id="pg-cats"></div>
      <section class="pg-daily-bar">
        <div>
          <span class="label">${tt("daily")}</span>
          <strong>${ch.label}</strong>
          <span class="muted">${ch.done ? tt("completed") : tt("in_progress")}</span>
        </div>
        ${!ch.done ? `<button type="button" class="btn btn-sm" id="pg-daily-play">${tt("play")}</button>` : ""}
      </section>
      <div class="pg-meta-line">
        <span>${tt("level")} ${p.level}</span>
        <span>${p.totalGames || 0} ${tt("plays")}</span>
        <span>${tt("best")} ${p.bestScore || 0}</span>
      </div>
      <div class="pg-grid" id="pg-grid"></div>`;
    $("#pg-close").onclick = closePlayground;
    $("#pg-search").oninput = (e) => {
      searchQ = e.target.value.trim();
      renderGrid();
    };
    $("#pg-sort").onchange = (e) => {
      currentSort = e.target.value;
      renderGrid();
    };
    if ($("#pg-daily-play")) {
      $("#pg-daily-play").onclick = () => startGame(ch.game);
    }
    renderCats();
    renderGrid();
  }

  function renderCats() {
    const box = $("#pg-cats");
    box.innerHTML = CATS.map(
      (c) =>
        `<button type="button" class="chip ${c.id === currentCat ? "active" : ""}" data-cat="${c.id}">${tt(c.labelKey)}</button>`
    ).join("");
    box.querySelectorAll(".chip").forEach((b) => {
      b.onclick = () => {
        currentCat = b.dataset.cat;
        renderCats();
        renderGrid();
      };
    });
  }

  function renderGrid() {
    const grid = $("#pg-grid");
    const list = filteredList();
    const scores = MeowStorage.getGames();
    if (!list.length) {
      grid.innerHTML = '<p class="empty-state">' + tt("no_match") + '</p>';
      return;
    }
    grid.innerHTML = list
      .map((g) => {
        const sc = scores[g.id] || {};
        const best =
          sc.bestTime != null ? sc.bestTime + " ms" : sc.best ? String(sc.best) : "—";
        return `<article class="game-card">
          <div class="game-card-main">
            <h3>${g.name}</h3>
            <p>${g.desc || ""}</p>
            <span class="best">${tt("best")} ${best}</span>
          </div>
          <button type="button" class="btn btn-sm" data-play="${g.id}">${tt("play")}</button>
        </article>`;
      })
      .join("");
    grid.querySelectorAll("[data-play]").forEach((b) => {
      b.onclick = () => startGame(b.getAttribute("data-play"));
    });
  }

  function startGame(id) {
    const g = MeowGames.registry[id];
    if (!g) {
      showHub();
      return;
    }
    const scores = MeowStorage.getGames();
    const isNew = !(scores[id] && scores[id].plays);
    activeGame = g;
    gameRunning = true;
    gameStartedAt = Date.now();
    const view = $("#pg-view");
    view.innerHTML = `
      <div class="pg-game">
        <header class="pg-game-bar">
          <button type="button" class="icon-btn" id="pg-back" aria-label="${tt("back")}">←</button>
          <div class="pg-game-title">${g.name}</div>
          <button type="button" class="icon-btn" id="pg-close2" aria-label="${tt("close")}">×</button>
        </header>
        <div class="pg-start" id="pg-start">
          <p class="pg-sub">${g.desc || ""}</p>
          <p class="muted">${isNew ? MeowAssistant.lineFor("newGame") : tt("best") + ": " + ((scores[id] || {}).best || 0)}</p>
          <button type="button" class="btn btn-primary" id="pg-go">${tt("start")}</button>
        </div>
        <div class="pg-game-root" id="pg-game-root" hidden></div>
      </div>`;
    $("#pg-back").onclick = () => {
      if (gameRunning && !$("#pg-start") && !confirm(tt("leave_game"))) return;
      showHub();
    };
    $("#pg-close2").onclick = closePlayground;
    $("#pg-go").onclick = () => {
      $("#pg-start").hidden = true;
      const root = $("#pg-game-root");
      root.hidden = false;
      gameStartedAt = Date.now();
      const api = {
        end(result) {
          gameRunning = false;
          finishGame(g, result || {});
        },
        toast(msg) {
          const t = document.createElement("div");
          t.className = "toast";
          t.textContent = msg;
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 2000);
        },
        sound() {},
      };
      try {
        g.play(root, api);
      } catch (e) {
        console.error(e);
        api.toast(tt("game_error"));
        showHub();
      }
    };
  }

  function finishGame(g, result) {
    const playTimeMs = Date.now() - gameStartedAt;
    const save = MeowStorage.saveGameResult(g.id, {
      score: result.score || 0,
      bestTime: result.bestTime,
      category: g.cat,
      perfect: result.perfect,
      playTimeMs,
    });
    MeowDaily.reportGame(g.id, result);
    const unlocked = MeowAchievements.checkAfterGame(g, result, save);
    const score = result.score || 0;
    const lang = (window.MeowI18n && MeowI18n.getLang()) || "fa";
    const packs = resultMessages[lang] || resultMessages.fa;
    const pool =
      save.isNewRecord || score > 80
        ? packs.high
        : score > 30
          ? packs.mid
          : packs.low;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    const assist = save.isNewRecord
      ? MeowAssistant.lineFor("record")
      : save.leveled
        ? MeowAssistant.lineFor("level")
        : msg;

    const view = $("#pg-view");
    view.innerHTML = `
      <div class="pg-result">
        <p class="assist-line">${assist}</p>
        ${save.isNewRecord ? '<p class="record-flag">' + tt("new_record") + '</p>' : ""}
        <h2>${tt("result")}</h2>
        <div class="result-grid">
          <div><span>${tt("score")}</span><strong>${score}</strong></div>
          <div><span>${tt("best")}</span><strong>${save.best}</strong></div>
          <div><span>${tt("xp")}</span><strong>+${save.xpGain || 0}</strong></div>
          ${result.bestTime != null ? `<div><span>${tt("reaction")}</span><strong>${result.bestTime} ms</strong></div>` : ""}
        </div>
        ${
          unlocked.length
            ? `<div class="unlock-list">${unlocked
                .map((a) => `<div class="unlock-item"><strong>${a.title}</strong><span>${a.desc}</span></div>`)
                .join("")}</div>`
            : ""
        }
        <div class="result-actions">
          <button type="button" class="btn btn-primary" id="pg-again">${tt("replay")}</button>
          <button type="button" class="btn" id="pg-more">${tt("all_games_btn")}</button>
        </div>
      </div>`;
    $("#pg-again").onclick = () => startGame(g.id);
    $("#pg-more").onclick = showHub;
  }

  function init() {
    document.querySelectorAll("[data-open-playground]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const g = el.getAttribute("data-game");
        openPlayground(g ? { game: g } : null);
      });
    });
    const c = document.querySelector("[data-game-count]");
    if (c && window.MeowGames) c.textContent = String(MeowGames.catalog.length);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  w.MeowPlayground = { open: openPlayground, close: closePlayground, showHub };
})(window);
