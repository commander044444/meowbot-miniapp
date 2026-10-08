/**
 * Meow Playground — LocalStorage
 */
(function (w) {
  const KEYS = {
    stats: "meow_playground_stats",
    scores: "meow_game_scores",
    achievements: "meow_achievements",
    settings: "meow_settings",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  const Storage = {
    getStats() {
      return read(KEYS.stats, {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        bestReaction: null,
        favoriteGame: null,
        favCounts: {},
        categoriesPlayed: {},
      });
    },
    setStats(s) {
      write(KEYS.stats, s);
    },
    getScores() {
      return read(KEYS.scores, {});
    },
    setScores(s) {
      write(KEYS.scores, s);
    },
    getGameScore(id) {
      const all = this.getScores();
      return all[id] || { best: 0, bestTime: null, plays: 0, last: 0 };
    },
    saveGameResult(id, payload) {
      const all = this.getScores();
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
      all[id] = cur;
      this.setScores(all);

      const st = this.getStats();
      st.gamesPlayed = (st.gamesPlayed || 0) + 1;
      st.totalScore = (st.totalScore || 0) + score;
      if (score > (st.bestScore || 0)) st.bestScore = score;
      if (payload.bestTime != null) {
        const t = Number(payload.bestTime);
        if (st.bestReaction == null || t < st.bestReaction) st.bestReaction = t;
      }
      st.favCounts = st.favCounts || {};
      st.favCounts[id] = (st.favCounts[id] || 0) + 1;
      let fav = null, max = 0;
      Object.keys(st.favCounts).forEach((k) => {
        if (st.favCounts[k] > max) {
          max = st.favCounts[k];
          fav = k;
        }
      });
      st.favoriteGame = fav;
      if (payload.category) {
        st.categoriesPlayed = st.categoriesPlayed || {};
        st.categoriesPlayed[payload.category] = true;
      }
      this.setStats(st);
      return { isNewRecord: isNew, best: cur.best, stats: st };
    },
    getAchievements() {
      return read(KEYS.achievements, {});
    },
    unlockAchievement(id) {
      const a = this.getAchievements();
      if (a[id]) return false;
      a[id] = { at: Date.now() };
      write(KEYS.achievements, a);
      return true;
    },
    getSettings() {
      return read(KEYS.settings, { muted: true });
    },
    setSettings(s) {
      write(KEYS.settings, s);
    },
  };

  w.MeowStorage = Storage;
})(window);
