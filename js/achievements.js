(function (w) {
  const DEFS = [
    { id: "first_meow", title_fa: "اولین بازی", title_en: "First Game", desc_fa: "اولین بازیت را تمام کن", desc_en: "Complete your first game", hidden: false },
    { id: "getting_started", title_fa: "شروع مسیر", title_en: "Getting Started", desc_fa: "۵ بازی انجام بده", desc_en: "Play 5 games", hidden: false },
    { id: "gamer", title_fa: "گیمر", title_en: "Gamer", desc_fa: "۱۰ بازی انجام بده", desc_en: "Play 10 games", hidden: false },
    { id: "dedicated", title_fa: "پای‌کار", title_en: "Dedicated", desc_fa: "۲۵ بازی انجام بده", desc_en: "Play 25 games", hidden: false },
    { id: "addicted", title_fa: "معتاد بازی", title_en: "Addicted", desc_fa: "۵۰ بازی انجام بده", desc_en: "Play 50 games", hidden: false },
    { id: "high_score", title_fa: "امتیاز بالا", title_en: "High Score", desc_fa: "یک رکورد شخصی بزن", desc_en: "Break a personal record", hidden: false },
    { id: "record_breaker", title_fa: "رکوردشکن", title_en: "Record Breaker", desc_fa: "چند رکورد شخصی بزن", desc_en: "Break personal records", hidden: false },
    { id: "explorer", title_fa: "کاشف", title_en: "Explorer", desc_fa: "۱۲ بازی مختلف امتحان کن", desc_en: "Try 12 different games", hidden: false },
    { id: "category_tourist", title_fa: "گردشگر دسته‌ها", title_en: "Category Tourist", desc_fa: "همه دسته‌ها را بازی کن", desc_en: "Play every category", hidden: false },
    { id: "speed_demon", title_fa: "سرعتی", title_en: "Speed Demon", desc_fa: "واکنش زیر ۲۵۰ میلی‌ثانیه", desc_en: "Reaction under 250ms", hidden: false },
    { id: "brain_master", title_fa: "استاد فکر", title_en: "Brain Master", desc_fa: "۵ بازی فکری بازی کن", desc_en: "Play 5 brain games", hidden: false },
    { id: "true_meower", title_fa: "میو واقعی", title_en: "True Meower", desc_fa: "۳ بازی میو بازی کن", desc_en: "Play 3 Meow games", hidden: false },
    { id: "perfect", title_fa: "بدون اشتباه", title_en: "Perfect Run", desc_fa: "یک بازی را بدون خطا تمام کن", desc_en: "Finish a game without mistakes", hidden: false },
    { id: "snake_master", title_fa: "استاد مار", title_en: "Snake Master", desc_fa: "در Snake امتیاز ۳۰ یا بیشتر", desc_en: "Score 30+ in Snake", hidden: false },
    { id: "clicker_king", title_fa: "پادشاه کلیک", title_en: "Clicker King", desc_fa: "Meow Clicker بالای ۲۰۰", desc_en: "Meow Clicker 200+", hidden: false },
    { id: "level_5", title_fa: "در حال رشد", title_en: "Rising", desc_fa: "به سطح ۵ برس", desc_en: "Reach level 5", hidden: false },
    { id: "level_10", title_fa: "استاد", title_en: "Master", desc_fa: "به سطح ۱۰ برس", desc_en: "Reach level 10", hidden: false },
    { id: "daily_done", title_fa: "چالش روزانه", title_en: "Daily Done", desc_fa: "یک چالش روزانه را کامل کن", desc_en: "Complete a daily challenge", hidden: false },
    { id: "shopper", title_fa: "جمع‌کننده", title_en: "Collector", desc_fa: "یک آیتم از فروشگاه باز کن", desc_en: "Unlock a shop item", hidden: false },
    { id: "night_owl", title_fa: "شب‌زنده‌دار", title_en: "Night Owl", desc_fa: "بین ۰ تا ۵ صبح بازی کن", desc_en: "Play between 00:00–05:00", hidden: true },
    { id: "konami", title_fa: "کد مخفی", title_en: "Secret Sequence", desc_fa: "کد مخفی را پیدا کن", desc_en: "Discover the hidden code", hidden: true },
    { id: "triple_meow", title_fa: "سه میو", title_en: "Triple Meow", desc_fa: "پروفایل را سه بار در یک نشست باز کن", desc_en: "Open profile three times in a session", hidden: true },
  ];

  function localized(def) {
    const lang = (w.MeowI18n && MeowI18n.getLang()) || "fa";
    return {
      ...def,
      title: lang === "en" ? def.title_en : def.title_fa,
      desc: lang === "en" ? def.desc_en : def.desc_fa,
    };
  }

  function allLocalized() {
    return DEFS.map(localized);
  }

  function checkAfterGame(gameMeta, result, saveMeta) {
    const unlocked = [];
    const p = MeowStorage.getProgress();
    const scores = MeowStorage.getGames();
    const ach = MeowStorage.getAchievements();

    function tryUnlock(id) {
      if (ach[id]) return;
      if (MeowStorage.unlockAchievement(id)) {
        const def = DEFS.find((d) => d.id === id);
        if (def) unlocked.push(localized(def));
        MeowStorage.addXp(20);
      }
    }

    if (p.totalGames >= 1) tryUnlock("first_meow");
    if (p.totalGames >= 5) tryUnlock("getting_started");
    if (p.totalGames >= 10) tryUnlock("gamer");
    if (p.totalGames >= 25) tryUnlock("dedicated");
    if (p.totalGames >= 50) tryUnlock("addicted");
    if (saveMeta && saveMeta.isNewRecord) {
      tryUnlock("high_score");
      tryUnlock("record_breaker");
    }
    if (result.bestTime != null && result.bestTime <= 250) tryUnlock("speed_demon");
    if (result.perfect) tryUnlock("perfect");
    if (p.level >= 5) tryUnlock("level_5");
    if (p.level >= 10) tryUnlock("level_10");

    const distinct = Object.keys(scores).filter((k) => (scores[k] || {}).plays > 0).length;
    if (distinct >= 12) tryUnlock("explorer");

    const brainIds = ["memory_cards", "number_memory", "pattern_memory", "simon", "math_rush", "number_guess", "mini_sudoku", "minesweeper", "word_guess", "sequence"];
    const meowIds = ["meow_clicker", "catch_cat", "feed_cat", "cat_jump", "cat_runner", "cat_dodge", "find_meow", "meow_memory", "cat_mouse", "meow_catch"];
    let brain = 0, meow = 0;
    brainIds.forEach((id) => { if ((scores[id] || {}).plays) brain++; });
    meowIds.forEach((id) => { if ((scores[id] || {}).plays) meow++; });
    if (brain >= 5) tryUnlock("brain_master");
    if (meow >= 3) tryUnlock("true_meower");

    const cats = p.categoriesPlayed || {};
    const need = ["speed", "brain", "meow", "arcade", "random"];
    if (need.every((c) => cats[c])) tryUnlock("category_tourist");

    if (gameMeta.id === "snake" && (result.score || 0) >= 30) tryUnlock("snake_master");
    if (gameMeta.id === "meow_clicker" && (result.score || 0) >= 200) tryUnlock("clicker_king");

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) tryUnlock("night_owl");

    return unlocked.filter(Boolean);
  }

  w.MeowAchievements = { DEFS, localized, allLocalized, checkAfterGame };
})(window);
