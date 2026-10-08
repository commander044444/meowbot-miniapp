/**
 * Meow Playground — Hub, navigation, result screens
 */
(function () {
  "use strict";

  const CATS = [
    { id: "all", label: "همه", icon: "✨" },
    { id: "popular", label: "محبوب", icon: "🔥" },
    { id: "speed", label: "سرعت", icon: "⚡" },
    { id: "brain", label: "فکری", icon: "🧠" },
    { id: "meow", label: "Meow", icon: "🐱" },
    { id: "arcade", label: "Arcade", icon: "🕹️" },
    { id: "random", label: "تصادفی", icon: "🎲" },
    { id: "fun", label: "سرگرمی", icon: "🎯" },
  ];

  // map fun -> random games too
  function gamesInCat(cat) {
    const list = window.MeowGames ? MeowGames.catalog : [];
    if (cat === "all") return list;
    if (cat === "popular") return list.filter((g) => g.popular);
    if (cat === "fun") return list.filter((g) => g.cat === "random" || g.cat === "meow");
    return list.filter((g) => g.cat === cat);
  }

  let currentCat = "all";
  let activeGame = null;
  let gameRunning = false;

  const resultMessages = {
    high: ["اوووه رکورد زدی! 🔥", "پیشی بهت افتخار می‌کنه 😼", "این یکی عالی بود!"],
    mid: ["بد نبود! 👀", "دوباره؟ این بار بهتر می‌تونی!", "داری راه می‌افتی 🐱"],
    low: ["اشکال نداره، تمرین کن 😼", "حوصله‌ت هنوز سر نرفته؟", "یه بار دیگه امتحان کن!"],
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function openPlayground() {
    const overlay = $("#pg-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    showHub();
  }

  function closePlayground() {
    if (gameRunning) {
      if (!confirm("بازی نیمه‌کاره است. خارج می‌شی؟")) return;
    }
    gameRunning = false;
    activeGame = null;
    const overlay = $("#pg-overlay");
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function showHub() {
    gameRunning = false;
    activeGame = null;
    const view = $("#pg-view");
    if (!view) return;
    const stats = MeowStorage.getStats();
    const scores = MeowStorage.getScores();
    view.innerHTML = `
      <div class="pg-hub">
        <div class="pg-hub-head">
          <div>
            <h2>MEOW PLAYGROUND</h2>
            <p>یک بازی انتخاب کن و شروع کن 😼</p>
          </div>
          <div class="pg-hub-actions">
            <button type="button" class="pg-icon-btn" id="pg-mute" title="صدا">${MeowStorage.getSettings().muted ? "🔇" : "🔊"}</button>
            <button type="button" class="pg-icon-btn" id="pg-stats-btn" title="آمار">📊</button>
            <button type="button" class="pg-icon-btn" id="pg-close" title="بستن">✕</button>
          </div>
        </div>
        <div class="pg-cats" id="pg-cats"></div>
        <div class="pg-grid" id="pg-grid"></div>
      </div>`;
    $("#pg-close").onclick = closePlayground;
    $("#pg-stats-btn").onclick = showStats;
    $("#pg-mute").onclick = () => {
      const s = MeowStorage.getSettings();
      s.muted = !s.muted;
      MeowStorage.setSettings(s);
      $("#pg-mute").textContent = s.muted ? "🔇" : "🔊";
    };
    renderCats();
    renderGrid(scores);
  }

  function renderCats() {
    const box = $("#pg-cats");
    box.innerHTML = CATS.map(
      (c) =>
        `<button type="button" class="pg-cat ${c.id === currentCat ? "active" : ""}" data-cat="${c.id}">${c.icon} ${c.label}</button>`
    ).join("");
    box.querySelectorAll(".pg-cat").forEach((b) => {
      b.onclick = () => {
        currentCat = b.dataset.cat;
        renderCats();
        renderGrid(MeowStorage.getScores());
      };
    });
  }

  function renderGrid(scores) {
    const grid = $("#pg-grid");
    const list = gamesInCat(currentCat);
    if (!list.length) {
      grid.innerHTML = '<p class="pg-empty">بازی‌ای در این دسته نیست</p>';
      return;
    }
    grid.innerHTML = list
      .map((g) => {
        const sc = scores[g.id] || {};
        const best =
          sc.bestTime != null
            ? `Best: ${sc.bestTime}ms`
            : sc.best
              ? `Best: ${sc.best}`
              : "هنوز بازی نشده";
        return `<button type="button" class="pg-card" data-id="${g.id}">
          <div class="pg-card-ico">${g.icon}</div>
          <div class="pg-card-body">
            <strong>${g.name}</strong>
            <span>${g.desc}</span>
            <em>${best}</em>
          </div>
          <span class="pg-play-tag">PLAY</span>
        </button>`;
      })
      .join("");
    grid.querySelectorAll(".pg-card").forEach((card) => {
      card.onclick = () => startGame(card.dataset.id);
    });
  }

  function startGame(id) {
    const g = MeowGames.registry[id];
    if (!g) return;
    activeGame = g;
    gameRunning = true;
    const view = $("#pg-view");
    view.innerHTML = `
      <div class="pg-game">
        <div class="pg-game-bar">
          <button type="button" class="pg-icon-btn" id="pg-back">←</button>
          <div class="pg-game-title">${g.icon} ${g.name}</div>
          <button type="button" class="pg-icon-btn" id="pg-close2">✕</button>
        </div>
        <div class="pg-game-root" id="pg-game-root"></div>
      </div>`;
    $("#pg-back").onclick = () => {
      if (gameRunning && !confirm("بازی نیمه‌کاره است. برگردی؟")) return;
      showHub();
    };
    $("#pg-close2").onclick = closePlayground;
    const root = $("#pg-game-root");
    const api = {
      end(result) {
        gameRunning = false;
        finishGame(g, result || {});
      },
      toast(msg) {
        const t = document.createElement("div");
        t.className = "pg-toast";
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
      api.toast("خطا در بازی");
      showHub();
    }
  }

  function finishGame(g, result) {
    const save = MeowStorage.saveGameResult(g.id, {
      score: result.score || 0,
      bestTime: result.bestTime,
      category: g.cat === "random" ? "random" : g.cat,
    });
    // mark popular category if popular game
    if (g.popular) {
      const st = MeowStorage.getStats();
      st.categoriesPlayed = st.categoriesPlayed || {};
      st.categoriesPlayed.popular = true;
      st.categoriesPlayed.fun = true;
      MeowStorage.setStats(st);
    }
    const st2 = MeowStorage.getStats();
    st2.categoriesPlayed = st2.categoriesPlayed || {};
    st2.categoriesPlayed[g.cat] = true;
    MeowStorage.setStats(st2);

    const unlocked = MeowAchievements.checkAfterGame(g, result, save);
    const score = result.score || 0;
    const pool =
      save.isNewRecord || score > 80
        ? resultMessages.high
        : score > 30
          ? resultMessages.mid
          : resultMessages.low;
    const msg = pool[Math.floor(Math.random() * pool.length)];

    const view = $("#pg-view");
    view.innerHTML = `
      <div class="pg-result">
        <p class="pg-result-msg">${msg}</p>
        ${save.isNewRecord ? '<div class="pg-new-record">🏆 NEW RECORD!</div>' : ""}
        <h2>GAME OVER</h2>
        <div class="pg-result-stats">
          <div><span>Score</span><strong>${score}</strong></div>
          <div><span>Best</span><strong>${save.best}</strong></div>
          ${result.bestTime != null ? `<div><span>Time</span><strong>${result.bestTime}ms</strong></div>` : ""}
          ${result.label ? `<div><span>نتیجه</span><strong>${result.label}</strong></div>` : ""}
        </div>
        ${
          unlocked.length
            ? `<div class="pg-unlocks">${unlocked
                .map((a) => `<div class="pg-ach-unlock">${a.title}<small>${a.desc}</small></div>`)
                .join("")}</div>`
            : ""
        }
        <div class="pg-result-actions">
          <button type="button" class="pg-btn pg-btn-primary" id="pg-again">🔄 Play Again</button>
          <button type="button" class="pg-btn" id="pg-more">🎮 More Games</button>
        </div>
      </div>`;
    $("#pg-again").onclick = () => startGame(g.id);
    $("#pg-more").onclick = showHub;
  }

  function showStats() {
    const st = MeowStorage.getStats();
    const ach = MeowStorage.getAchievements();
    const scores = MeowStorage.getScores();
    const favName = st.favoriteGame
      ? (MeowGames.registry[st.favoriteGame] || {}).name || st.favoriteGame
      : "—";
    const view = $("#pg-view");
    view.innerHTML = `
      <div class="pg-stats-panel">
        <div class="pg-game-bar">
          <button type="button" class="pg-icon-btn" id="pg-back-s">←</button>
          <div class="pg-game-title">📊 MEOW ARCADE</div>
          <span></span>
        </div>
        <div class="pg-stats-grid">
          <div class="pg-stat"><span>بازی‌ها</span><strong>${st.gamesPlayed || 0}</strong></div>
          <div class="pg-stat"><span>مجموع امتیاز</span><strong>${st.totalScore || 0}</strong></div>
          <div class="pg-stat"><span>بهترین امتیاز</span><strong>${st.bestScore || 0}</strong></div>
          <div class="pg-stat"><span>بهترین واکنش</span><strong>${st.bestReaction != null ? st.bestReaction + "ms" : "—"}</strong></div>
          <div class="pg-stat"><span>بازی محبوب</span><strong>${favName}</strong></div>
          <div class="pg-stat"><span>دستاوردها</span><strong>${Object.keys(ach).length}/${MeowAchievements.DEFS.length}</strong></div>
        </div>
        <h3 class="pg-sub">Achievements</h3>
        <div class="pg-ach-list">
          ${MeowAchievements.DEFS.map(
            (d) =>
              `<div class="pg-ach ${ach[d.id] ? "on" : ""}">${d.title}<small>${d.desc}</small></div>`
          ).join("")}
        </div>
      </div>`;
    $("#pg-back-s").onclick = showHub;
  }

  function init() {
    document.querySelectorAll("[data-open-playground]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openPlayground();
      });
    });
    // count for display
    const countEl = document.querySelector("[data-game-count]");
    if (countEl && window.MeowGames) {
      countEl.textContent = String(MeowGames.catalog.length);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MeowPlayground = { open: openPlayground, close: closePlayground };
})();
