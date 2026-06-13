document.addEventListener("DOMContentLoaded", function () {

  // ── Scroll Progress Bar ────────────────────────────────
  var scrollBar = document.getElementById("scrollBar");
  window.addEventListener("scroll", function () {
    var scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollBar.style.width = pct + "%";
  });

  // ── Typing Animation ───────────────────────────────────
  var typedEl  = document.getElementById("typedLine");
  var text     = "Notes.";
  var i        = 0;
  function type() {
    if (i <= text.length) {
      typedEl.textContent = text.slice(0, i);
      i++;
      setTimeout(type, i === 1 ? 400 : 120);
    } else {
      typedEl.classList.add("done");
    }
  }
  setTimeout(type, 600);

  // ── Particle / Grid Background ─────────────────────────
  var canvas = document.getElementById("heroCanvas");
  var ctx    = canvas.getContext("2d");
  var dots   = [];
  var DOT_COUNT = 60;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function initDots() {
    dots = [];
    for (var d = 0; d < DOT_COUNT; d++) {
      dots.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  Math.random() * 1.5 + 0.5
      });
    }
  }

  function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var a = 0; a < dots.length; a++) {
      var da = dots[a];
      da.x += da.vx;
      da.y += da.vy;
      if (da.x < 0 || da.x > canvas.width)  da.vx *= -1;
      if (da.y < 0 || da.y > canvas.height)  da.vy *= -1;

      ctx.beginPath();
      ctx.arc(da.x, da.y, da.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,20,60,0.18)";
      ctx.fill();

      for (var b = a + 1; b < dots.length; b++) {
        var db   = dots[b];
        var dist = Math.hypot(da.x - db.x, da.y - db.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(da.x, da.y);
          ctx.lineTo(db.x, db.y);
          ctx.strokeStyle = "rgba(220,20,60," + (0.06 * (1 - dist / 100)) + ")";
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawDots);
  }

  resizeCanvas();
  initDots();
  drawDots();
  window.addEventListener("resize", function () { resizeCanvas(); initDots(); });

  // ── Real Visitor Counter (counterapi.dev) ──────────────
  // Free, no account needed — auto-creates on first request.
  // Namespace: ace-bca-portal | Key: bca-visits
  var badge = document.getElementById("visitorBadge");

  fetch("https://counterapi.dev/api/ace-bca-portal/bca-visits?action=up")
    .then(function (r) {
      if (!r.ok) throw new Error("Counter API error: " + r.status);
      return r.json();
    })
    .then(function (data) {
      var count = data.count || data.value || 0;
      badge.textContent = "👁 " + count.toLocaleString() + " visit" + (count === 1 ? "" : "s");
    })
    .catch(function () {
      // Silently hide if API is unavailable — don't break the page
      badge.style.display = "none";
    });

  // ── Copy Link Button ───────────────────────────────────
  var copyBtn   = document.getElementById("copyLinkBtn");
  var copyToast = document.getElementById("copyToast");
  var toastTimer;

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = window.location.href.split("#")[0];
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(showToast).catch(fallbackCopy.bind(null, url));
      } else {
        fallbackCopy(url);
      }
    });
  }

  function fallbackCopy(url) {
    var ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity  = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast();
  }

  function showToast() {
    clearTimeout(toastTimer);
    copyToast.classList.add("show");
    toastTimer = setTimeout(function () { copyToast.classList.remove("show"); }, 2200);
  }

  // ── Accordion ──────────────────────────────────────────
  document.querySelectorAll(".sem-header").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = this.dataset.target;
      var content  = document.getElementById(targetId);
      var chevron  = this.querySelector(".chevron");
      var isOpen   = content.classList.contains("active");

      document.querySelectorAll(".sem-content").forEach(function (c) { c.classList.remove("active"); });
      document.querySelectorAll(".chevron").forEach(function (c)      { c.classList.remove("rotated"); });
      document.querySelectorAll(".sem-header").forEach(function (b)   { b.setAttribute("aria-expanded", "false"); });

      if (!isOpen) {
        content.classList.add("active");
        chevron.classList.add("rotated");
        this.setAttribute("aria-expanded", "true");
      }
    });
  });

  // ── Music Player ───────────────────────────────────────
  var music = document.getElementById("bg-music");
  var btn   = document.getElementById("music-btn");
  var icon  = document.getElementById("music-icon");
  var label = document.getElementById("music-label");
  var bar   = document.getElementById("musicBar");

  if (music && btn) {
    btn.addEventListener("click", function () {
      if (music.paused) {
        music.play().catch(function () {});
        icon.textContent  = "⏸";
        label.textContent = "Now Playing";
        bar.classList.add("playing");
      } else {
        music.pause();
        icon.textContent  = "▶";
        label.textContent = "Play BGM";
        bar.classList.remove("playing");
      }
    });
  }

});
