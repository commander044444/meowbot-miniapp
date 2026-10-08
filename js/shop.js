(function (w) {
  const ITEMS = [
    { id: "theme_midnight", name_fa: "نیمه‌شب", name_en: "Midnight", type: "theme", price: 0, desc_fa: "تم پیش‌فرض تیره", desc_en: "Default dark" },
    { id: "theme_minimal", name_fa: "مینیمال", name_en: "Minimal", type: "theme", price: 40, desc_fa: "ساده و خلوت", desc_en: "Clean and quiet" },
    { id: "theme_neon", name_fa: "نئون", name_en: "Neon", type: "theme", price: 80, desc_fa: "تاکید رنگی ملایم", desc_en: "Subtle accent glow" },
    { id: "theme_sakura", name_fa: "ساکورا", name_en: "Sakura", type: "theme", price: 80, desc_fa: "تون صورتی ملایم", desc_en: "Soft rose tones" },
    { id: "theme_arctic", name_fa: "قطبی", name_en: "Arctic", type: "theme", price: 60, desc_fa: "آبی‌خاکستری خنک", desc_en: "Cool blue-gray" },
    { id: "theme_light", name_fa: "روشن", name_en: "Light", type: "theme", price: 50, desc_fa: "رابط روشن", desc_en: "Light interface" },
    { id: "frame_thin", name_fa: "قاب ساده", name_en: "Thin Frame", type: "frame", price: 30, desc_fa: "قاب پروفایل", desc_en: "Profile frame" },
    { id: "frame_gold", name_fa: "قاب طلایی", name_en: "Gold Frame", type: "frame", price: 90, desc_fa: "قاب با تاکید رنگی", desc_en: "Accent frame" },
    { id: "badge_star", name_fa: "نشان ستاره", name_en: "Star Badge", type: "badge", price: 45, desc_fa: "نشان پروفایل", desc_en: "Profile badge" },
    { id: "badge_meow", name_fa: "نشان میو", name_en: "Meow Badge", type: "badge", price: 55, desc_fa: "نشان گربه‌ای", desc_en: "Cat badge" },
  ];

  function localized(item) {
    const lang = (w.MeowI18n && MeowI18n.getLang()) || "fa";
    return {
      ...item,
      name: lang === "en" ? item.name_en : item.name_fa,
      desc: lang === "en" ? item.desc_en : item.desc_fa,
    };
  }

  function list() {
    return ITEMS.map(localized);
  }

  function buy(id) {
    const item = ITEMS.find((i) => i.id === id);
    if (!item) return { ok: false, error: "Not found" };
    const shop = MeowStorage.getShop();
    if ((shop.owned || []).includes(id)) return { ok: false, error: "Owned" };
    if ((shop.currency || 0) < item.price) return { ok: false, error: "Not enough coins" };
    shop.currency -= item.price;
    shop.owned = shop.owned || [];
    shop.owned.push(id);
    MeowStorage.setShop(shop);
    MeowStorage.unlockAchievement("shopper");
    return { ok: true, shop };
  }

  function equip(id) {
    const item = ITEMS.find((i) => i.id === id);
    if (!item) return false;
    const shop = MeowStorage.getShop();
    if (!(shop.owned || []).includes(id)) return false;
    shop.equipped = shop.equipped || {};
    if (item.type === "theme") {
      shop.equipped.theme = id;
      const settings = MeowStorage.getSettings();
      settings.theme = id.replace("theme_", "");
      MeowStorage.setSettings(settings);
      if (w.MeowThemes) MeowThemes.apply(settings.theme);
    } else if (item.type === "frame") shop.equipped.frame = id;
    else if (item.type === "badge") shop.equipped.badge = id;
    MeowStorage.setShop(shop);
    return true;
  }

  w.MeowShop = { ITEMS, list, buy, equip, localized };
})(window);
