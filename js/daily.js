(function (w) {
  const POOL = [
    { game: "reaction", goal: "time", value: 400, label_fa: "واکنش زیر ۴۰۰ میلی‌ثانیه", label_en: "Reaction under 400ms" },
    { game: "tap_rush", goal: "score", value: 40, label_fa: "امتیاز Tap Rush بالای ۴۰", label_en: "Tap Rush score 40+" },
    { game: "memory_cards", goal: "play", value: 1, label_fa: "یک دور Memory Cards تمام کن", label_en: "Finish Memory Cards" },
    { game: "meow_clicker", goal: "score", value: 80, label_fa: "Meow Clicker بالای ۸۰", label_en: "Meow Clicker 80+" },
    { game: "snake", goal: "score", value: 20, label_fa: "امتیاز Snake بالای ۲۰", label_en: "Snake score 20+" },
    { game: "falling", goal: "score", value: 50, label_fa: "Catch Apples بالای ۵۰", label_en: "Catch Apples 50+" },
    { game: "math_rush", goal: "score", value: 40, label_fa: "Math Rush بالای ۴۰", label_en: "Math Rush 40+" },
    { game: "breakout", goal: "score", value: 30, label_fa: "Breakout بالای ۳۰", label_en: "Breakout 30+" },
  ];

  function dayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function pickForDay(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return POOL[h % POOL.length];
  }

  function labelOf(ch) {
    const lang = (w.MeowI18n && MeowI18n.getLang()) || "fa";
    if (ch.label_fa && lang === "fa") return ch.label_fa;
    if (ch.label_en) return ch.label_en;
    return ch.label || "";
  }

  function getChallenge() {
    const key = dayKey();
    let data = MeowStorage.getDaily() || {};
    if (data.date !== key) {
      const ch = pickForDay(key);
      data = {
        date: key,
        game: ch.game,
        goal: ch.goal,
        value: ch.value,
        label_fa: ch.label_fa,
        label_en: ch.label_en,
        progress: 0,
        done: false,
      };
      MeowStorage.setDaily(data);
    }
    // live label for UI
    data.label = labelOf(data);
    return data;
  }

  function reportGame(gameId, result) {
    const ch = getChallenge();
    if (ch.done || ch.game !== gameId) return { updated: false, challenge: ch };
    let progress = ch.progress || 0;
    let done = false;
    if (ch.goal === "play") {
      progress = 1;
      done = true;
    } else if (ch.goal === "score") {
      progress = Math.max(progress, result.score || 0);
      done = progress >= ch.value;
    } else if (ch.goal === "time") {
      if (result.bestTime != null && result.bestTime <= ch.value) {
        progress = result.bestTime;
        done = true;
      }
    }
    ch.progress = progress;
    if (done && !ch.done) {
      ch.done = true;
      MeowStorage.addXp(35);
      const shop = MeowStorage.getShop();
      shop.currency = (shop.currency || 0) + 15;
      MeowStorage.setShop(shop);
      MeowStorage.unlockAchievement("daily_done");
    }
    MeowStorage.setDaily(ch);
    ch.label = labelOf(ch);
    return { updated: true, challenge: ch, justCompleted: done && ch.done };
  }

  w.MeowDaily = { getChallenge, reportGame, dayKey };
})(window);
