
/**
 * Meow Playground — All playable games (local only)
 * Each game: mount(root, api) where api = { end(result), sound(), toast() }
 */
(function (w) {
  const G = {};

  function el(html) {
    const d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function clear(root) {
    root.innerHTML = "";
  }
  function btn(label, cls, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pg-btn " + (cls || "");
    b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function hud(text) {
    const h = document.createElement("div");
    h.className = "pg-hud";
    h.textContent = text;
    return h;
  }

  /* ===== 1 Reaction Test ===== */
  G.reaction = {
    id: "reaction", name: "Reaction Test", cat: "speed", icon: "⚡",
    desc: "وقتی سبز شد سریع بزن", popular: true,
    play(root, api) {
      clear(root);
      const box = el('<div class="pg-stage reaction-stage"><p class="pg-hint">صبر کن… وقتی سبز شد بزن!</p></div>');
      root.appendChild(box);
      let start = 0, armed = false, timeout;
      const arm = () => {
        timeout = setTimeout(() => {
          armed = true;
          start = performance.now();
          box.className = "pg-stage reaction-stage go";
          box.querySelector(".pg-hint").textContent = "الان بزن! ⚡";
        }, 1200 + Math.random() * 2800);
      };
      box.addEventListener("click", () => {
        if (!armed) {
          clearTimeout(timeout);
          box.querySelector(".pg-hint").textContent = "زود زدی! دوباره…";
          box.className = "pg-stage reaction-stage early";
          armed = false;
          setTimeout(() => {
            box.className = "pg-stage reaction-stage";
            box.querySelector(".pg-hint").textContent = "صبر کن…";
            arm();
          }, 900);
          return;
        }
        const ms = Math.round(performance.now() - start);
        api.end({ score: Math.max(0, 1000 - ms), bestTime: ms, label: ms + " ms" });
      });
      arm();
    },
  };

  /* ===== 2 Tap Rush ===== */
  G.tap_rush = {
    id: "tap_rush", name: "Tap Rush", cat: "speed", icon: "👆",
    desc: "۱۰ ثانیه هر چی می‌تونی بزن", popular: true,
    play(root, api) {
      clear(root);
      let score = 0, combo = 0, left = 10;
      const h = hud("امتیاز: 0 | زمان: 10");
      const stage = el('<div class="pg-stage tap-stage"><button type="button" class="pg-big-tap">TAP!</button></div>');
      root.append(h, stage);
      const b = stage.querySelector("button");
      const tick = setInterval(() => {
        left--;
        h.textContent = `امتیاز: ${score} | کمبو: ${combo} | زمان: ${left}`;
        if (left <= 0) {
          clearInterval(tick);
          api.end({ score, perfect: combo >= 20 });
        }
      }, 1000);
      b.addEventListener("click", () => {
        if (left <= 0) return;
        combo++;
        score += 1 + Math.floor(combo / 5);
        h.textContent = `امتیاز: ${score} | کمبو: ${combo} | زمان: ${left}`;
        b.classList.add("pulse");
        setTimeout(() => b.classList.remove("pulse"), 80);
      });
    },
  };

  /* ===== 3 Color Reaction ===== */
  G.color_reaction = {
    id: "color_reaction", name: "Color Reaction", cat: "speed", icon: "🎨",
    desc: "رنگ درست را سریع انتخاب کن",
    play(root, api) {
      clear(root);
      const colors = [
        { name: "قرمز", c: "#ef4444" },
        { name: "آبی", c: "#3b82f6" },
        { name: "سبز", c: "#22c55e" },
        { name: "زرد", c: "#eab308" },
      ];
      let score = 0, round = 0, target;
      const h = hud("دور 1");
      const stage = el('<div class="pg-stage"></div>');
      root.append(h, stage);
      function next() {
        round++;
        if (round > 12) return api.end({ score, perfect: score >= 12 });
        target = colors[Math.floor(Math.random() * colors.length)];
        h.textContent = `دور ${round}/12 — بزن روی: ${target.name} | امتیاز: ${score}`;
        stage.innerHTML = "";
        const shuffled = colors.slice().sort(() => Math.random() - 0.5);
        shuffled.forEach((col) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pg-color-btn";
          b.style.background = col.c;
          b.addEventListener("click", () => {
            if (col.name === target.name) score++;
            else score = Math.max(0, score - 1);
            next();
          });
          stage.appendChild(b);
        });
      }
      next();
    },
  };

  /* ===== 4 Stop At 10 ===== */
  G.stop_at_10 = {
    id: "stop_at_10", name: "Stop At 10", cat: "speed", icon: "⏱",
    desc: "دقیقاً روی ۱۰.۰۰ متوقف کن",
    play(root, api) {
      clear(root);
      let t = 0, running = false, raf;
      const display = el('<div class="pg-stage"><div class="pg-timer">0.00</div><button type="button" class="pg-btn pg-btn-primary">شروع / توقف</button></div>');
      root.appendChild(display);
      const timerEl = display.querySelector(".pg-timer");
      const btnEl = display.querySelector("button");
      let last = 0;
      function loop(now) {
        if (!running) return;
        if (!last) last = now;
        t += (now - last) / 1000;
        last = now;
        timerEl.textContent = t.toFixed(2);
        raf = requestAnimationFrame(loop);
      }
      btnEl.addEventListener("click", () => {
        if (!running) {
          t = 0; last = 0; running = true;
          raf = requestAnimationFrame(loop);
          btnEl.textContent = "توقف!";
          return;
        }
        running = false;
        cancelAnimationFrame(raf);
        const diff = Math.abs(t - 10);
        const score = Math.max(0, Math.round(1000 - diff * 200));
        api.end({ score, label: t.toFixed(2) + "s", perfect: diff < 0.05 });
      });
    },
  };

  /* ===== 5 Quick Tap ===== */
  G.quick_tap = {
    id: "quick_tap", name: "Quick Tap", cat: "speed", icon: "🎯",
    desc: "هدف‌های سریع را بزن",
    play(root, api) {
      clear(root);
      let score = 0, left = 15;
      const h = hud("هدف‌ها: 15");
      const stage = el('<div class="pg-stage pg-field"></div>');
      root.append(h, stage);
      function spawn() {
        if (left <= 0) return api.end({ score });
        stage.innerHTML = "";
        const t = document.createElement("button");
        t.type = "button";
        t.className = "pg-target";
        t.textContent = "●";
        t.style.left = 10 + Math.random() * 70 + "%";
        t.style.top = 10 + Math.random() * 70 + "%";
        const born = performance.now();
        t.addEventListener("click", () => {
          const ms = performance.now() - born;
          score += Math.max(5, 50 - Math.floor(ms / 20));
          left--;
          h.textContent = `امتیاز: ${score} | مانده: ${left}`;
          spawn();
        });
        stage.appendChild(t);
        setTimeout(() => {
          if (t.parentNode) {
            left--;
            h.textContent = `امتیاز: ${score} | مانده: ${left}`;
            if (left <= 0) api.end({ score });
            else spawn();
          }
        }, 1200);
      }
      spawn();
    },
  };

  /* ===== 6 Falling Objects ===== */
  G.falling = {
    id: "falling", name: "Falling Objects", cat: "speed", icon: "🍎",
    desc: "فقط 🍎 را بگیر — بمب را نه!",
    play(root, api) {
      clear(root);
      let score = 0, lives = 3, active = true;
      const h = hud("امتیاز: 0 | ❤️ 3");
      const stage = el('<div class="pg-stage pg-field falling-field"></div>');
      root.append(h, stage);
      const iv = setInterval(() => {
        if (!active) return;
        const isBomb = Math.random() < 0.28;
        const o = document.createElement("button");
        o.type = "button";
        o.className = "pg-fall";
        o.textContent = isBomb ? "💣" : "🍎";
        o.style.left = 8 + Math.random() * 80 + "%";
        stage.appendChild(o);
        let y = -10;
        const fall = setInterval(() => {
          y += 2.2;
          o.style.top = y + "%";
          if (y > 100) {
            clearInterval(fall);
            o.remove();
            if (!isBomb && active) {
              lives--;
              h.textContent = `امتیاز: ${score} | ❤️ ${lives}`;
              if (lives <= 0) {
                active = false;
                clearInterval(iv);
                api.end({ score });
              }
            }
          }
        }, 30);
        o.addEventListener("click", () => {
          clearInterval(fall);
          o.remove();
          if (isBomb) {
            lives--;
            if (lives <= 0) {
              active = false;
              clearInterval(iv);
              api.end({ score });
            }
          } else score += 10;
          h.textContent = `امتیاز: ${score} | ❤️ ${lives}`;
        });
      }, 700);
    },
  };

  /* ===== 7 Dodge (simple) ===== */
  G.dodge = {
    id: "dodge", name: "Dodge", cat: "speed", icon: "🛡️",
    desc: "با لمس چپ/راست جاخالی بده",
    play(root, api) {
      clear(root);
      let score = 0, x = 50, active = true;
      const h = hud("امتیاز: 0");
      const stage = el('<div class="pg-stage pg-field"><div class="pg-player">🐱</div></div>');
      root.append(h, stage);
      const player = stage.querySelector(".pg-player");
      function setX(nx) {
        x = Math.max(5, Math.min(90, nx));
        player.style.left = x + "%";
      }
      setX(50);
      stage.addEventListener("click", (e) => {
        const r = stage.getBoundingClientRect();
        setX(((e.clientX - r.left) / r.width) * 100);
      });
      const iv = setInterval(() => {
        if (!active) return;
        const obs = document.createElement("div");
        obs.className = "pg-obstacle";
        obs.textContent = "■";
        const ox = 10 + Math.random() * 80;
        obs.style.left = ox + "%";
        stage.appendChild(obs);
        let y = -5;
        const fall = setInterval(() => {
          y += 2.5 + score * 0.02;
          obs.style.top = y + "%";
          if (y > 78 && y < 95 && Math.abs(ox - x) < 12) {
            clearInterval(fall);
            active = false;
            clearInterval(iv);
            api.end({ score });
          }
          if (y > 105) {
            clearInterval(fall);
            obs.remove();
            score++;
            h.textContent = "امتیاز: " + score;
          }
        }, 28);
      }, 800);
    },
  };

  /* ===== 8 Fast Finger ===== */
  G.fast_finger = {
    id: "fast_finger", name: "Fast Finger", cat: "speed", icon: "🖐️",
    desc: "هدف‌ها سریع‌تر ظاهر می‌شوند",
    play(root, api) {
      clear(root);
      let score = 0, delay = 1000, hits = 0;
      const h = hud("امتیاز: 0");
      const stage = el('<div class="pg-stage pg-field"></div>');
      root.append(h, stage);
      function spawn() {
        stage.innerHTML = "";
        const t = document.createElement("button");
        t.type = "button";
        t.className = "pg-target small";
        t.textContent = "😼";
        t.style.left = 10 + Math.random() * 75 + "%";
        t.style.top = 10 + Math.random() * 75 + "%";
        let hit = false;
        t.addEventListener("click", () => {
          hit = true;
          hits++;
          score += 10;
          delay = Math.max(350, delay - 30);
          h.textContent = "امتیاز: " + score;
          spawn();
        });
        stage.appendChild(t);
        setTimeout(() => {
          if (!hit) api.end({ score, perfect: hits >= 15 });
        }, delay);
      }
      spawn();
    },
  };

  /* ===== 9 Memory Cards ===== */
  G.memory_cards = {
    id: "memory_cards", name: "Memory Cards", cat: "brain", icon: "🃏",
    desc: "جفت کارت‌ها را پیدا کن", popular: true,
    play(root, api) {
      clear(root);
      const icons = ["🐱", "🐭", "🐟", "🎾", "⭐", "🌙", "🍩", "🎸"];
      const cards = icons.concat(icons).sort(() => Math.random() - 0.5);
      let flips = [], moves = 0, matched = 0, lock = false;
      const h = hud("حرکت: 0");
      const grid = el('<div class="pg-mem-grid"></div>');
      root.append(h, grid);
      cards.forEach((icon, i) => {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "pg-mem-card";
        c.dataset.v = icon;
        c.innerHTML = "<span>?</span>";
        c.addEventListener("click", () => {
          if (lock || c.classList.contains("open") || c.classList.contains("done")) return;
          c.classList.add("open");
          c.innerHTML = "<span>" + icon + "</span>";
          flips.push(c);
          if (flips.length < 2) return;
          moves++;
          h.textContent = "حرکت: " + moves;
          lock = true;
          const [a, b] = flips;
          if (a.dataset.v === b.dataset.v) {
            a.classList.add("done");
            b.classList.add("done");
            matched += 2;
            flips = [];
            lock = false;
            if (matched >= cards.length) {
              const score = Math.max(10, 200 - moves * 5);
              api.end({ score, perfect: moves <= 12 });
            }
          } else {
            setTimeout(() => {
              a.classList.remove("open");
              b.classList.remove("open");
              a.innerHTML = "<span>?</span>";
              b.innerHTML = "<span>?</span>";
              flips = [];
              lock = false;
            }, 550);
          }
        });
        grid.appendChild(c);
      });
    },
  };

  /* ===== 10 Number Memory ===== */
  G.number_memory = {
    id: "number_memory", name: "Number Memory", cat: "brain", icon: "🔢",
    desc: "عدد را به خاطر بسپار",
    play(root, api) {
      clear(root);
      let level = 1, score = 0;
      const stage = el('<div class="pg-stage"></div>');
      root.appendChild(stage);
      function show() {
        const len = 2 + level;
        let n = "";
        for (let i = 0; i < len; i++) n += Math.floor(Math.random() * 10);
        stage.innerHTML = `<p class="pg-hint">سطح ${level}</p><div class="pg-big-num">${n}</div>`;
        setTimeout(() => {
          stage.innerHTML = `<p class="pg-hint">عدد را وارد کن</p><input class="pg-input" type="text" inputmode="numeric" maxlength="12" /><button type="button" class="pg-btn pg-btn-primary">تأیید</button>`;
          const inp = stage.querySelector("input");
          const go = () => {
            if (inp.value.trim() === n) {
              score += level * 20;
              level++;
              if (level > 8) return api.end({ score, perfect: true });
              show();
            } else api.end({ score });
          };
          stage.querySelector("button").onclick = go;
          inp.focus();
        }, 1200 + level * 200);
      }
      show();
    },
  };

  /* ===== 11 Pattern Memory ===== */
  G.pattern_memory = {
    id: "pattern_memory", name: "Pattern Memory", cat: "brain", icon: "🔷",
    desc: "الگو را تکرار کن",
    play(root, api) {
      clear(root);
      const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
      let seq = [], input = [], score = 0, showing = false;
      const h = hud("نگاه کن…");
      const stage = el('<div class="pg-stage pg-pattern"></div>');
      root.append(h, stage);
      colors.forEach((c, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pg-pat-btn";
        b.style.background = c;
        b.dataset.i = i;
        b.addEventListener("click", () => {
          if (showing) return;
          input.push(i);
          b.classList.add("flash");
          setTimeout(() => b.classList.remove("flash"), 150);
          const idx = input.length - 1;
          if (input[idx] !== seq[idx]) return api.end({ score });
          if (input.length === seq.length) {
            score += seq.length * 10;
            h.textContent = "آفرین! امتیاز: " + score;
            setTimeout(next, 500);
          }
        });
        stage.appendChild(b);
      });
      async function next() {
        input = [];
        seq.push(Math.floor(Math.random() * 4));
        showing = true;
        h.textContent = "نگاه کن…";
        for (let i = 0; i < seq.length; i++) {
          const b = stage.children[seq[i]];
          b.classList.add("flash");
          await new Promise((r) => setTimeout(r, 400));
          b.classList.remove("flash");
          await new Promise((r) => setTimeout(r, 150));
        }
        showing = false;
        h.textContent = "تکرار کن | امتیاز: " + score;
        if (seq.length > 10) api.end({ score, perfect: true });
      }
      next();
    },
  };

  /* ===== 12 Simon ===== */
  G.simon = {
    id: "simon", name: "Simon", cat: "brain", icon: "🌈",
    desc: "ترتیب رنگ‌ها را تکرار کن", popular: true,
    play(root, api) {
      // same as pattern with 4 pads — reuse logic
      G.pattern_memory.play(root, api);
    },
  };

  /* ===== 13 Math Rush ===== */
  G.math_rush = {
    id: "math_rush", name: "Math Rush", cat: "brain", icon: "➕",
    desc: "محاسبه سریع",
    play(root, api) {
      clear(root);
      let score = 0, left = 30, combo = 0;
      const h = hud("زمان: 30");
      const stage = el('<div class="pg-stage"><div class="pg-math-q"></div><div class="pg-math-opts"></div></div>');
      root.append(h, stage);
      const qEl = stage.querySelector(".pg-math-q");
      const opts = stage.querySelector(".pg-math-opts");
      const tick = setInterval(() => {
        left--;
        h.textContent = `امتیاز: ${score} | کمبو: ${combo} | زمان: ${left}`;
        if (left <= 0) {
          clearInterval(tick);
          api.end({ score, perfect: combo >= 10 });
        }
      }, 1000);
      function next() {
        const a = 1 + Math.floor(Math.random() * 12);
        const b = 1 + Math.floor(Math.random() * 12);
        const op = Math.random() < 0.5 ? "+" : "×";
        const ans = op === "+" ? a + b : a * b;
        qEl.textContent = `${a} ${op} ${b} = ?`;
        const choices = new Set([ans]);
        while (choices.size < 4) choices.add(ans + Math.floor(Math.random() * 11) - 5);
        opts.innerHTML = "";
        [...choices].sort(() => Math.random() - 0.5).forEach((c) => {
          const b = btn(String(c), "pg-btn", () => {
            if (left <= 0) return;
            if (c === ans) {
              combo++;
              score += 5 + combo;
            } else {
              combo = 0;
              score = Math.max(0, score - 3);
            }
            next();
          });
          opts.appendChild(b);
        });
      }
      next();
    },
  };

  /* ===== 14 Number Guess ===== */
  G.number_guess = {
    id: "number_guess", name: "Number Guess", cat: "brain", icon: "❓",
    desc: "عدد ۱–۱۰۰ را حدس بزن",
    play(root, api) {
      clear(root);
      const secret = 1 + Math.floor(Math.random() * 100);
      let tries = 0;
      const stage = el('<div class="pg-stage"><p class="pg-hint">عدد بین ۱ تا ۱۰۰</p><input class="pg-input" type="number" min="1" max="100" /><button type="button" class="pg-btn pg-btn-primary">حدس</button><p class="pg-feedback"></p></div>');
      root.appendChild(stage);
      const inp = stage.querySelector("input");
      const fb = stage.querySelector(".pg-feedback");
      stage.querySelector("button").onclick = () => {
        const n = parseInt(inp.value, 10);
        if (!n) return;
        tries++;
        if (n === secret) {
          const score = Math.max(10, 110 - tries * 10);
          api.end({ score, perfect: tries <= 5 });
        } else if (n < secret) fb.textContent = "بالاتر 👆";
        else fb.textContent = "پایین‌تر 👇";
      };
    },
  };

  /* ===== 15 Mini Sudoku 4x4 ===== */
  G.mini_sudoku = {
    id: "mini_sudoku", name: "Mini Sudoku", cat: "brain", icon: "🧩",
    desc: "سودوکو ۴×۴",
    play(root, api) {
      clear(root);
      // Fixed valid 4x4 with blanks
      const puzzle = [
        [1, 0, 0, 4],
        [0, 3, 0, 0],
        [0, 0, 2, 0],
        [3, 0, 0, 1],
      ];
      const sol = [
        [1, 2, 3, 4],
        [4, 3, 1, 2],
        [2, 1, 4, 3],
        [3, 4, 2, 1],
      ];
      const grid = el('<div class="pg-sudoku"></div>');
      const cells = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const inp = document.createElement("input");
          inp.className = "pg-sudoku-cell";
          inp.inputMode = "numeric";
          inp.maxLength = 1;
          if (puzzle[r][c]) {
            inp.value = puzzle[r][c];
            inp.readOnly = true;
            inp.classList.add("fixed");
          }
          cells.push(inp);
          grid.appendChild(inp);
        }
      }
      const check = btn("بررسی", "pg-btn pg-btn-primary", () => {
        let ok = true;
        for (let i = 0; i < 16; i++) {
          const r = Math.floor(i / 4), c = i % 4;
          if (parseInt(cells[i].value, 10) !== sol[r][c]) ok = false;
        }
        if (ok) api.end({ score: 150, perfect: true });
        else api.toast("هنوز کامل نیست 😼");
      });
      root.append(grid, check);
    },
  };

  /* ===== 16 Minesweeper Mini ===== */
  G.minesweeper = {
    id: "minesweeper", name: "Minesweeper Mini", cat: "brain", icon: "💣",
    desc: "۶×۶ با ۵ بمب",
    play(root, api) {
      clear(root);
      const W = 6, H = 6, MINES = 5;
      const mines = new Set();
      while (mines.size < MINES) mines.add(Math.floor(Math.random() * W * H));
      let opened = 0, dead = false;
      const grid = el('<div class="pg-mine-grid"></div>');
      const cells = [];
      function count(i) {
        const x = i % W, y = Math.floor(i / W);
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            if (mines.has(ny * W + nx)) n++;
          }
        return n;
      }
      function open(i) {
        if (dead || cells[i].classList.contains("open")) return;
        cells[i].classList.add("open");
        if (mines.has(i)) {
          cells[i].textContent = "💣";
          dead = true;
          api.end({ score: opened * 5 });
          return;
        }
        opened++;
        const n = count(i);
        cells[i].textContent = n || "";
        if (opened >= W * H - MINES) api.end({ score: 200 + opened * 5, perfect: true });
        if (n === 0) {
          const x = i % W, y = Math.floor(i / W);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              open(ny * W + nx);
            }
        }
      }
      for (let i = 0; i < W * H; i++) {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "pg-mine-cell";
        c.addEventListener("click", () => open(i));
        cells.push(c);
        grid.appendChild(c);
      }
      root.appendChild(grid);
    },
  };

  /* ===== 17 Word Guess ===== */
  G.word_guess = {
    id: "word_guess", name: "Word Guess", cat: "brain", icon: "📝",
    desc: "کلمه انگلیسی را حدس بزن",
    play(root, api) {
      clear(root);
      const words = ["MEOW", "CAT", "PLAY", "GAME", "GLOW", "STAR", "MOON", "FISH"];
      const word = words[Math.floor(Math.random() * words.length)];
      let lives = 6;
      const guessed = new Set();
      const h = hud("❤️ ".repeat(lives));
      const wordEl = el('<div class="pg-word"></div>');
      const keys = el('<div class="pg-keys"></div>');
      root.append(h, wordEl, keys);
      function render() {
        wordEl.textContent = word
          .split("")
          .map((ch) => (guessed.has(ch) ? ch : "_"))
          .join(" ");
        if (word.split("").every((ch) => guessed.has(ch))) {
          api.end({ score: 50 + lives * 20, perfect: lives >= 5 });
        }
      }
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((ch) => {
        const b = btn(ch, "pg-key", () => {
          if (guessed.has(ch) || lives <= 0) return;
          guessed.add(ch);
          b.disabled = true;
          if (!word.includes(ch)) {
            lives--;
            h.textContent = "❤️ ".repeat(lives) || "💀";
            if (lives <= 0) api.end({ score: 0 });
          }
          render();
        });
        keys.appendChild(b);
      });
      render();
    },
  };

  /* ===== 18 Sequence ===== */
  G.sequence = {
    id: "sequence", name: "Sequence", cat: "brain", icon: "📶",
    desc: "عدد بعدی دنباله چیست؟",
    play(root, api) {
      clear(root);
      let score = 0, q = 0;
      const stage = el('<div class="pg-stage"></div>');
      root.appendChild(stage);
      function next() {
        q++;
        if (q > 8) return api.end({ score, perfect: true });
        const start = 1 + Math.floor(Math.random() * 5);
        const step = 1 + Math.floor(Math.random() * 4);
        const seq = [start, start + step, start + 2 * step, start + 3 * step];
        const ans = start + 4 * step;
        stage.innerHTML = `<p class="pg-hint">عدد بعدی؟</p><div class="pg-big-num">${seq.join(" ، ")} ، ؟</div><div class="pg-math-opts"></div>`;
        const opts = stage.querySelector(".pg-math-opts");
        const choices = new Set([ans]);
        while (choices.size < 4) choices.add(ans + Math.floor(Math.random() * 9) - 4);
        [...choices].sort(() => Math.random() - 0.5).forEach((c) => {
          opts.appendChild(
            btn(String(c), "pg-btn", () => {
              if (c === ans) score += 15;
              next();
            })
          );
        });
      }
      next();
    },
  };

  /* ===== 19 Meow Clicker ===== */
  G.meow_clicker = {
    id: "meow_clicker", name: "Meow Clicker", cat: "meow", icon: "🐱",
    desc: "روی گربه بزن!", popular: true,
    play(root, api) {
      clear(root);
      let score = 0, combo = 0, left = 12, last = 0;
      const h = hud("امتیاز: 0");
      const stage = el('<div class="pg-stage"><button type="button" class="pg-meow-btn">🐱</button></div>');
      root.append(h, stage);
      const b = stage.querySelector("button");
      const tick = setInterval(() => {
        left--;
        if (left <= 0) {
          clearInterval(tick);
          api.end({ score, perfect: score >= 150 });
        }
      }, 1000);
      b.addEventListener("click", () => {
        if (left <= 0) return;
        const now = performance.now();
        if (now - last < 400) combo++;
        else combo = 1;
        last = now;
        score += combo;
        h.textContent = `امتیاز: ${score} | کمبو ×${combo} | ${left}s`;
        b.classList.add("pulse");
        setTimeout(() => b.classList.remove("pulse"), 80);
      });
    },
  };

  /* ===== 20 Catch The Cat ===== */
  G.catch_cat = {
    id: "catch_cat", name: "Catch The Cat", cat: "meow", icon: "🐾",
    desc: "گربه را سریع بگیر", popular: true,
    play(root, api) {
      clear(root);
      let score = 0, left = 12;
      const h = hud("گربه‌ها: 12");
      const stage = el('<div class="pg-stage pg-field"></div>');
      root.append(h, stage);
      function spawn() {
        if (left <= 0) return api.end({ score });
        stage.innerHTML = "";
        const c = document.createElement("button");
        c.type = "button";
        c.className = "pg-target";
        c.textContent = "🐱";
        c.style.left = 8 + Math.random() * 75 + "%";
        c.style.top = 8 + Math.random() * 75 + "%";
        const t0 = performance.now();
        c.onclick = () => {
          score += Math.max(5, 40 - Math.floor((performance.now() - t0) / 25));
          left--;
          h.textContent = `امتیاز: ${score} | مانده: ${left}`;
          spawn();
        };
        stage.appendChild(c);
        setTimeout(() => {
          if (c.parentNode) {
            left--;
            if (left <= 0) api.end({ score });
            else spawn();
          }
        }, 1100);
      }
      spawn();
    },
  };

  /* ===== 21 Feed The Cat ===== */
  G.feed_cat = {
    id: "feed_cat", name: "Feed The Cat", cat: "meow", icon: "🐟",
    desc: "غذای درست را بده",
    play(root, api) {
      clear(root);
      const good = ["🐟", "🍗", "🥛", "🦐"];
      const bad = ["🌶️", "🍫", "🧄", "🍋"];
      let score = 0, q = 0;
      const stage = el('<div class="pg-stage"><div class="pg-meow-btn" style="pointer-events:none">🐱</div><p class="pg-hint">چی بهش بدیم؟</p><div class="pg-math-opts"></div></div>');
      root.appendChild(stage);
      function next() {
        q++;
        if (q > 10) return api.end({ score, perfect: score >= 80 });
        const isGood = Math.random() < 0.55;
        const item = isGood
          ? good[Math.floor(Math.random() * good.length)]
          : bad[Math.floor(Math.random() * bad.length)];
        const other = isGood
          ? bad[Math.floor(Math.random() * bad.length)]
          : good[Math.floor(Math.random() * good.length)];
        stage.querySelector(".pg-hint").textContent = "کدام برای پیشی بهتره؟";
        const opts = stage.querySelector(".pg-math-opts");
        opts.innerHTML = "";
        [
          { e: item, ok: isGood },
          { e: other, ok: !isGood },
        ]
          .sort(() => Math.random() - 0.5)
          .forEach((o) => {
            opts.appendChild(
              btn(o.e, "pg-btn", () => {
                if (o.ok) score += 10;
                else score = Math.max(0, score - 5);
                next();
              })
            );
          });
      }
      next();
    },
  };

  /* ===== 22-24 Cat Jump / Runner / Dodge — canvas simple ===== */
  function endlessRunner(root, api, titleEmoji) {
    clear(root);
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 200;
    canvas.className = "pg-canvas";
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let y = 140, vy = 0, score = 0, alive = true, obstacles = [];
    const ground = 160;
    function jump() {
      if (y >= ground - 1) vy = -8;
    }
    canvas.addEventListener("click", jump);
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      jump();
    }, { passive: false });
    let frame = 0;
    function loop() {
      if (!alive) return;
      frame++;
      vy += 0.45;
      y = Math.min(ground, y + vy);
      if (y >= ground) vy = 0;
      if (frame % 55 === 0) obstacles.push({ x: 320, w: 18, h: 28 + Math.random() * 20 });
      obstacles.forEach((o) => (o.x -= 3.2 + score * 0.02));
      obstacles = obstacles.filter((o) => o.x > -40);
      for (const o of obstacles) {
        if (o.x < 50 && o.x + o.w > 28 && y > ground - o.h) {
          alive = false;
          return api.end({ score: Math.floor(score) });
        }
      }
      score += 0.1;
      ctx.fillStyle = "#0c0c18";
      ctx.fillRect(0, 0, 320, 200);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(0, ground + 12, 320, 40);
      ctx.font = "24px serif";
      ctx.fillText(titleEmoji, 28, y);
      ctx.fillStyle = "#a78bfa";
      obstacles.forEach((o) => ctx.fillRect(o.x, ground - o.h + 12, o.w, o.h));
      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.fillText(Math.floor(score) + "", 8, 16);
      requestAnimationFrame(loop);
    }
    loop();
  }

  G.cat_jump = {
    id: "cat_jump", name: "Cat Jump", cat: "meow", icon: "🦘",
    desc: "بپر و از موانع رد شو",
    play(root, api) { endlessRunner(root, api, "🐱"); },
  };
  G.cat_runner = {
    id: "cat_runner", name: "Cat Runner", cat: "meow", icon: "🏃",
    desc: "Endless Runner",
    play(root, api) { endlessRunner(root, api, "😺"); },
  };
  G.cat_dodge = {
    id: "cat_dodge", name: "Cat Dodge", cat: "meow", icon: "💫",
    desc: "جاخالی گربه‌ای",
    play(root, api) { G.dodge.play(root, api); },
  };

  /* ===== 25 Find Hidden Meow ===== */
  G.find_meow = {
    id: "find_meow", name: "Find The Meow", cat: "meow", icon: "🔍",
    desc: "گربه مخفی را پیدا کن",
    play(root, api) {
      clear(root);
      let score = 0, round = 0;
      const stage = el('<div class="pg-stage"></div>');
      root.appendChild(stage);
      function next() {
        round++;
        if (round > 8) return api.end({ score, perfect: score >= 70 });
        const n = 6 + round;
        const hide = Math.floor(Math.random() * n);
        stage.innerHTML = `<p class="pg-hint">گربه کجاست؟ دور ${round}</p><div class="pg-math-opts"></div>`;
        const opts = stage.querySelector(".pg-math-opts");
        for (let i = 0; i < n; i++) {
          const emoji = i === hide ? "🐱" : ["🐶", "🐭", "🦊", "🐸", "🐼"][i % 5];
          opts.appendChild(
            btn(emoji, "pg-btn", () => {
              if (i === hide) score += 10;
              next();
            })
          );
        }
      }
      next();
    },
  };

  /* ===== 26 Meow Memory ===== */
  G.meow_memory = {
    id: "meow_memory", name: "Meow Memory", cat: "meow", icon: "🎴",
    desc: "حافظه با تم گربه",
    play(root, api) {
      G.memory_cards.play(root, api);
    },
  };

  /* ===== 27 Cat vs Mouse ===== */
  G.cat_mouse = {
    id: "cat_mouse", name: "Cat vs Mouse", cat: "meow", icon: "🐭",
    desc: "موش را قبل از فرار بگیر",
    play(root, api) {
      clear(root);
      let score = 0, left = 10;
      const h = hud("موش‌ها: 10");
      const stage = el('<div class="pg-stage pg-field"></div>');
      root.append(h, stage);
      function spawn() {
        if (left <= 0) return api.end({ score });
        const m = document.createElement("button");
        m.type = "button";
        m.className = "pg-target small";
        m.textContent = "🐭";
        m.style.left = 5 + Math.random() * 80 + "%";
        m.style.top = 5 + Math.random() * 80 + "%";
        stage.appendChild(m);
        const t = setTimeout(() => {
          m.remove();
          left--;
          if (left <= 0) api.end({ score });
          else spawn();
        }, 900 - Math.min(400, score * 2));
        m.onclick = () => {
          clearTimeout(t);
          m.remove();
          score += 15;
          left--;
          h.textContent = `امتیاز: ${score} | مانده: ${left}`;
          if (left <= 0) api.end({ score });
          else spawn();
        };
      }
      spawn();
    },
  };

  /* ===== 28 Meow Catch ===== */
  G.meow_catch = {
    id: "meow_catch", name: "Meow Catch", cat: "meow", icon: "✨",
    desc: "فقط ستاره و ماهی — نه بمب",
    play(root, api) {
      G.falling.play(root, api);
    },
  };

  /* ===== 29 Snake ===== */
  G.snake = {
    id: "snake", name: "Snake", cat: "arcade", icon: "🐍",
    desc: "مار کلاسیک", popular: true,
    play(root, api) {
      clear(root);
      const canvas = document.createElement("canvas");
      canvas.width = 300; canvas.height = 300;
      canvas.className = "pg-canvas";
      root.appendChild(canvas);
      const pad = el('<div class="pg-dpad"><button data-d="u">▲</button><div><button data-d="l">◀</button><button data-d="d">▼</button><button data-d="r">▶</button></div></div>');
      root.appendChild(pad);
      const ctx = canvas.getContext("2d");
      const cell = 15;
      let snake = [{ x: 10, y: 10 }], dir = { x: 1, y: 0 }, food = { x: 15, y: 10 }, score = 0, alive = true;
      function placeFood() {
        food = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20),
        };
      }
      pad.querySelectorAll("button").forEach((b) => {
        b.onclick = () => {
          const d = b.dataset.d;
          if (d === "u" && dir.y !== 1) dir = { x: 0, y: -1 };
          if (d === "d" && dir.y !== -1) dir = { x: 0, y: 1 };
          if (d === "l" && dir.x !== 1) dir = { x: -1, y: 0 };
          if (d === "r" && dir.x !== -1) dir = { x: 1, y: 0 };
        };
      });
      const iv = setInterval(() => {
        if (!alive) return;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20 || snake.some((s) => s.x === head.x && s.y === head.y)) {
          alive = false;
          clearInterval(iv);
          return api.end({ score });
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 10;
          placeFood();
        } else snake.pop();
        ctx.fillStyle = "#0c0c18";
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(food.x * cell, food.y * cell, cell - 1, cell - 1);
        ctx.fillStyle = "#a78bfa";
        snake.forEach((s, i) => {
          ctx.fillStyle = i === 0 ? "#ff6bcb" : "#a78bfa";
          ctx.fillRect(s.x * cell, s.y * cell, cell - 1, cell - 1);
        });
      }, 120);
    },
  };

  /* ===== 30 Breakout ===== */
  G.breakout = {
    id: "breakout", name: "Breakout", cat: "arcade", icon: "🧱",
    desc: "آجرها را خرد کن", popular: true,
    play(root, api) {
      clear(root);
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 240;
      canvas.className = "pg-canvas";
      root.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let px = 130, ball = { x: 160, y: 180, vx: 2.2, vy: -2.5 }, score = 0, alive = true;
      const bricks = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 8; c++)
          bricks.push({ x: 8 + c * 39, y: 20 + r * 16, w: 35, h: 12, live: true });
      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        px = ((e.clientX - rect.left) / rect.width) * 320 - 30;
      });
      canvas.addEventListener("touchmove", (e) => {
        const rect = canvas.getBoundingClientRect();
        px = ((e.touches[0].clientX - rect.left) / rect.width) * 320 - 30;
      }, { passive: true });
      function loop() {
        if (!alive) return;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < 5 || ball.x > 315) ball.vx *= -1;
        if (ball.y < 5) ball.vy *= -1;
        if (ball.y > 230) {
          alive = false;
          return api.end({ score });
        }
        if (ball.y > 200 && ball.x > px && ball.x < px + 60) ball.vy = -Math.abs(ball.vy);
        bricks.forEach((b) => {
          if (!b.live) return;
          if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
            b.live = false;
            ball.vy *= -1;
            score += 10;
          }
        });
        if (bricks.every((b) => !b.live)) {
          alive = false;
          return api.end({ score: score + 100, perfect: true });
        }
        ctx.fillStyle = "#0c0c18";
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = "#a78bfa";
        ctx.fillRect(px, 210, 60, 8);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff6bcb";
        ctx.fill();
        bricks.forEach((b) => {
          if (!b.live) return;
          ctx.fillStyle = "#67e8f9";
          ctx.fillRect(b.x, b.y, b.w, b.h);
        });
        requestAnimationFrame(loop);
      }
      loop();
    },
  };

  /* ===== 31 Pong ===== */
  G.pong = {
    id: "pong", name: "Pong", cat: "arcade", icon: "🏓",
    desc: "مقابل AI ساده",
    play(root, api) {
      clear(root);
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 200;
      canvas.className = "pg-canvas";
      root.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let py = 80, ay = 80, ball = { x: 160, y: 100, vx: 2.5, vy: 1.5 }, score = 0, alive = true;
      canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        py = ((e.clientY - r.top) / r.height) * 200 - 25;
      });
      canvas.addEventListener("touchmove", (e) => {
        const r = canvas.getBoundingClientRect();
        py = ((e.touches[0].clientY - r.top) / r.height) * 200 - 25;
      }, { passive: true });
      function loop() {
        if (!alive) return;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.y < 0 || ball.y > 200) ball.vy *= -1;
        ay += (ball.y - ay - 25) * 0.08;
        if (ball.x < 18 && ball.y > py && ball.y < py + 50) ball.vx = Math.abs(ball.vx);
        if (ball.x > 302 && ball.y > ay && ball.y < ay + 50) ball.vx = -Math.abs(ball.vx);
        if (ball.x < 0) {
          alive = false;
          return api.end({ score });
        }
        if (ball.x > 320) {
          score++;
          ball = { x: 160, y: 100, vx: -2.5, vy: 1.5 };
        }
        ctx.fillStyle = "#0c0c18";
        ctx.fillRect(0, 0, 320, 200);
        ctx.fillStyle = "#fff";
        ctx.fillRect(8, py, 8, 50);
        ctx.fillRect(304, ay, 8, 50);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(score + "", 150, 20);
        requestAnimationFrame(loop);
      }
      loop();
    },
  };

  /* ===== 32 Stack ===== */
  G.stack = {
    id: "stack", name: "Stack", cat: "arcade", icon: "📦",
    desc: "بلوک‌ها را دقیق بچین",
    play(root, api) {
      clear(root);
      let width = 80, x = 0, dir = 1, stackY = 180, score = 0, moving = true;
      const canvas = document.createElement("canvas");
      canvas.width = 280; canvas.height = 220;
      canvas.className = "pg-canvas";
      root.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const blocks = [{ x: 100, w: 80, y: 200 }];
      function frame() {
        if (!moving) return;
        x += dir * 2.5;
        if (x < 0 || x + width > 280) dir *= -1;
        ctx.fillStyle = "#0c0c18";
        ctx.fillRect(0, 0, 280, 220);
        blocks.forEach((b, i) => {
          ctx.fillStyle = i === blocks.length - 1 ? "#ff6bcb" : "#a78bfa";
          ctx.fillRect(b.x, b.y, b.w, 16);
        });
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(x, stackY, width, 16);
        requestAnimationFrame(frame);
      }
      canvas.onclick = () => {
        if (!moving) return;
        const prev = blocks[blocks.length - 1];
        const left = Math.max(x, prev.x);
        const right = Math.min(x + width, prev.x + prev.w);
        const newW = right - left;
        if (newW < 8) {
          moving = false;
          return api.end({ score });
        }
        width = newW;
        x = left;
        stackY -= 18;
        blocks.push({ x: left, w: newW, y: stackY + 18 });
        score++;
        if (stackY < 20) {
          moving = false;
          api.end({ score: score + 50, perfect: true });
        }
      };
      frame();
    },
  };

  /* ===== 33 Endless Runner ===== */
  G.endless_runner = {
    id: "endless_runner", name: "Endless Runner", cat: "arcade", icon: "🏃",
    desc: "تا جایی که می‌تونی بدو",
    play(root, api) { endlessRunner(root, api, "🚀"); },
  };

  /* ===== 34 Space Dodge ===== */
  G.space_dodge = {
    id: "space_dodge", name: "Space Dodge", cat: "arcade", icon: "🚀",
    desc: "سفینه را نجات بده",
    play(root, api) {
      clear(root);
      const canvas = document.createElement("canvas");
      canvas.width = 300; canvas.height = 220;
      canvas.className = "pg-canvas";
      root.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let x = 140, score = 0, asteroids = [], alive = true;
      canvas.addEventListener("click", (e) => {
        const r = canvas.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width) * 300 - 15;
      });
      function loop() {
        if (!alive) return;
        if (Math.random() < 0.04) asteroids.push({ x: Math.random() * 280, y: -10, s: 12 + Math.random() * 14 });
        asteroids.forEach((a) => (a.y += 2.5 + score * 0.01));
        asteroids = asteroids.filter((a) => a.y < 240);
        for (const a of asteroids) {
          if (a.y > 175 && a.y < 200 && Math.abs(a.x - x) < a.s) {
            alive = false;
            return api.end({ score: Math.floor(score) });
          }
        }
        score += 0.15;
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, 300, 220);
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(x, 185, 30, 14);
        ctx.fillStyle = "#a78bfa";
        asteroids.forEach((a) => {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.s / 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = "#fff";
        ctx.fillText(Math.floor(score) + "", 8, 16);
        requestAnimationFrame(loop);
      }
      loop();
    },
  };

  /* ===== 35 Brick Breaker alias ===== */
  G.brick_breaker = {
    id: "brick_breaker", name: "Brick Breaker", cat: "arcade", icon: "💥",
    desc: "نسخه آرکید آجرشکن",
    play(root, api) { G.breakout.play(root, api); },
  };

  /* ===== Casual ===== */
  G.coin_flip = {
    id: "coin_flip", name: "Coin Flip", cat: "random", icon: "🪙",
    desc: "شیر یا خط",
    play(root, api) {
      clear(root);
      const stage = el('<div class="pg-stage"><div class="pg-coin">🪙</div><div class="pg-math-opts"></div></div>');
      root.appendChild(stage);
      const coin = stage.querySelector(".pg-coin");
      const opts = stage.querySelector(".pg-math-opts");
      ["شیر", "خط"].forEach((side) => {
        opts.appendChild(
          btn(side, "pg-btn pg-btn-primary", () => {
            coin.classList.add("spin");
            setTimeout(() => {
              const res = Math.random() < 0.5 ? "شیر" : "خط";
              coin.textContent = res === "شیر" ? "🪙" : "⚪";
              coin.classList.remove("spin");
              const win = res === side;
              api.end({ score: win ? 50 : 10, label: res });
            }, 800);
          })
        );
      });
    },
  };

  G.dice = {
    id: "dice", name: "Dice", cat: "random", icon: "🎲",
    desc: "تاس بنداز",
    play(root, api) {
      clear(root);
      const stage = el('<div class="pg-stage"><div class="pg-big-num">🎲</div></div>');
      root.appendChild(stage);
      const n = stage.querySelector(".pg-big-num");
      root.appendChild(
        btn("Roll!", "pg-btn pg-btn-primary", () => {
          let i = 0;
          const iv = setInterval(() => {
            n.textContent = String(1 + Math.floor(Math.random() * 6));
            i++;
            if (i > 12) {
              clearInterval(iv);
              const v = 1 + Math.floor(Math.random() * 6);
              n.textContent = "🎲 " + v;
              api.end({ score: v * 10, label: String(v) });
            }
          }, 60);
        })
      );
    },
  };

  G.lucky_number = {
    id: "lucky_number", name: "Lucky Number", cat: "random", icon: "🍀",
    desc: "عدد شانس امروزت",
    play(root, api) {
      clear(root);
      const n = 1 + Math.floor(Math.random() * 99);
      root.appendChild(el(`<div class="pg-stage"><p class="pg-hint">عدد شانس تو</p><div class="pg-big-num">${n}</div></div>`));
      setTimeout(() => api.end({ score: n, label: String(n) }), 1200);
    },
  };

  G.random_picker = {
    id: "random_picker", name: "Random Picker", cat: "random", icon: "🎡",
    desc: "یکی از گزینه‌ها را انتخاب کن",
    play(root, api) {
      clear(root);
      const stage = el('<div class="pg-stage"><p class="pg-hint">هر خط یک گزینه</p><textarea class="pg-textarea" rows="4" placeholder="پیتزا&#10;برگر&#10;سوشی"></textarea></div>');
      root.appendChild(stage);
      root.appendChild(
        btn("انتخاب تصادفی", "pg-btn pg-btn-primary", () => {
          const lines = stage
            .querySelector("textarea")
            .value.split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          if (lines.length < 2) return api.toast("حداقل ۲ گزینه بنویس");
          const pick = lines[Math.floor(Math.random() * lines.length)];
          api.end({ score: 25, label: pick });
        })
      );
    },
  };

  G.higher_lower = {
    id: "higher_lower", name: "Higher or Lower", cat: "random", icon: "↕️",
    desc: "عدد بعدی بالاتر است یا پایین‌تر؟",
    play(root, api) {
      clear(root);
      let cur = 1 + Math.floor(Math.random() * 13), score = 0;
      const stage = el('<div class="pg-stage"><div class="pg-big-num"></div><div class="pg-math-opts"></div></div>');
      root.appendChild(stage);
      function show() {
        stage.querySelector(".pg-big-num").textContent = cur;
        const opts = stage.querySelector(".pg-math-opts");
        opts.innerHTML = "";
        ["بالاتر", "پایین‌تر"].forEach((lab) => {
          opts.appendChild(
            btn(lab, "pg-btn", () => {
              const next = 1 + Math.floor(Math.random() * 13);
              const higher = next > cur;
              const ok = (lab === "بالاتر" && higher) || (lab === "پایین‌تر" && !higher) || next === cur;
              if (ok && next !== cur) {
                score += 10;
                cur = next;
                if (score >= 100) return api.end({ score, perfect: true });
                show();
              } else if (next === cur) {
                cur = next;
                show();
              } else api.end({ score });
            })
          );
        });
      }
      show();
    },
  };

  G.mystery_box = {
    id: "mystery_box", name: "Mystery Box", cat: "random", icon: "🎁",
    desc: "یکی را باز کن",
    play(root, api) {
      clear(root);
      const prizes = ["⭐", "🐟", "🎾", "💤", "🌈", "🍩"];
      const stage = el('<div class="pg-stage"><div class="pg-math-opts"></div></div>');
      root.appendChild(stage);
      const opts = stage.querySelector(".pg-math-opts");
      for (let i = 0; i < 3; i++) {
        opts.appendChild(
          btn("🎁", "pg-btn", function handler() {
            opts.querySelectorAll("button").forEach((b) => (b.onclick = null));
            const p = prizes[Math.floor(Math.random() * prizes.length)];
            this.textContent = p;
            api.end({ score: 30 + Math.floor(Math.random() * 40), label: p });
          })
        );
      }
    },
  };

  G.wheel = {
    id: "wheel", name: "Lucky Wheel", cat: "random", icon: "🌀",
    desc: "چرخ شانس — فقط سرگرمی",
    play(root, api) {
      clear(root);
      const items = ["میو!", "دوباره", "آفرین", "💤", "⭐", "🐟"];
      const stage = el('<div class="pg-stage"><div class="pg-big-num">🌀</div></div>');
      root.appendChild(stage);
      const n = stage.querySelector(".pg-big-num");
      root.appendChild(
        btn("بچرخون", "pg-btn pg-btn-primary", () => {
          let i = 0;
          const iv = setInterval(() => {
            n.textContent = items[i % items.length];
            i++;
            if (i > 16) {
              clearInterval(iv);
              const pick = items[Math.floor(Math.random() * items.length)];
              n.textContent = pick;
              api.end({ score: 20, label: pick });
            }
          }, 70);
        })
      );
    },
  };

  /* Catalog */
  const CATALOG = Object.values(G).filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx);

  w.MeowGames = { registry: G, catalog: CATALOG };
})(window);
