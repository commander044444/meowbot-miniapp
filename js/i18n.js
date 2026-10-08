/**
 * i18n — default FA always (unless user saved preference)
 */
(function (w) {
  const STR = {
    fa: {
      // nav
      nav_home: "خانه",
      nav_play: "بازی",
      nav_progress: "پیشرفت",
      nav_shop: "فروشگاه",
      nav_profile: "پروفایل",
      nav_about: "درباره",
      nav_playground: "زمین‌بازی",
      nav_search: "جستجو",
      // home
      hero_title: "MeowBot",
      hero_lede: "ربات اجتماعی و سرگرمی برای بله — با یک آرکید آفلاین که هر وقت بخوای می‌تونی بازی کنی.",
      open_playground: "ورود به زمین‌بازی",
      about_btn: "درباره",
      quick_access: "دسترسی سریع",
      qa_playground: "زمین‌بازی",
      qa_playground_sub: "بازی قابل‌اجرا",
      qa_progress: "پیشرفت",
      qa_progress_sub: "سطح، تجربه، دستاوردها",
      qa_shop: "فروشگاه",
      qa_shop_sub: "تم و ظاهر",
      qa_world: "دنیای میو",
      qa_world_sub: "جابه‌جایی در اپ",
      daily_label: "چالش روزانه",
      daily_done: "برای امروز انجام شد",
      daily_reset: "نیمه‌شب ریست می‌شود",
      play: "بازی",
      featured: "منتخب",
      best: "بهترین",
      games: "بازی‌ها",
      level: "سطح",
      xp: "تجربه",
      achievements: "دستاوردها",
      // progress
      progress_title: "پیشرفت",
      progress_lede: "پیشرفت فقط روی همین دستگاه ذخیره می‌شود.",
      stats: "آمار",
      play_time: "زمان بازی",
      reaction: "واکنش",
      best_score: "بهترین امتیاز",
      favorite: "مورد علاقه",
      most_played: "بیشترین بازی",
      total_score: "جمع امتیاز",
      min: "دقیقه",
      // shop
      shop_title: "فروشگاه",
      shop_lede: "ظاهر با سکهٔ آرکید. پول واقعی نیست.",
      balance: "موجودی",
      coins: "سکه",
      free: "رایگان",
      buy: "خرید",
      equip: "فعال",
      equipped: "فعال است",
      unlocked: "باز شد",
      // profile
      profile_title: "پروفایل",
      name: "نام",
      bio: "بیو",
      save: "ذخیره",
      saved: "ذخیره شد",
      theme: "تم",
      // world
      world_title: "دنیای میو",
      world_lede: "به هر بخش از اپ برو.",
      overview: "نمای کلی",
      arcade: "آرکید",
      all_games: "همه بازی‌ها",
      you: "تو",
      daily: "روزانه",
      today_challenge: "چالش امروز",
      // about
      about_title: "درباره MeowBot",
      built_by_one: "این ربات و مینی‌اپ فقط به دست یک نفر ساخته شده.",
      profile: "پروفایل",
      more: "بیشتر",
      studio: "استودیو",
      open_bot: "باز کردن ربات",
      channel: "کانال",
      rights: "تمامی حقوق محفوظ است",
      // search
      search_title: "جستجو",
      search_ph: "بازی، دستاورد، بخش…",
      section: "بخش",
      // playground
      playground_title: "زمین‌بازی",
      choose_game: "یک بازی انتخاب کن",
      search_games: "جستجوی بازی",
      sort: "مرتب‌سازی",
      sort_popular: "محبوب",
      sort_name: "الفبا",
      sort_best: "بهترین امتیاز",
      sort_recent: "اخیر",
      cat_all: "همه",
      cat_popular: "محبوب",
      cat_speed: "واکنش",
      cat_brain: "حافظه",
      cat_arcade: "اکشن",
      cat_meow: "میو",
      cat_random: "آزاد",
      in_progress: "در حال انجام",
      completed: "انجام‌شده",
      plays: "بازی",
      start: "شروع",
      leave_game: "از این بازی خارج شوی؟",
      result: "نتیجه",
      score: "امتیاز",
      new_record: "رکورد جدید",
      replay: "دوباره",
      all_games_btn: "همه بازی‌ها",
      no_match: "چیزی پیدا نشد.",
      game_error: "خطا در بازی",
      close: "بستن",
      back: "بازگشت",
      // assistant-ish
      lang: "زبان",
      lang_fa: "فارسی",
      lang_en: "English",
      hidden_ach: "دستاورد مخفی",
      secret: "کد مخفی",
      failed: "ناموفق",
      not_enough: "سکه کافی نیست",
      owned: "از قبل داری",
      not_found: "پیدا نشد",
      keep_exploring: "ادامه بده و کشف کن",
      player: "بازیکن",
    },
    en: {
      nav_home: "Home",
      nav_play: "Play",
      nav_progress: "Progress",
      nav_shop: "Shop",
      nav_profile: "Profile",
      nav_about: "About",
      nav_playground: "Playground",
      nav_search: "Search",
      hero_title: "MeowBot",
      hero_lede: "A social entertainment bot for Bale — with an offline arcade you can play anytime.",
      open_playground: "Open Playground",
      about_btn: "About",
      quick_access: "Quick access",
      qa_playground: "Playground",
      qa_playground_sub: "playable games",
      qa_progress: "Progress",
      qa_progress_sub: "Level, XP, achievements",
      qa_shop: "Shop",
      qa_shop_sub: "Themes and cosmetics",
      qa_world: "Meow World",
      qa_world_sub: "Navigate the app",
      daily_label: "Daily challenge",
      daily_done: "Completed for today",
      daily_reset: "Resets at midnight",
      play: "Play",
      featured: "Featured",
      best: "Best",
      games: "Games",
      level: "Level",
      xp: "XP",
      achievements: "Achievements",
      progress_title: "Progress",
      progress_lede: "Local progression only. Nothing leaves this device.",
      stats: "Statistics",
      play_time: "Play time",
      reaction: "Reaction",
      best_score: "Best score",
      favorite: "Favorite",
      most_played: "Most played",
      total_score: "Total score",
      min: "min",
      shop_title: "Shop",
      shop_lede: "Cosmetic unlocks with arcade coins. No real money.",
      balance: "Balance",
      coins: "coins",
      free: "Free",
      buy: "Buy",
      equip: "Equip",
      equipped: "Equipped",
      unlocked: "Unlocked",
      profile_title: "Profile",
      name: "Name",
      bio: "Bio",
      save: "Save",
      saved: "Saved",
      theme: "Theme",
      world_title: "Meow World",
      world_lede: "Jump to any area of the app.",
      overview: "Overview",
      arcade: "Arcade",
      all_games: "All games",
      you: "You",
      daily: "Daily",
      today_challenge: "Today's challenge",
      about_title: "About MeowBot",
      built_by_one: "This bot and mini app were built by one person.",
      profile: "Profile",
      more: "More",
      studio: "Studio",
      open_bot: "Open bot",
      channel: "Channel",
      rights: "All rights reserved",
      search_title: "Search",
      search_ph: "Games, achievements, sections…",
      section: "Section",
      playground_title: "Playground",
      choose_game: "Choose a game",
      search_games: "Search games",
      sort: "Sort",
      sort_popular: "Popular",
      sort_name: "A–Z",
      sort_best: "Best score",
      sort_recent: "Recent",
      cat_all: "All",
      cat_popular: "Popular",
      cat_speed: "Reaction",
      cat_brain: "Memory",
      cat_arcade: "Action",
      cat_meow: "Meow",
      cat_random: "Casual",
      in_progress: "In progress",
      completed: "Completed",
      plays: "plays",
      start: "Start",
      leave_game: "Leave this game?",
      result: "Result",
      score: "Score",
      new_record: "New record",
      replay: "Replay",
      all_games_btn: "All games",
      no_match: "No games match.",
      game_error: "Game error",
      close: "Close",
      back: "Back",
      lang: "Language",
      lang_fa: "فارسی",
      lang_en: "English",
      hidden_ach: "Hidden achievement",
      secret: "Secret sequence",
      failed: "Failed",
      not_enough: "Not enough coins",
      owned: "Owned",
      not_found: "Not found",
      keep_exploring: "Keep exploring",
      player: "Player",
    },
  };

  function getLang() {
    try {
      const s = JSON.parse(localStorage.getItem("meowbot_settings") || "{}");
      if (s.lang === "en" || s.lang === "fa") return s.lang;
    } catch (_) {}
    return "fa"; // always default FA
  }

  function setLang(lang) {
    lang = lang === "en" ? "en" : "fa";
    try {
      const s = JSON.parse(localStorage.getItem("meowbot_settings") || "{}");
      s.lang = lang;
      localStorage.setItem("meowbot_settings", JSON.stringify(s));
    } catch (_) {}
    // also via MeowStorage if ready
    if (w.MeowStorage) {
      const s = MeowStorage.getSettings();
      s.lang = lang;
      MeowStorage.setSettings(s);
    }
    apply(lang);
    return lang;
  }

  function t(key) {
    const lang = getLang();
    return (STR[lang] && STR[lang][key]) || (STR.fa && STR.fa[key]) || key;
  }

  function apply(lang) {
    lang = lang || getLang();
    document.documentElement.lang = lang === "en" ? "en" : "fa";
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.hasAttribute("data-i18n-placeholder")) el.placeholder = val;
        else el.value = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    if (w.MeowApp && MeowApp.onLangChange) MeowApp.onLangChange(lang);
  }

  w.MeowI18n = { STR, t, getLang, setLang, apply };
})(window);
