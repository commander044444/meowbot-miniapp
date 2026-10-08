(function (w) {
  const ITEMS = [
    { id: "theme_midnight", name: "Midnight", type: "theme", price: 0, desc: "Default dark" },
    { id: "theme_minimal", name: "Minimal", type: "theme", price: 40, desc: "Clean and quiet" },
    { id: "theme_neon", name: "Neon", type: "theme", price: 80, desc: "Subtle accent glow" },
    { id: "theme_sakura", name: "Sakura", type: "theme", price: 80, desc: "Soft rose tones" },
    { id: "theme_arctic", name: "Arctic", type: "theme", price: 60, desc: "Cool blue-gray" },
    { id: "theme_light", name: "Light", type: "theme", price: 50, desc: "Light interface" },
    { id: "frame_thin", name: "Thin Frame", type: "frame", price: 30, desc: "Profile frame" },
    { id: "frame_gold", name: "Gold Frame", type: "frame", price: 90, desc: "Accent frame" },
    { id: "badge_star", name: "Star Badge", type: "badge", price: 45, desc: "Profile badge" },
    { id: "badge_meow", name: "Meow Badge", type: "badge", price: 55, desc: "Cat badge" },
  ];

  function list() {
    return ITEMS;
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

  w.MeowShop = { ITEMS, list, buy, equip };
})(window);
