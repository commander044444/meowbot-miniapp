/**
 * MeowBot Mini App — Frontend core
 * Bale WebApp + local demo store (API-ready)
 * ⚠️ No secrets. initDataUnsafe is NOT trusted for real auth.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "meowbot_mini_v1";
  const API_BASE = null; // e.g. "https://your-backend.example.com" — set when Backend is ready

  /* ---------- Storage ---------- */
  function defaultState() {
    return {
      coins: 120,
      level: 1,
      xp: 35,
      xpNeed: 100,
      totalMeows: 0,
      gamesPlayed: 0,
      lastDaily: 0,
      inventory: [],
      name: "پیشی‌دوست",
      userId: null,
      username: null,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      return defaultState();
    }
  }

  function saveState(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (_) {}
  }

  let state = loadState();

  /* ---------- Bale WebApp ---------- */
  function getBale() {
    return window.Bale?.WebApp || window.Telegram?.WebApp || null;
  }

  function initBale() {
    const wa = getBale();
    if (!wa) return null;
    try {
      wa.ready();
      if (typeof wa.expand === "function") wa.expand();
      if (wa.setHeaderColor) wa.setHeaderColor("#0d0d1a");
      if (wa.setBackgroundColor) wa.setBackgroundColor("#07070f");
    } catch (_) {}

    // Display-only user info (NOT for auth)
    const u = wa.initDataUnsafe?.user;
    if (u) {
      if (u.first_name) state.name = u.first_name + (u.last_name ? " " + u.last_name : "");
      if (u.id) state.userId = u.id;
      if (u.username) state.username = u.username;
      saveState(state);
    }
    return wa;
  }

  /* ---------- API hooks (future Backend) ---------- */
  async function apiGet(path) {
    if (!API_BASE) return null;
    try {
      const wa = getBale();
      const headers = { Accept: "application/json" };
      // When Backend exists: send initData for server-side validation (never trust client alone)
      if (wa?.initData) headers["X-Bale-Init-Data"] = wa.initData;
      const res = await fetch(API_BASE + path, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function apiPost(path, body) {
    if (!API_BASE) return null;
    try {
      const wa = getBale();
      const headers = { "Content-Type": "application/json", Accept: "application/json" };
      if (wa?.initData) headers["X-Bale-Init-Data"] = wa.initData;
      const res = await fetch(API_BASE + path, {
        method: "POST",
        headers,
        body: JSON.stringify(body || {}),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /* ---------- Economy helpers ---------- */
  function addXp(amount) {
    state.xp += amount;
    let leveled = false;
    while (state.xp >= state.xpNeed) {
      state.xp -= state.xpNeed;
      state.level += 1;
      state.xpNeed = Math.floor(100 * Math.pow(1.35, state.level - 1));
      leveled = true;
      state.coins += 20 * state.level;
    }
    saveState(state);
    return leveled;
  }

  function addCoins(n) {
    state.coins = Math.max(0, state.coins + n);
    saveState(state);
  }

  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    saveState(state);
    return true;
  }

  /* ---------- UI helpers ---------- */
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString("fa-IR");
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function paintCommon() {
    qsa("[data-coins]").forEach((el) => (el.textContent = fmt(state.coins)));
    qsa("[data-level]").forEach((el) => (el.textContent = fmt(state.level)));
    qsa("[data-xp]").forEach((el) => (el.textContent = fmt(state.xp)));
    qsa("[data-xp-need]").forEach((el) => (el.textContent = fmt(state.xpNeed)));
    qsa("[data-name]").forEach((el) => (el.textContent = state.name || "کاربر"));
    qsa("[data-uid]").forEach((el) => (el.textContent = state.userId ? String(state.userId) : "—"));
    qsa("[data-username]").forEach((el) => (el.textContent = state.username ? "@" + state.username : "—"));
    qsa("[data-meows]").forEach((el) => (el.textContent = fmt(state.totalMeows)));
    qsa("[data-games]").forEach((el) => (el.textContent = fmt(state.gamesPlayed)));
    const pct = Math.min(100, Math.round((state.xp / Math.max(1, state.xpNeed)) * 100));
    qsa("[data-xp-bar]").forEach((el) => {
      requestAnimationFrame(() => (el.style.width = pct + "%"));
    });
  }

  /* ---------- Daily reward ---------- */
  function canDaily() {
    const day = 24 * 3600 * 1000;
    return Date.now() - (state.lastDaily || 0) >= day;
  }

  function claimDaily() {
    if (!canDaily()) {
      toast("⏳ جایزه روزانه را قبلاً گرفتی");
      return;
    }
    const reward = 50 + state.level * 10;
    addCoins(reward);
    addXp(15);
    state.lastDaily = Date.now();
    saveState(state);
    paintCommon();
    toast("🎁 +" + reward + " سکه روزانه!");
    updateDailyBtn();
  }

  function updateDailyBtn() {
    const btn = qs("#btn-daily");
    if (!btn) return;
    if (canDaily()) {
      btn.disabled = false;
      btn.textContent = "دریافت";
      btn.classList.remove("btn-ghost");
      btn.classList.add("btn-primary");
    } else {
      btn.disabled = true;
      btn.textContent = "گرفته شد ✓";
      btn.classList.add("btn-ghost");
      btn.classList.remove("btn-primary");
    }
  }

  /* ---------- Shop catalog (UI ready for API) ---------- */
  const SHOP = [
    { id: "food_kibble", emoji: "🥣", name: "خوراک گربه", desc: "۲۰ وعده غذا", price: 40 },
    { id: "food_fish", emoji: "🐟", name: "ماهی تازه", desc: "غذا + رابطه", price: 80 },
    { id: "toy_ball", emoji: "🎾", name: "توپ بازی", desc: "۲۰ بار بازی", price: 50 },
    { id: "toy_laser", emoji: "🔴", name: "لیزر بازی", desc: "سرگرمی قوی", price: 100 },
    { id: "bed_basic", emoji: "🛏", name: "جای خواب", desc: "برای خواباندن پت", price: 90 },
    { id: "gift_flower", emoji: "🎁", name: "هدیه گل", desc: "هدیه به پیشی", price: 60 },
  ];

  function renderShop() {
    const box = qs("#shop-list");
    if (!box) return;
    box.innerHTML = SHOP.map(
      (it, i) => `
      <div class="shop-item" style="animation-delay:${i * 0.05}s">
        <div class="emoji">${it.emoji}</div>
        <div class="meta">
          <h4>${it.name}</h4>
          <p>${it.desc}</p>
        </div>
        <div style="text-align:left">
          <div class="price">${fmt(it.price)} 🪙</div>
          <button class="btn btn-sm btn-primary" style="margin-top:6px" data-buy="${it.id}">خرید</button>
        </div>
      </div>`
    ).join("");
    box.querySelectorAll("[data-buy]").forEach((btn) => {
      btn.addEventListener("click", () => buyItem(btn.getAttribute("data-buy")));
    });
  }

  async function buyItem(id) {
    const it = SHOP.find((x) => x.id === id);
    if (!it) return;
    // Future: const res = await apiPost("/shop/buy", { item_id: id });
    if (!spendCoins(it.price)) {
      toast("سکه کافی نیست 😿");
      return;
    }
    state.inventory.push({ id: it.id, at: Date.now() });
    saveState(state);
    paintCommon();
    toast("✅ " + it.name + " خریداری شد");
  }

  /* ---------- Games ---------- */
  let guessAnswer = null;
  let reactArmed = false;
  let reactStart = 0;

  function setupGames() {
    const gStart = qs("#guess-start");
    if (gStart) {
      gStart.addEventListener("click", () => {
        guessAnswer = 1 + Math.floor(Math.random() * 10);
        const area = qs("#guess-area");
        area.innerHTML =
          '<p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">عدد بین ۱ تا ۱۰ را حدس بزن</p><div class="guess-btns" id="guess-btns"></div>';
        const btns = qs("#guess-btns");
        for (let i = 1; i <= 10; i++) {
          const b = document.createElement("button");
          b.textContent = i;
          b.addEventListener("click", () => onGuess(i));
          btns.appendChild(b);
        }
      });
    }

    const rBtn = qs("#react-btn");
    if (rBtn) {
      rBtn.addEventListener("click", onReact);
    }
  }

  function onGuess(n) {
    if (guessAnswer == null) return;
    state.gamesPlayed += 1;
    if (n === guessAnswer) {
      addCoins(15);
      const up = addXp(8);
      paintCommon();
      toast("🎉 درست بود! +۱۵🪙" + (up ? " · Level Up!" : ""));
      qs("#guess-area").innerHTML = '<p style="color:var(--green)">درست! عدد ' + guessAnswer + " بود ✨</p>";
    } else {
      saveState(state);
      paintCommon();
      toast("نه… دوباره امتحان کن");
    }
    guessAnswer = null;
  }

  function onReact() {
    const btn = qs("#react-btn");
    if (!btn) return;
    if (!reactArmed) {
      btn.className = "react-btn wait";
      btn.textContent = "صبر کن…";
      const delay = 1200 + Math.random() * 2500;
      setTimeout(() => {
        reactArmed = true;
        reactStart = performance.now();
        btn.className = "react-btn ready";
        btn.textContent = "الان بزن! ⚡";
      }, delay);
      return;
    }
    const ms = Math.round(performance.now() - reactStart);
    reactArmed = false;
    btn.className = "react-btn";
    btn.textContent = "شروع واکنش";
    state.gamesPlayed += 1;
    let reward = 5;
    if (ms < 350) reward = 20;
    else if (ms < 500) reward = 12;
    addCoins(reward);
    addXp(5);
    paintCommon();
    toast("⚡ " + ms + "ms · +" + reward + "🪙");
  }

  /* ---------- Leaderboard ---------- */
  const DEMO_LB = [
    { name: "میوکینگ", level: 18, coins: 9200 },
    { name: "پیشی‌طلایی", level: 15, coins: 7100 },
    { name: "نایت‌کت", level: 12, coins: 5400 },
    { name: "سفیدبرفی", level: 11, coins: 4800 },
    { name: "سموری", level: 9, coins: 3200 },
    { name: "کامیل", level: 8, coins: 2900 },
    { name: "لونا", level: 7, coins: 2100 },
    { name: "موچی", level: 6, coins: 1800 },
  ];

  async function renderLeaderboard() {
    const box = qs("#lb-list");
    if (!box) return;
    // Future: const data = await apiGet("/leaderboard?limit=20");
    let rows = DEMO_LB.slice();
    rows.push({
      name: state.name || "تو",
      level: state.level,
      coins: state.coins,
      me: true,
    });
    rows.sort((a, b) => b.coins - a.coins || b.level - a.level);
    box.innerHTML = rows
      .slice(0, 12)
      .map((r, i) => {
        const cls = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
        const me = r.me ? " · تو" : "";
        return `<div class="lb-row ${cls}" style="animation-delay:${i * 0.04}s">
        <div class="rank">${i + 1}</div>
        <div class="lb-info"><div class="n">${r.name}${me}</div><div class="s">Lv ${fmt(r.level)}</div></div>
        <div class="lb-coins">${fmt(r.coins)} 🪙</div>
      </div>`;
      })
      .join("");
  }

  /* ---------- Boot ---------- */
  function boot() {
    initBale();
    paintCommon();
    updateDailyBtn();
    const daily = qs("#btn-daily");
    if (daily) daily.addEventListener("click", claimDaily);
    renderShop();
    setupGames();
    renderLeaderboard();

    // soft page enter
    document.body.style.opacity = "0";
    requestAnimationFrame(() => {
      document.body.style.transition = "opacity .4s ease";
      document.body.style.opacity = "1";
    });
  }

  window.MeowApp = {
    state,
    paintCommon,
    toast,
    apiGet,
    apiPost,
    addCoins,
    spendCoins,
    addXp,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
