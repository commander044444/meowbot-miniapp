/**
 * MeowBot Landing — Configuration
 * تمام لینک‌ها و متن‌های قابل‌تغییر اینجاست.
 * بعد از تغییر، فقط این فایل را ذخیره کن (نیازی به Build نیست).
 */
window.MEOW_CONFIG = {
  brand: {
    name: "MeowBot",
    emoji: "🐱",
    tagline: "ربات اجتماعی و سرگرمی برای بله",
    shortDescription:
      "MeowBot یک ربات واقعی روی بله است؛ با میو کردن، پت، بازی، نبرد و سیستم اقتصادی برای گروه‌ها و پیوی.",
  },

  /* ---- لینک‌هایی که باید خودت تنظیم کنی ---- */
  links: {
    // لینک باز کردن ربات در بله (PV / start)
    bot: "https://ble.ir/MeowBot", // ← جایگزین با لینک واقعی ربات

    // پروفایل سازنده در بله
    developerProfile: "https://ble.ir/commander04", // ← لینک پروفایل

    // باز کردن پیوی سازنده
    developerPv: "https://ble.ir/commander04", // ← لینک PV

    // صفحه / کانال رسمی Darkknight Studio
    studio: "https://ble.ir/DarkknightStudio", // ← لینک رسمی استودیو

    // عضویت در کانال یا گروه استودیو
    studioJoin: "https://ble.ir/join/DarkknightStudio", // ← لینک Join

    // کانال یا گروه رسمی MeowBot (اختیاری)
    officialChannel: "https://ble.ir/MeowBotChannel", // ← در صورت نبود، خالی بگذار ""

    // ریپوی گیت‌هاب ربات (اختیاری)
    github: "https://github.com/commander044444/Meowbot",
  },

  developer: {
    name: "COMMANDER04",
    username: "@commander04",
    bio: "توسعه‌دهنده بک‌اند و ربات‌های پیام‌رسان. تمرکز روی Python، معماری پایدار و تجربه کاربری تمیز در پروژه‌های دیجیتال.",
    // مسیر تصویر اختیاری — اگر خالی باشد از آواتار حرفی استفاده می‌شود
    avatar: "", // مثال: "assets/commander.png"
  },

  studio: {
    name: "Darkknight Studio",
    tagline: "قدرت گرفته از Darkknight Studio",
    description:
      "استودیوی ساخت محصولات دیجیتال و ربات‌های پیام‌رسان. MeowBot زیر چتر این برند توسعه داده می‌شود.",
    avatar: "", // مثال: "assets/studio.png"
  },

  social: [
    { id: "bot", label: "MeowBot", desc: "باز کردن ربات", key: "bot", icon: "🐱" },
    { id: "studio", label: "Darkknight Studio", desc: "صفحه رسمی استودیو", key: "studio", icon: "⚔️" },
    { id: "dev", label: "سازنده", desc: "پروفایل COMMANDER04", key: "developerProfile", icon: "👨‍💻" },
    { id: "channel", label: "کانال رسمی", desc: "اخبار و به‌روزرسانی", key: "officialChannel", icon: "📢" },
    { id: "github", label: "GitHub", desc: "کد منبع پروژه", key: "github", icon: "💻" },
  ],
};
