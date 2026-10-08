(function (w) {
  const DEFS = [
    { id: "first_meow", title: "First Game", desc: "Complete your first game", hidden: false },
    { id: "getting_started", title: "Getting Started", desc: "Play 5 games", hidden: false },
    { id: "gamer", title: "Gamer", desc: "Play 10 games", hidden: false },
    { id: "dedicated", title: "Dedicated", desc: "Play 25 games", hidden: false },
    { id: "addicted", title: "Addicted", desc: "Play 50 games", hidden: false },
    { id: "high_score", title: "High Score", desc: "Break a personal record", hidden: false },
    { id: "record_breaker", title: "Record Breaker", desc: "Break 5 personal records", hidden: false },
    { id: "explorer", title: "Explorer", desc: "Try 12 different games", hidden: false },
    { id: "category_tourist", title: "Category Tourist", desc: "Play every category", hidden: false },
    { id: "speed_demon", title: "Speed Demon", desc: "Reaction under 250ms", hidden: false },
    { id: "brain_master", title: "Brain Master", desc: "Play 5 brain games", hidden: false },
    { id: "true_meower", title: "True Meower", desc: "Play 3 Meow games", hidden: false },
    { id: "perfect", title: "Perfect Run", desc: "Finish a game without mistakes", hidden: false },
    { id: "snake_master", title: "Snake Master", desc: "Score 30+ in Snake", hidden: false },
    { id: "clicker_king", title: "Clicker King", desc: "Meow Clicker 200+", hidden: false },
    { id: "level_5", title: "Rising", desc: "Reach level 5", hidden: false },
    { id: "level_10", title: "Master", desc: "Reach level 10", hidden: false },
    { id: "daily_done", title: "Daily Done", desc: "Complete a daily challenge", hidden: false },
    { id: "shopper", title: "Collector", desc: "Unlock a shop item", hidden: false },
    { id: "night_owl", title: "Night Owl", desc: "Play between 00:00–05:00", hidden: true },
    { id: "konami", title: "Secret Sequence", desc: "Discover the hidden code", hidden: true },
    { id: "triple_meow", title: "Triple Meow", desc: "Open profile three times in a session", hidden: true },
  ];

  function checkAfterGame(gameMeta, result, saveMeta) {
    const unlocked = [];
    const p = MeowStorage.getProgress();
    const scores = MeowStorage.getGames();
    const ach = MeowStorage.getAchievements();

    function tryUnlock(id) {
      if (ach[id]) return;
      if (MeowStorage.unlockAchievement(id)) {
        const def = DEFS.find((d) => d.id === id);
        if (def) unlocked.push(def);
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
      tryUnlock("record_breaker"); // will refine below
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

  w.MeowAchievements = { DEFS, checkAfterGame };
})(window);
