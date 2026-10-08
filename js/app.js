/**
 * MeowBot Landing — interactions
 * Scroll reveal · nav · progress · no auth / no Bale user APIs
 */
(function () {
  "use strict";

  const cfg = window.MEOW_CONFIG || {};
  const links = cfg.links || {};

  /* ---------- Apply config links ---------- */
  function href(key, fallback) {
    const v = links[key];
    if (v == null || v === "") return fallback || "#";
    return v;
  }

  function applyLinks() {
    document.querySelectorAll("[data-link]").forEach((el) => {
      const key = el.getAttribute("data-link");
      const url = href(key);
      if (url === "#" || !url) {
        el.setAttribute("href", "#");
        el.addEventListener("click", (e) => {
          e.preventDefault();
          toast("لینک هنوز در config.js تنظیم نشده");
        });
      } else {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });

    // Social cards from config
    const grid = document.getElementById("social-grid");
    if (grid && Array.isArray(cfg.social)) {
      grid.innerHTML = cfg.social
        .filter((s) => links[s.key])
        .map(
          (s) => `
        <a class="link-card glass reveal" data-link="${s.key}" href="#">
          <div class="ico">${s.icon || "🔗"}</div>
          <div>
            <div class="t">${s.label}</div>
            <div class="d">${s.desc || ""}</div>
          </div>
          <span class="arrow">←</span>
        </a>`
        )
        .join("");
      // re-bind
      grid.querySelectorAll("[data-link]").forEach((el) => {
        const key = el.getAttribute("data-link");
        const url = href(key);
        if (url && url !== "#") {
          el.setAttribute("href", url);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      });
    }

    // Developer / studio text
    const d = cfg.developer || {};
    const st = cfg.studio || {};
    setText("[data-dev-name]", d.name);
    setText("[data-dev-user]", d.username);
    setText("[data-dev-bio]", d.bio);
    setText("[data-studio-name]", st.name);
    setText("[data-studio-tag]", st.tagline);
    setText("[data-studio-desc]", st.description);
    setText("[data-brand-name]", (cfg.brand && cfg.brand.name) || "MeowBot");
    setText("[data-brand-tag]", (cfg.brand && cfg.brand.tagline) || "");
    setText("[data-brand-desc]", (cfg.brand && cfg.brand.shortDescription) || "");

    if (d.avatar) {
      const av = document.querySelector(".dev-avatar");
      if (av) av.innerHTML = `<img src="${d.avatar}" alt="" />`;
    }
    if (st.avatar) {
      const av = document.querySelector(".studio-logo");
      if (av) av.innerHTML = `<img src="${st.avatar}" alt="" />`;
    }
  }

  function setText(sel, val) {
    if (!val) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = val;
    });
  }

  /* ---------- Toast ---------- */
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.style.cssText =
        "position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-20px);z-index:250;padding:12px 18px;border-radius:14px;background:rgba(20,20,40,.95);border:1px solid rgba(167,139,250,.35);font-size:.85rem;font-weight:600;opacity:0;transition:.3s;max-width:90%;text-align:center;pointer-events:none";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(t._t);
    t._t = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(-20px)";
    }, 2600);
  }

  /* ---------- Scroll progress ---------- */
  function onScrollProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    const bar = document.getElementById("scroll-progress");
    if (bar) bar.style.width = p + "%";
  }

  /* ---------- Nav ---------- */
  function setupNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("nav-toggle");
    const drawer = document.getElementById("nav-drawer");

    function setScrolled() {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 24);
    }
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    if (toggle) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
      });
    }

    document.querySelectorAll(".nav-drawer a, .nav-links a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("open"));
    });

    // Active section
    const sections = document.querySelectorAll("section[id]");
    const navAs = document.querySelectorAll(".nav-links a[href^='#'], .nav-drawer a[href^='#']");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          navAs.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Reveal ---------- */
  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
          }
          // keep class when leaving — natural, no flash
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    nodes.forEach((n, i) => {
      if (!n.style.getPropertyValue("--d")) {
        const stagger = n.dataset.stagger;
        if (stagger != null) n.style.setProperty("--d", Number(stagger) * 70 + "ms");
        else if (n.parentElement && n.parentElement.classList.contains("grid-3")) {
          // handled via data-stagger in HTML ideally
        }
      }
      io.observe(n);
    });
  }

  /* ---------- Back to top ---------- */
  function setupToTop() {
    const btn = document.getElementById("to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("show", window.scrollY > 480);
      },
      { passive: true }
    );
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Loader ---------- */
  function hideLoader() {
    const l = document.getElementById("loader");
    if (!l) return;
    requestAnimationFrame(() => l.classList.add("hide"));
  }

  /* ---------- Boot ---------- */
  function boot() {
    applyLinks();
    setupNav();
    setupReveal();
    setupToTop();
    window.addEventListener("scroll", onScrollProgress, { passive: true });
    onScrollProgress();
    hideLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
