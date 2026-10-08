(function (w) {
  const THEMES = {
    midnight: {
      "--bg": "#0a0a0f",
      "--surface": "#12121a",
      "--surface-2": "#181822",
      "--border": "rgba(255,255,255,0.08)",
      "--text": "#ececf1",
      "--muted": "#8b8b9a",
      "--accent": "#8b7cf7",
      "--accent-2": "#c4b5fd",
    },
    minimal: {
      "--bg": "#0c0c0c",
      "--surface": "#141414",
      "--surface-2": "#1a1a1a",
      "--border": "rgba(255,255,255,0.07)",
      "--text": "#f2f2f2",
      "--muted": "#888",
      "--accent": "#a3a3a3",
      "--accent-2": "#d4d4d4",
    },
    neon: {
      "--bg": "#080812",
      "--surface": "#10101e",
      "--surface-2": "#161628",
      "--border": "rgba(139,124,247,0.18)",
      "--text": "#f0f0ff",
      "--muted": "#8a8ab0",
      "--accent": "#7c6af7",
      "--accent-2": "#a78bfa",
    },
    sakura: {
      "--bg": "#100c10",
      "--surface": "#1a1418",
      "--surface-2": "#221a20",
      "--border": "rgba(244,114,182,0.12)",
      "--text": "#fce7f3",
      "--muted": "#a89",
      "--accent": "#e879a9",
      "--accent-2": "#f9a8d4",
    },
    arctic: {
      "--bg": "#0a0e12",
      "--surface": "#111820",
      "--surface-2": "#16202a",
      "--border": "rgba(125,211,252,0.12)",
      "--text": "#e8f4fc",
      "--muted": "#7a92a8",
      "--accent": "#38bdf8",
      "--accent-2": "#7dd3fc",
    },
    light: {
      "--bg": "#f6f6f8",
      "--surface": "#ffffff",
      "--surface-2": "#f0f0f4",
      "--border": "rgba(0,0,0,0.08)",
      "--text": "#141418",
      "--muted": "#6b6b78",
      "--accent": "#5b4fd6",
      "--accent-2": "#7c6af7",
    },
  };

  function apply(name) {
    const t = THEMES[name] || THEMES.midnight;
    const root = document.documentElement;
    Object.keys(t).forEach((k) => root.style.setProperty(k, t[k]));
    root.setAttribute("data-theme", name);
  }

  function init() {
    const s = MeowStorage.getSettings();
    apply(s.theme || "midnight");
  }

  w.MeowThemes = { THEMES, apply, init };
})(window);
