/**
 * Meow Playground — Achievements
 */
(function (w) {
  const DEFS = [
    { id: "first_meow", title: "🐾 First Meow", desc: "اولین بازی را انجام دادی" },
    { id: "gamer", title: "🎮 Gamer", desc: "۱۰ بازی انجام دادی" },
    { id: "addicted", title: "🔥 Addicted", desc: "۵۰ بازی انجام دادی" },
    { id: "speed_demon", title: "⚡ Speed Demon", desc: "واکنش زیر ۲۵۰ms" },
    { id: "brain_master", title: "🧠 Brain Master", desc: "۵ بازی فکری بازی کردی" },
    { id: "true_meower", title: "🐱 True Meower", desc: "۳ بازی Meow تجربه کردی" },
    { id: "record_breaker", title: "🏆 Record Breaker", desc: "یک رکورد شخصی جدید زدی" },
    { id: "perfect", title: "🎯 Perfect", desc: "یک بازی بدون خطا" },
    { id: "explorer", title: "🌟 Explorer", desc: "همه دسته‌ها را امتحان کردی" },
    { id: "snake_master", title: "🐍 Snake Master", desc: "Snake بالای ۳۰ امتیاز" },
    { id: "clicker_king", title: "👑 Clicker King", desc: "Meow Clicker بالای ۲۰۰" },
  ];

  function checkAfterGame(gameMeta, result, saveMeta) {
    const unlocked = [];
    const st = MeowStorage.getStats();
    const scores = MeowStorage.getScores();
    const ach = MeowStorage.getAchievements();

    function tryUnlock(id) {
      if (ach[id]) return;
      if (MeowStorage.unlockAchievement(id)) unlocked.push(DEFS.find((d) => d.id === id));
    }

    if (st.gamesPlayed >= 1) tryUnlock("first_meow");
    if (st.gamesPlayed >= 10) tryUnlock("gamer");
    if (st.gamesPlayed >= 50) tryUnlock("addicted");
    if (result.bestTime != null && result.bestTime <= 250) tryUnlock("speed_demon");
    if (saveMeta && saveMeta.isNewRecord) tryUnlock("record_breaker");
    if (result.perfect) tryUnlock("perfect");

    const brainIds = ["memory_cards", "number_memory", "pattern_memory", "simon", "math_rush", "number_guess", "mini_sudoku", "minesweeper", "word_guess", "sequence"];
    const meowIds = ["meow_clicker", "catch_cat", "feed_cat", "cat_jump", "cat_runner", "cat_dodge", "find_meow", "meow_memory", "cat_mouse", "meow_catch"];
    let brain = 0, meow = 0;
    brainIds.forEach((id) => { if ((scores[id] || {}).plays) brain++; });
    meowIds.forEach((id) => { if ((scores[id] || {}).plays) meow++; });
    if (brain >= 5) tryUnlock("brain_master");
    if (meow >= 3) tryUnlock("true_meower");

    const cats = st.categoriesPlayed || {};
    const need = ["popular", "speed", "brain", "fun", "meow", "arcade", "random"];
    if (need.every((c) => cats[c])) tryUnlock("explorer");

    if (gameMeta.id === "snake" && (result.score || 0) >= 30) tryUnlock("snake_master");
    if (gameMeta.id === "meow_clicker" && (result.score || 0) >= 200) tryUnlock("clicker_king");

    return unlocked.filter(Boolean);
  }

  w.MeowAchievements = { DEFS, checkAfterGame };
})(window);
