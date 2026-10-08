# MeowBot Mini App

Mini App استاتیک برای **بله** — طراحی Cute · Modern · Dark · Premium

## GitHub Pages

پس از فعال‌سازی Pages:

**https://commander044444.github.io/meowbot-miniapp/**

### فعال‌سازی

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)**
5. Save

## ساختار

```
meowbot-miniapp/
├── index.html
├── profile.html
├── shop.html
├── games.html
├── leaderboard.html
├── css/style.css
├── js/app.js
├── assets/
└── README.md
```

## Bale

- `Bale.WebApp` / `Telegram.WebApp` ready
- نام کاربر از `initDataUnsafe.user` فقط برای نمایش
- احراز هویت واقعی باید در Backend با اعتبارسنجی `initData` انجام شود
- هیچ Token در این پروژه نیست

## اتصال بعدی به ربات

1. در پنل بله، Web App URL را روی آدرس Pages بگذار
2. Backend (مثلاً Railway MeowBot) endpointهایی مثل `/api/me` و `/shop/buy` اضافه کند
3. در `js/app.js` مقدار `API_BASE` را تنظیم کن

## توسعه محلی

فقط فایل‌ها را با یک static server باز کن، یا مستقیم HTML را در مرورگر ببین.
