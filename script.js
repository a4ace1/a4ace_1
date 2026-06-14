"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* ══════════════════════════════════════════════
     1. SCROLL PROGRESS BAR
  ══════════════════════════════════════════════ */
  var scrollBar = document.getElementById("scrollBar");
  window.addEventListener("scroll", function () {
    var top = document.documentElement.scrollTop || document.body.scrollTop;
    var h   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollBar.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
  }, { passive: true });


  /* ══════════════════════════════════════════════
     2. LIVE CLOCK
  ══════════════════════════════════════════════ */
  var clockEl = document.getElementById("navClock");
  var DAYS  = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  var MONTHS= ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tickClock() {
    var now = new Date();
    var d   = DAYS[now.getDay()];
    var mo  = MONTHS[now.getMonth()];
    var dt  = pad(now.getDate());
    var h   = pad(now.getHours());
    var m   = pad(now.getMinutes());
    var s   = pad(now.getSeconds());
    clockEl.textContent = d + " " + dt + " " + mo + " · " + h + ":" + m + ":" + s;
  }
  tickClock();
  setInterval(tickClock, 1000);


  /* ══════════════════════════════════════════════
     3. DARK / LIGHT MODE TOGGLE
  ══════════════════════════════════════════════ */
  var html         = document.documentElement;
  var themeToggle  = document.getElementById("themeToggle");
  var savedTheme   = localStorage.getItem("bca-theme") || "dark";

  function applyTheme(t) {
    html.setAttribute("data-theme", t);
    themeToggle.textContent = t === "dark" ? "☀" : "🌙";
    localStorage.setItem("bca-theme", t);
  }

  applyTheme(savedTheme);

  themeToggle.addEventListener("click", function () {
    applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });


  /* ══════════════════════════════════════════════
     4. TYPING ANIMATION (hero)
  ══════════════════════════════════════════════ */
  var typedEl = document.getElementById("typedLine");
  var cursorEl = document.querySelector(".cursor-blink");
  var heroText = "Notes.";
  var idx = 0;

  function typeHero() {
    if (idx <= heroText.length) {
      typedEl.textContent = heroText.slice(0, idx);
      idx++;
      setTimeout(typeHero, idx === 1 ? 500 : 110);
    } else {
      if (cursorEl) cursorEl.classList.add("hidden");
    }
  }
  setTimeout(typeHero, 700);


  /* ══════════════════════════════════════════════
     5. PARTICLE CANVAS
  ══════════════════════════════════════════════ */
  var canvas = document.getElementById("heroCanvas");
  var ctx    = canvas.getContext("2d");
  var dots   = [];
  var N      = 55;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function initDots() {
    dots = [];
    for (var i = 0; i < N; i++) {
      dots.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.4 + 0.4
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
      ctx.fillStyle = "rgba(220,20,60,0.2)";
      ctx.fill();

      for (var b = a + 1; b < dots.length; b++) {
        var db   = dots[b];
        var dist = Math.hypot(da.x - db.x, da.y - db.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(da.x, da.y);
          ctx.lineTo(db.x, db.y);
          ctx.strokeStyle = "rgba(220,20,60," + (0.07 * (1 - dist / 110)) + ")";
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

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resizeCanvas(); initDots(); }, 200);
  });


  /* ══════════════════════════════════════════════
     6. VISITOR COUNTER
  ══════════════════════════════════════════════ */
  var badge = document.getElementById("visitorBadge");
  fetch("https://counterapi.dev/api/ace-bca-portal/bca-visits?action=up")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      var c = d.count || d.value || 0;
      badge.textContent = "👁 " + c.toLocaleString() + " visit" + (c === 1 ? "" : "s");
    })
    .catch(function () { badge.style.display = "none"; });


  /* ══════════════════════════════════════════════
     7. COPY LINK
  ══════════════════════════════════════════════ */
  var copyBtn   = document.getElementById("copyLinkBtn");
  var copyToast = document.getElementById("copyToast");
  var toastTimer;

  function showToast() {
    clearTimeout(toastTimer);
    copyToast.classList.add("show");
    toastTimer = setTimeout(function () { copyToast.classList.remove("show"); }, 2200);
  }

  function fallbackCopy(url) {
    var ta = document.createElement("textarea");
    ta.value = url; ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast();
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = window.location.href.split("#")[0];
      navigator.clipboard
        ? navigator.clipboard.writeText(url).then(showToast).catch(function () { fallbackCopy(url); })
        : fallbackCopy(url);
    });
  }


  /* ══════════════════════════════════════════════
     8. MOBILE NAV HAMBURGER
  ══════════════════════════════════════════════ */
  var hamburger   = document.getElementById("navHamburger");
  var mobileMenu  = document.getElementById("navMobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll(".nm-link").forEach(function (l) {
      l.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
    });
  }


  /* ══════════════════════════════════════════════
     9. SEMESTER ACCORDION
  ══════════════════════════════════════════════ */
  document.querySelectorAll(".sem-header").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id      = this.dataset.target;
      var content = document.getElementById(id);
      var chevron = this.querySelector(".chevron");
      var isOpen  = content.classList.contains("active");

      document.querySelectorAll(".sem-content").forEach(function (c) { c.classList.remove("active"); });
      document.querySelectorAll(".chevron").forEach(function (c)      { c.classList.remove("rotated"); });
      document.querySelectorAll(".sem-header").forEach(function (b)   { b.setAttribute("aria-expanded","false"); });

      if (!isOpen) {
        content.classList.add("active");
        chevron.classList.add("rotated");
        this.setAttribute("aria-expanded", "true");
      }
    });
  });


  /* ══════════════════════════════════════════════
     10. RESOURCE MODAL
  ══════════════════════════════════════════════ */
  var overlay   = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalCta  = document.getElementById("modalCta");

  function openModal(card) {
    document.getElementById("modalEyebrow").textContent =
      (card.dataset.sem || "Semester 2").toUpperCase() + " · LIVE";
    document.getElementById("modalIcon").textContent  = card.dataset.icon  || "📄";
    document.getElementById("modalTitle").textContent = card.dataset.title || "Notes";
    document.getElementById("modalDesc").textContent  = card.dataset.desc  || "";
    modalCta.href = card.href;

    var tagsEl = document.getElementById("modalTags");
    tagsEl.innerHTML = "";
    (card.dataset.tags || "").split(",").forEach(function (t) {
      if (!t.trim()) return;
      var span = document.createElement("span");
      span.className = "modal-tag";
      span.textContent = t.trim();
      tagsEl.appendChild(span);
    });

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".resource-card[data-modal='true']").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(this);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });


  /* ══════════════════════════════════════════════
     11. MUSIC PLAYER
  ══════════════════════════════════════════════ */
  var music = document.getElementById("bg-music");
  var mBtn  = document.getElementById("music-btn");
  var mIcon = document.getElementById("music-icon");
  var mLbl  = document.getElementById("music-label");
  var mBar  = document.getElementById("musicBar");

  if (music && mBtn) {
    mBtn.addEventListener("click", function () {
      if (music.paused) {
        music.play().catch(function () {});
        mIcon.textContent = "⏸";
        mLbl.textContent  = "Now Playing";
        mBar.classList.add("playing");
      } else {
        music.pause();
        mIcon.textContent = "▶";
        mLbl.textContent  = "Play BGM";
        mBar.classList.remove("playing");
      }
    });
  }


  /* ══════════════════════════════════════════════
     12. HERO BACKGROUND VIDEO — graceful fallback
     If background.mp4 fails to load/decode/play, hide the
     <video> element so the existing dark gradient background
     (body::before + .hero::before/::after) shows through
     the glass layer instead.
  ══════════════════════════════════════════════ */
  var heroVideo = document.getElementById("heroVideo");

  if (heroVideo) {
    var hideHeroVideo = function () {
      heroVideo.classList.add("video-fallback");
    };

    // Fires if the <source> 404s or the format is unsupported
    heroVideo.addEventListener("error", hideHeroVideo, true);

    // Fires if loading stalls indefinitely (e.g. network issue)
    heroVideo.addEventListener("stalled", function () {
      if (heroVideo.readyState === 0) hideHeroVideo();
    });

    // Some mobile browsers block autoplay even when muted;
    // catch that and fall back gracefully too.
    var playAttempt = heroVideo.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(hideHeroVideo);
    }

    // Respect reduced-motion / reduced-data preferences
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reduceData   = window.matchMedia("(prefers-reduced-data: reduce)").matches;
    if (reduceMotion || reduceData) {
      heroVideo.pause();
      hideHeroVideo();
    }
  }


  /* ══════════════════════════════════════════════
     13. TYPING SPEED GAME
  ══════════════════════════════════════════════ */
  var SENTENCES = [
    "A stack follows the Last In First Out principle and is used in recursive algorithms.",
    "Binary search reduces time complexity to O log n by dividing the search space in half.",
    "Object oriented programming organizes code into classes and objects with encapsulation.",
    "A linked list stores data in nodes where each node points to the next in the sequence.",
    "The operating system manages hardware resources and provides services to applications.",
    "SQL stands for Structured Query Language and is used to manage relational databases.",
    "Recursion is when a function calls itself with a smaller input until reaching the base case.",
    "A queue follows the First In First Out order and is used in scheduling algorithms.",
    "Inheritance allows a child class to reuse properties and methods of a parent class.",
    "A primary key uniquely identifies each record in a database table without duplicates.",
    "Polymorphism allows the same function name to behave differently based on the input.",
    "An array stores elements of the same type in contiguous memory locations by index.",
    "A compiler translates the entire source code into machine code before execution begins.",
    "The CPU fetches decodes and executes instructions in the fetch decode execute cycle."
  ];

  var typingDisplay = document.getElementById("typingDisplay");
  var typingInput   = document.getElementById("typingInput");
  var typingReset   = document.getElementById("typingReset");
  var wpmVal        = document.getElementById("wpmVal");
  var accVal        = document.getElementById("accVal");
  var timeVal       = document.getElementById("timeVal");
  var typingStatus  = document.getElementById("typingStatus");

  var currentSentence = "";
  var typingTimer     = null;
  var timeLeft        = 30;
  var started         = false;
  var totalTyped      = 0;
  var totalCorrect    = 0;
  var finished        = false;

  function pickSentence() {
    var i = Math.floor(Math.random() * SENTENCES.length);
    return SENTENCES[i];
  }

  function renderDisplay(typed) {
    var html = "";
    for (var i = 0; i < currentSentence.length; i++) {
      var ch = currentSentence[i];
      var cls;
      if (i < typed.length) {
        cls = typed[i] === ch ? "char-correct" : "char-wrong";
      } else if (i === typed.length) {
        cls = "char-pending char-cursor";
      } else {
        cls = "char-pending";
      }
      html += '<span class="' + cls + '">' + (ch === " " ? "&nbsp;" : ch) + "</span>";
    }
    typingDisplay.innerHTML = html;
  }

  function calcWPM() {
    var elapsed = 30 - timeLeft;
    if (elapsed <= 0) return 0;
    return Math.round((totalCorrect / 5) / (elapsed / 60));
  }

  function calcAcc() {
    if (totalTyped === 0) return 100;
    return Math.round((totalCorrect / totalTyped) * 100);
  }

  function startTimer() {
    started = true;
    typingStatus.textContent = "⏱ timer running...";
    typingTimer = setInterval(function () {
      timeLeft--;
      timeVal.textContent = timeLeft;
      wpmVal.textContent  = calcWPM();
      accVal.textContent  = calcAcc();
      if (timeLeft <= 0) endTypingGame();
    }, 1000);
  }

  function endTypingGame() {
    clearInterval(typingTimer);
    finished = true;
    typingInput.disabled = true;
    var wpm = calcWPM();
    var acc = calcAcc();
    wpmVal.textContent  = wpm;
    accVal.textContent  = acc;
    timeVal.textContent = "0";
    var grade = wpm >= 60 ? "🔥 Fast!" : wpm >= 40 ? "✅ Good" : wpm >= 20 ? "📈 Keep practicing" : "🐢 Slow down and focus";
    typingStatus.textContent = grade + " · " + wpm + " WPM · " + acc + "% accuracy";
  }

  function resetTypingGame() {
    clearInterval(typingTimer);
    currentSentence  = pickSentence();
    timeLeft         = 30;
    started          = false;
    finished         = false;
    totalTyped       = 0;
    totalCorrect     = 0;
    typingInput.value    = "";
    typingInput.disabled = false;
    wpmVal.textContent   = "--";
    accVal.textContent   = "--";
    timeVal.textContent  = "30";
    typingStatus.textContent = "timer starts on first keystroke";
    renderDisplay("");
    typingInput.focus();
  }

  typingInput.addEventListener("input", function () {
    if (finished) return;
    if (!started) startTimer();
    var typed = typingInput.value;
    totalTyped   = typed.length;
    totalCorrect = 0;
    for (var i = 0; i < typed.length && i < currentSentence.length; i++) {
      if (typed[i] === currentSentence[i]) totalCorrect++;
    }
    renderDisplay(typed);
    wpmVal.textContent = calcWPM();
    accVal.textContent = calcAcc();
    if (typed.length >= currentSentence.length) endTypingGame();
  });

  typingReset.addEventListener("click", resetTypingGame);
  resetTypingGame();


  /* ══════════════════════════════════════════════
     14. BCA QUIZ GAME
  ══════════════════════════════════════════════ */
  var QUESTIONS = [
    {
      q: "What does 'LIFO' stand for in Data Structures?",
      opts: ["Last In First Out","Last Index Fixed Order","Linear Input Flow Output","Linked Index Forward Operation"],
      ans: 0
    },
    {
      q: "Which data structure uses FIFO (First In First Out) order?",
      opts: ["Stack","Tree","Queue","Heap"],
      ans: 2
    },
    {
      q: "What is the time complexity of binary search on a sorted array?",
      opts: ["O(n)","O(n²)","O(log n)","O(1)"],
      ans: 2
    },
    {
      q: "Which concept in OOP allows a class to inherit properties from another class?",
      opts: ["Encapsulation","Polymorphism","Abstraction","Inheritance"],
      ans: 3
    },
    {
      q: "In C++, which keyword is used to define a class?",
      opts: ["struct","object","class","define"],
      ans: 2
    },
    {
      q: "What does RAM stand for?",
      opts: ["Read Access Memory","Random Access Memory","Read And Modify","Random Array Module"],
      ans: 1
    },
    {
      q: "Which of the following is a non-linear data structure?",
      opts: ["Array","Linked List","Stack","Tree"],
      ans: 3
    },
    {
      q: "What does SQL stand for?",
      opts: ["Structured Query Language","Simple Queue Logic","System Query Layer","Sequential Query Language"],
      ans: 0
    },
    {
      q: "What is a 'deadlock' in operating systems?",
      opts: [
        "When a program crashes unexpectedly",
        "When two or more processes wait forever for each other's resources",
        "When CPU usage hits 100%",
        "When memory runs out completely"
      ],
      ans: 1
    },
    {
      q: "Which layer of the OSI model handles IP addressing?",
      opts: ["Transport","Data Link","Network","Session"],
      ans: 2
    },
    {
      q: "What is the output of 5 % 2 in C++?",
      opts: ["2","2.5","1","0"],
      ans: 2
    },
    {
      q: "Which sorting algorithm has the best average time complexity?",
      opts: ["Bubble Sort","Insertion Sort","Quick Sort","Selection Sort"],
      ans: 2
    }
  ];

  var quizQuestion = document.getElementById("quizQuestion");
  var quizOptions  = document.getElementById("quizOptions");
  var quizScore    = document.getElementById("quizScore");
  var quizQNum     = document.getElementById("quizQNum");
  var quizFeedback = document.getElementById("quizFeedback");
  var quizStart    = document.getElementById("quizStart");
  var quizNext     = document.getElementById("quizNext");
  var quizRestart  = document.getElementById("quizRestart");

  var qPool        = [];
  var qIndex       = 0;
  var score        = 0;
  var answered     = false;
  var TOTAL_Q      = 10;

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function startQuiz() {
    qPool    = shuffleArray(QUESTIONS).slice(0, TOTAL_Q);
    qIndex   = 0;
    score    = 0;
    quizStart.style.display   = "none";
    quizRestart.style.display = "none";
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    var q    = qPool[qIndex];
    quizQNum.textContent      = "Q" + (qIndex + 1) + " / " + TOTAL_Q;
    quizScore.textContent     = "Score: " + score + " / " + qIndex;
    quizQuestion.textContent  = q.q;
    quizFeedback.textContent  = "";
    quizFeedback.className    = "quiz-feedback";
    quizNext.style.display    = "none";
    quizOptions.innerHTML     = "";

    q.opts.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.className   = "quiz-opt";
      btn.textContent = opt;
      btn.addEventListener("click", function () { selectAnswer(i, q.ans); });
      quizOptions.appendChild(btn);
    });
  }

  function selectAnswer(chosen, correct) {
    if (answered) return;
    answered = true;

    var btns = quizOptions.querySelectorAll(".quiz-opt");
    btns.forEach(function (b) { b.disabled = true; });

    if (chosen === correct) {
      score++;
      btns[chosen].classList.add("correct");
      quizFeedback.textContent = "✓ Correct!";
      quizFeedback.className   = "quiz-feedback correct";
    } else {
      btns[chosen].classList.add("wrong");
      btns[correct].classList.add("correct");
      quizFeedback.textContent = "✗ Wrong — the answer was: " + qPool[qIndex].opts[correct];
      quizFeedback.className   = "quiz-feedback wrong";
    }

    quizScore.textContent = "Score: " + score + " / " + (qIndex + 1);
    quizNext.style.display = "inline-block";
  }

  quizNext.addEventListener("click", function () {
    qIndex++;
    if (qIndex < TOTAL_Q) {
      showQuestion();
    } else {
      endQuiz();
    }
  });

  function endQuiz() {
    quizNext.style.display    = "none";
    quizOptions.innerHTML     = "";
    quizFeedback.textContent  = "";
    quizFeedback.className    = "quiz-feedback";
    var pct = Math.round((score / TOTAL_Q) * 100);
    var grade = pct >= 90 ? "🔥 Outstanding" : pct >= 70 ? "✅ Solid" : pct >= 50 ? "📈 Decent" : "📚 Hit the books";
    quizQuestion.textContent  = grade + " — " + score + " / " + TOTAL_Q + " correct (" + pct + "%)";
    quizQNum.textContent      = "DONE";
    quizRestart.style.display = "inline-block";
  }

  quizStart.addEventListener("click", startQuiz);
  quizRestart.addEventListener("click", function () {
    quizStart.style.display   = "none";
    quizRestart.style.display = "none";
    quizQuestion.textContent  = "";
    startQuiz();
  });

}); // end DOMContentLoaded
