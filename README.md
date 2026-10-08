# MeowBot Landing (Mini App)

سایت معرفی Premium برای **MeowBot** — بدون Login، بدون Backend، مناسب GitHub Pages و WebView بله.

## URL

https://commander044444.github.io/meowbot-miniapp/

## ساختار

```
meowbot-miniapp/
├── index.html
├── css/style.css
├── js/config.js      ← لینک‌ها را اینجا عوض کن
├── js/app.js
├── assets/
└── README.md
```

## تنظیم لینک‌ها

فایل `js/config.js`:

- `links.bot` — باز کردن ربات
- `links.developerProfile` / `developerPv`
- `links.studio` / `studioJoin`
- `links.officialChannel`
- `links.github`

## Pages

Settings → Pages → Deploy from branch → **main** → **/ (root)**

## نکات

- Scroll Reveal با IntersectionObserver
- `prefers-reduced-motion` رعایت می‌شود
- هیچ فراخوانی Bale.WebApp برای هویت کاربر نیست
