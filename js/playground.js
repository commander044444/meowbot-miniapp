/**
 * Meow Playground hub — preserves all games via MeowGames
 */
(function (w) {
  "use strict";

  const CATS = [
    { id: "all", label: "All" },
    { id: "popular", label: "Popular" },
    { id: "speed", label: "Reaction" },
    { id: "brain", label: "Memory" },
    { id: "arcade", label: "Action" },
    { id: "meow", label: "Meow" },
    { id: "random", label: "Casual" },
  ];

  const SORTS = [
    { id: "popular", label: "Popular" },
    { id: "name", label: "A–Z" },
    { id: "best", label: "Best score" },
    { id: "recent", label: "Recent" },
  ];

  let currentCat = "all";
  let currentSort = "popular";
  let searchQ = "";
  let activeGame = null;
  let gameRunning = false;
  let gameStartedAt = 0;

  const resultMessages = {
    high: ["New personal best.", "That was clean.", "Strong run."],
    mid: ["Solid.", "Keep going.", "Not bad."],
    low: ["Warm-up done.", "Try again when ready.", "Practice helps."],
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
    if (gameRunning && !confirm("Leave this game?")) return;
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
          <h1 class="pg-title">Playground</h1>
          <p class="pg-sub">Choose a game</p>
        </div>
        <button type="button" class="icon-btn" id="pg-close" aria-label="Close">×</button>
      </header>
      <div class="pg-toolbar">
        <input type="search" class="pg-search" id="pg-search" placeholder="Search games" value="${searchQ.replace(/"/g, "")}" />
        <select id="pg-sort" class="pg-select" aria-label="Sort">
          ${SORTS.map((s) => `<option value="${s.id}" ${s.id === currentSort ? "selected" : ""}>${s.label}</option>`).join("")}
        </select>
      </div>
      <div class="pg-cats" id="pg-cats"></div>
      <section class="pg-daily-bar">
        <div>
          <span class="label">Daily</span>
          <strong>${ch.label}</strong>
          <span class="muted">${ch.done ? "Completed" : "In progress"}</span>
        </div>
        ${!ch.done ? `<button type="button" class="btn btn-sm" id="pg-daily-play">Play</button>` : ""}
      </section>
      <div class="pg-meta-line">
        <span>Lv ${p.level}</span>
        <span>${p.totalGames || 0} plays</span>
        <span>Best ${p.bestScore || 0}</span>
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
        `<button type="button" class="chip ${c.id === currentCat ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`
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
      grid.innerHTML = '<p class="empty-state">No games match.</p>';
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
            <span class="best">Best ${best}</span>
          </div>
          <button type="button" class="btn btn-sm" data-play="${g.id}">Play</button>
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
          <button type="button" class="icon-btn" id="pg-back" aria-label="Back">←</button>
          <div class="pg-game-title">${g.name}</div>
          <button type="button" class="icon-btn" id="pg-close2" aria-label="Close">×</button>
        </header>
        <div class="pg-start" id="pg-start">
          <p class="pg-sub">${g.desc || ""}</p>
          <p class="muted">${isNew ? MeowAssistant.lineFor("newGame") : "Best: " + ((scores[id] || {}).best || 0)}</p>
          <button type="button" class="btn btn-primary" id="pg-go">Start</button>
        </div>
        <div class="pg-game-root" id="pg-game-root" hidden></div>
      </div>`;
    $("#pg-back").onclick = () => {
      if (gameRunning && !$("#pg-start") && !confirm("Leave this game?")) return;
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
        api.toast("Game error");
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
    const pool =
      save.isNewRecord || score > 80
        ? resultMessages.high
        : score > 30
          ? resultMessages.mid
          : resultMessages.low;
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
        ${save.isNewRecord ? '<p class="record-flag">New record</p>' : ""}
        <h2>Result</h2>
        <div class="result-grid">
          <div><span>Score</span><strong>${score}</strong></div>
          <div><span>Best</span><strong>${save.best}</strong></div>
          <div><span>XP</span><strong>+${save.xpGain || 0}</strong></div>
          ${result.bestTime != null ? `<div><span>Time</span><strong>${result.bestTime} ms</strong></div>` : ""}
        </div>
        ${
          unlocked.length
            ? `<div class="unlock-list">${unlocked
                .map((a) => `<div class="unlock-item"><strong>${a.title}</strong><span>${a.desc}</span></div>`)
                .join("")}</div>`
            : ""
        }
        <div class="result-actions">
          <button type="button" class="btn btn-primary" id="pg-again">Replay</button>
          <button type="button" class="btn" id="pg-more">All games</button>
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
