/**
 * Versioned localStorage — migrates v1 playground keys
 */
(function (w) {
  const VER = 2;
  const KEYS = {
    meta: "meowbot_meta",
    user: "meowbot_user",
    progress: "meowbot_progress",
    games: "meowbot_games",
    achievements: "meowbot_achievements",
    settings: "meowbot_settings",
    shop: "meowbot_shop",
    daily: "meowbot_daily",
  };
  // legacy v1
  const LEGACY = {
    stats: "meow_playground_stats",
    scores: "meow_game_scores",
    ach: "meow_achievements",
    settings: "meow_settings",
  };

  function read(k, fb) {
    try {
      const r = localStorage.getItem(k);
      if (!r) return typeof fb === "function" ? fb() : fb;
      return JSON.parse(r);
    } catch {
      return typeof fb === "function" ? fb() : fb;
    }
  }
  function write(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {}
  }

  function defaultUser() {
    return {
      name: "Player",
      bio: "",
      avatar: "m",
      createdAt: Date.now(),
    };
  }
  function defaultProgress() {
    return {
      level: 1,
      xp: 0,
      xpNeed: 100,
      totalGames: 0,
      totalScore: 0,
      bestScore: 0,
      bestReaction: null,
      playTimeMs: 0,
      favoriteGame: null,
      favCounts: {},
      categoriesPlayed: {},
      lastPlayAt: 0,
    };
  }
  function defaultShop() {
    return { currency: 0, owned: ["theme_midnight"], equipped: { theme: "theme_midnight", frame: null, badge: null } };
  }
  function defaultSettings() {
    return { muted: true, reducedMotion: false, theme: "midnight" };
  }

  function migrate() {
    const meta = read(KEYS.meta, { version: 0 });
    if (meta.version >= VER) return;

    // from v1 playground
    const oldScores = read(LEGACY.scores, {});
    const oldStats = read(LEGACY.stats, null);
    const oldAch = read(LEGACY.ach, {});
    const oldSet = read(LEGACY.settings, null);

    if (!read(KEYS.games, null) && oldScores && Object.keys(oldScores).length) {
      write(KEYS.games, oldScores);
    }
    if (!read(KEYS.progress, null) && oldStats) {
      const p = defaultProgress();
      p.totalGames = oldStats.gamesPlayed || 0;
      p.totalScore = oldStats.totalScore || 0;
      p.bestScore = oldStats.bestScore || 0;
      p.bestReaction = oldStats.bestReaction;
      p.favoriteGame = oldStats.favoriteGame;
      p.favCounts = oldStats.favCounts || {};
      p.categoriesPlayed = oldStats.categoriesPlayed || {};
      // rough XP from past activity
      p.xp = Math.min(99, (p.totalGames || 0) * 8);
      while (p.xp >= p.xpNeed && p.level < 99) {
        p.xp -= p.xpNeed;
        p.level++;
        p.xpNeed = Math.floor(100 * Math.pow(1.28, p.level - 1));
      }
      write(KEYS.progress, p);
    }
    if (!read(KEYS.achievements, null) && oldAch) {
      write(KEYS.achievements, oldAch);
    }
    if (!read(KEYS.settings, null) && oldSet) {
      write(KEYS.settings, { ...defaultSettings(), ...oldSet });
    }

    // ensure defaults exist
    if (!read(KEYS.user, null)) write(KEYS.user, defaultUser());
    if (!read(KEYS.progress, null)) write(KEYS.progress, defaultProgress());
    if (!read(KEYS.games, null)) write(KEYS.games, {});
    if (!read(KEYS.achievements, null)) write(KEYS.achievements, {});
    if (!read(KEYS.settings, null)) write(KEYS.settings, defaultSettings());
    if (!read(KEYS.shop, null)) write(KEYS.shop, defaultShop());
    if (!read(KEYS.daily, null)) write(KEYS.daily, {});

    write(KEYS.meta, { version: VER, migratedAt: Date.now() });
  }

  migrate();

  const Store = {
    KEYS,
    getUser() {
      return { ...defaultUser(), ...read(KEYS.user, defaultUser()) };
    },
    setUser(u) {
      write(KEYS.user, u);
    },
    getProgress() {
      return { ...defaultProgress(), ...read(KEYS.progress, defaultProgress()) };
    },
    setProgress(p) {
      write(KEYS.progress, p);
    },
    getGames() {
      return read(KEYS.games, {});
    },
    setGames(g) {
      write(KEYS.games, g);
    },
    getGameScore(id) {
      const all = this.getGames();
      return all[id] || { best: 0, bestTime: null, plays: 0, last: 0 };
    },
    getAchievements() {
      return read(KEYS.achievements, {});
    },
    setAchievements(a) {
      write(KEYS.achievements, a);
    },
    unlockAchievement(id) {
      const a = this.getAchievements();
      if (a[id]) return false;
      a[id] = { at: Date.now() };
      this.setAchievements(a);
      return true;
    },
    getSettings() {
      return { ...defaultSettings(), ...read(KEYS.settings, defaultSettings()) };
    },
    setSettings(s) {
      write(KEYS.settings, s);
    },
    getShop() {
      return { ...defaultShop(), ...read(KEYS.shop, defaultShop()) };
    },
    setShop(s) {
      write(KEYS.shop, s);
    },
    getDaily() {
      return read(KEYS.daily, {});
    },
    setDaily(d) {
      write(KEYS.daily, d);
    },

    /** XP gain + level up. Returns { leveled, progress } */
    addXp(amount) {
      const p = this.getProgress();
      p.xp += Math.max(0, amount | 0);
      let leveled = false;
      while (p.xp >= p.xpNeed && p.level < 99) {
        p.xp -= p.xpNeed;
        p.level++;
        p.xpNeed = Math.floor(100 * Math.pow(1.28, p.level - 1));
        leveled = true;
      }
      this.setProgress(p);
      return { leveled, progress: p };
    },

    saveGameResult(id, payload) {
      const all = this.getGames();
      const cur = all[id] || { best: 0, bestTime: null, plays: 0, last: 0 };
      const score = Number(payload.score) || 0;
      const isNew = score > (cur.best || 0);
      if (isNew) cur.best = score;
      if (payload.bestTime != null) {
        const t = Number(payload.bestTime);
        if (cur.bestTime == null || t < cur.bestTime) cur.bestTime = t;
      }
      cur.plays = (cur.plays || 0) + 1;
      cur.last = score;
      cur.lastAt = Date.now();
      all[id] = cur;
      this.setGames(all);

      const p = this.getProgress();
      p.totalGames = (p.totalGames || 0) + 1;
      p.totalScore = (p.totalScore || 0) + score;
      if (score > (p.bestScore || 0)) p.bestScore = score;
      if (payload.bestTime != null) {
        const t = Number(payload.bestTime);
        if (p.bestReaction == null || t < p.bestReaction) p.bestReaction = t;
      }
      p.favCounts = p.favCounts || {};
      p.favCounts[id] = (p.favCounts[id] || 0) + 1;
      let fav = null,
        max = 0;
      Object.keys(p.favCounts).forEach((k) => {
        if (p.favCounts[k] > max) {
          max = p.favCounts[k];
          fav = k;
        }
      });
      p.favoriteGame = fav;
      if (payload.category) {
        p.categoriesPlayed = p.categoriesPlayed || {};
        p.categoriesPlayed[payload.category] = true;
      }
      if (payload.playTimeMs) p.playTimeMs = (p.playTimeMs || 0) + payload.playTimeMs;
      p.lastPlayAt = Date.now();
      this.setProgress(p);

      // XP: base + record bonus
      let xpGain = 8 + Math.min(25, Math.floor(score / 40));
      if (isNew) xpGain += 15;
      if (payload.perfect) xpGain += 12;
      const xp = this.addXp(xpGain);

      // shop currency
      const shop = this.getShop();
      shop.currency = (shop.currency || 0) + Math.max(1, Math.floor(xpGain / 3));
      this.setShop(shop);

      return { isNewRecord: isNew, best: cur.best, progress: xp.progress, xpGain, leveled: xp.leveled };
    },

    // Compatibility aliases for playground.js
    getStats() {
      const p = this.getProgress();
      return {
        gamesPlayed: p.totalGames,
        totalScore: p.totalScore,
        bestScore: p.bestScore,
        bestReaction: p.bestReaction,
        favoriteGame: p.favoriteGame,
        favCounts: p.favCounts,
        categoriesPlayed: p.categoriesPlayed,
      };
    },
    setStats() {},
    getScores() {
      return this.getGames();
    },
  };

  w.MeowStorage = Store;
})(window);
