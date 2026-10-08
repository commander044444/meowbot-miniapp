(function (w) {
  const lines = {
    idle: [
      "Ready when you are.",
      "Pick a game when you feel like it.",
      "Quiet day? The arcade is open.",
    ],
    record: [
      "New personal best.",
      "That was clean.",
      "Record updated.",
    ],
    long: [
      "You've been playing for a while.",
      "Nice session.",
      "Solid streak of games.",
    ],
    newGame: [
      "First time on this one.",
      "Give it a try.",
      "New title — go easy.",
    ],
    level: [
      "Level up.",
      "Progress noted.",
      "You're climbing.",
    ],
    daily: [
      "Daily challenge is waiting.",
      "One challenge left for today.",
    ],
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function lineFor(context) {
    const p = MeowStorage.getProgress();
    if (context === "record") return pick(lines.record);
    if (context === "level") return pick(lines.level);
    if (context === "newGame") return pick(lines.newGame);
    if (context === "daily") return pick(lines.daily);
    if ((p.totalGames || 0) > 15 && context === "session") return pick(lines.long);
    return pick(lines.idle);
  }

  w.MeowAssistant = { lineFor };
})(window);
