(function (w) {
  const lines = {
    fa: {
      idle: ["هر وقت آماده بودی.", "یه بازی انتخاب کن.", "آرکید بازه."],
      record: ["رکورد جدید.", "تمیز بود.", "رکورد به‌روز شد."],
      long: ["مدتیه داری بازی می‌کنی.", "سشن خوبی بود.", "ادامه بده."],
      newGame: ["اولین باره اینو می‌زنی.", "امتحانش کن.", "آروم شروع کن."],
      level: ["سطح بالا رفت.", "پیشرفت ثبت شد.", "داری می‌ری بالا."],
      daily: ["چالش روزانه منتظرته.", "یه چالش برای امروز مونده."],
    },
    en: {
      idle: ["Ready when you are.", "Pick a game when you feel like it.", "The arcade is open."],
      record: ["New personal best.", "That was clean.", "Record updated."],
      long: ["You've been playing for a while.", "Nice session.", "Solid streak of games."],
      newGame: ["First time on this one.", "Give it a try.", "New title — go easy."],
      level: ["Level up.", "Progress noted.", "You're climbing."],
      daily: ["Daily challenge is waiting.", "One challenge left for today."],
    },
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function lineFor(context) {
    const lang = (w.MeowI18n && MeowI18n.getLang()) || "fa";
    const pack = lines[lang] || lines.fa;
    const p = MeowStorage.getProgress();
    if (context === "record") return pick(pack.record);
    if (context === "level") return pick(pack.level);
    if (context === "newGame") return pick(pack.newGame);
    if (context === "daily") return pick(pack.daily);
    if ((p.totalGames || 0) > 15 && context === "session") return pick(pack.long);
    return pick(pack.idle);
  }

  w.MeowAssistant = { lineFor };
})(window);
