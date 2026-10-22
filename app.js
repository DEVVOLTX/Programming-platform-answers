(function () {
  "use strict";

  var mainEl = document.getElementById("app-main");
  var breadcrumbEl = document.getElementById("breadcrumb");
  var searchInput = document.getElementById("searchInput");
  var searchWrap = document.getElementById("searchWrap");

  var loadedScripts = {};

  // ---------- تحميل ملف بيانات وحدة (مستوى/فصل) عند الحاجة فقط ----------
  function loadUnitData(sectionKey, unitId) {
    var section = window.MANIFEST[sectionKey];
    if (!section) return Promise.reject(new Error("قسم غير معروف"));

    var existing = window.DATA && window.DATA[sectionKey] && window.DATA[sectionKey][unitId];
    if (existing) return Promise.resolve(existing);

    var src = section.fileFor(unitId);
    if (loadedScripts[src]) {
      return loadedScripts[src].then(function () {
        return (window.DATA[sectionKey] && window.DATA[sectionKey][unitId]) || [];
      });
    }

    var promise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error("لم يتم العثور على ملف البيانات: " + src));
      };
      document.body.appendChild(script);
    });

    loadedScripts[src] = promise;
    return promise.then(function () {
      return (window.DATA[sectionKey] && window.DATA[sectionKey][unitId]) || [];
    });
  }

  // ---------- أدوات عرض عامة ----------
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function setBreadcrumb(items) {
    // items: [{label, hash}], آخر عنصر بدون رابط
    var html = items.map(function (item, i) {
      var isLast = i === items.length - 1;
      var sep = i > 0 ? '<span class="sep">/</span>' : "";
      if (isLast || !item.hash) {
        return sep + '<span class="crumb">' + escapeHtml(item.label) + "</span>";
      }
      return sep + '<a class="crumb is-link" href="' + item.hash + '">' + escapeHtml(item.label) + "</a>";
    }).join(" ");
    breadcrumbEl.innerHTML = html;
  }

  function highlightAll() {
    if (window.hljs) {
      mainEl.querySelectorAll("pre code").forEach(function (block) {
        window.hljs.highlightElement(block);
      });
    }
  }

  function guessLanguage(sectionKey) {
    return sectionKey === "python" ? "python" : "javascript";
  }

  // ---------- عرض: الصفحة الرئيسية ----------
  function renderHome() {
    setBreadcrumb([{ label: "الرئيسية" }]);
    searchInput.placeholder = "اكتب رقم المستوى أو الفصل للانتقال إليه...";
    searchInput.value = "";
    searchInput.dataset.mode = "home";

    var sections = window.MANIFEST;
    var cardsHtml = Object.keys(sections).map(function (key) {
      var s = sections[key];
      return (
        '<a class="section-card" data-section="' + key + '" href="#/section/' + key + '">' +
          "<h2>" + escapeHtml(s.title) + "</h2>" +
          "<p>عرض إجابات " + escapeHtml(s.unitLabel) + " بالكامل، جاهزة للقراءة والنسخ.</p>" +
          '<span class="count">' + s.ids.length + " " + escapeHtml(s.unitLabel) + "</span>" +
        "</a>"
      );
    }).join("");

    mainEl.innerHTML =
      '<div class="home-hero">' +
        "<h1>إجابات البرمجه</h1>" +
        "<p>اختر القسم، ثم المستوى أو الفصل، لعرض إجاباته جاهزة للقراءة والنسخ.</p>" +
      "</div>" +
      '<div class="section-grid">' + cardsHtml + "</div>" +
      '<div id="jumpResults" class="jump-results"></div>';
  }

  // ---------- عرض: شبكة مستويات/فصول قسم ----------
  function renderSection(sectionKey) {
    var section = window.MANIFEST[sectionKey];
    if (!section) return renderNotFound();

    setBreadcrumb([
      { label: "الرئيسية", hash: "#/" },
      { label: section.title }
    ]);
    searchInput.placeholder = "بحث برقم " + section.unitLabel + "...";
    searchInput.value = "";
    searchInput.dataset.mode = "section";
    searchInput.dataset.section = sectionKey;

    var chips = section.ids.map(function (id) {
      return (
        '<a class="unit-chip" href="#/section/' + sectionKey + "/" + id + '" data-id="' + id + '">' +
          escapeHtml(section.unitLabel) +
          '<span class="num">' + id + "</span>" +
        "</a>"
      );
    }).join("");

    mainEl.innerHTML =
      '<h1 class="section-heading">' + escapeHtml(section.title) + "</h1>" +
      '<div class="unit-grid" id="unitGrid">' + chips + "</div>";
  }

  // ---------- عرض: قائمة أسئلة وحدة واحدة ----------
  function renderUnit(sectionKey, unitId) {
    var section = window.MANIFEST[sectionKey];
    if (!section || section.ids.indexOf(unitId) === -1) return renderNotFound();

    setBreadcrumb([
      { label: "الرئيسية", hash: "#/" },
      { label: section.title, hash: "#/section/" + sectionKey },
      { label: section.unitLabel + " " + unitId }
    ]);
    searchInput.placeholder = "بحث برقم السؤال أو نصه...";
    searchInput.value = "";
    searchInput.dataset.mode = "unit";

    mainEl.innerHTML =
      '<div class="unit-toolbar">' +
        "<h1>" + escapeHtml(section.unitLabel) + " " + unitId + "</h1>" +
        '<span class="meta">' + escapeHtml(section.title) + "</span>" +
      "</div>" +
      '<div id="questionList" class="question-list"><div class="empty-state">جاري التحميل...</div></div>';

    var listEl = document.getElementById("questionList");
    var lang = guessLanguage(sectionKey);

    loadUnitData(sectionKey, unitId).then(function (questions) {
      renderQuestionList(listEl, questions, lang);
    }).catch(function (err) {
      listEl.innerHTML = '<div class="empty-state">' + escapeHtml(err.message) + "</div>";
    });
  }

  function renderQuestionList(listEl, questions, lang, filterText) {
    var items = questions;
    if (filterText) {
      var f = filterText.trim().toLowerCase();
      items = questions.filter(function (q) {
        return (
          String(q.question).indexOf(f) !== -1 ||
          (q.text && q.text.toLowerCase().indexOf(f) !== -1) ||
          (q.answer && q.answer.toLowerCase().indexOf(f) !== -1)
        );
      });
    }

    if (!items.length) {
      listEl.innerHTML = '<div class="empty-state">لا توجد نتائج مطابقة.</div>';
      return;
    }

    listEl.innerHTML = items.map(function (q, idx) {
      var textHtml = q.text ? '<div class="q-text">' + escapeHtml(q.text) + "</div>" : "";
      var copyHtml = q.copy
        ? '<div class="copy-row"><button class="copy-btn" data-idx="' + idx + '">📋 نسخ</button></div>'
        : "";
      return (
        '<div class="question-card">' +
          '<div class="q-head"><span class="q-number">السؤال ' + escapeHtml(q.question) + "</span></div>" +
          textHtml +
          '<div class="code-box">' +
            "<pre><code class=\"language-" + lang + "\">" + escapeHtml(q.answer) + "</code></pre>" +
            copyHtml +
          "</div>" +
        "</div>"
      );
    }).join("");

    listEl.querySelectorAll(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.dataset.idx);
        var text = items[idx].answer;
        copyToClipboard(text, btn);
      });
    });

    highlightAll();
  }

  function copyToClipboard(text, btn) {
    var done = function () {
      var original = btn.textContent;
      btn.textContent = "تم النسخ ✓";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  function renderNotFound() {
    setBreadcrumb([{ label: "الرئيسية", hash: "#/" }, { label: "غير موجود" }]);
    mainEl.innerHTML = '<div class="empty-state">هذا القسم أو المستوى غير موجود.</div>';
  }

  // ---------- البحث ----------
  searchInput.addEventListener("input", function () {
    var mode = searchInput.dataset.mode;
    var value = searchInput.value.trim();

    if (mode === "home") {
      handleHomeJump(value);
    } else if (mode === "section") {
      handleSectionFilter(value);
    } else if (mode === "unit") {
      handleUnitFilter(value);
    }
  });

  function handleHomeJump(value) {
    var resultsEl = document.getElementById("jumpResults");
    if (!resultsEl) return;
    if (!value) { resultsEl.innerHTML = ""; return; }

    var num = Number(value);
    if (!Number.isFinite(num)) { resultsEl.innerHTML = ""; return; }

    var matches = [];
    Object.keys(window.MANIFEST).forEach(function (key) {
      var s = window.MANIFEST[key];
      if (s.ids.indexOf(num) !== -1) {
        matches.push({ key: key, title: s.title, unitLabel: s.unitLabel, id: num });
      }
    });

    if (!matches.length) {
      resultsEl.innerHTML = '<span class="jump-hint">لا يوجد ' + escapeHtml(value) + " بهذا الرقم.</span>";
      return;
    }

    resultsEl.innerHTML = matches.map(function (m) {
      return (
        '<a class="jump-result-btn" href="#/section/' + m.key + "/" + m.id + '">' +
          "الانتقال إلى " + escapeHtml(m.title) + " — " + escapeHtml(m.unitLabel) + " " + m.id +
        "</a>"
      );
    }).join("");
  }

  function handleSectionFilter(value) {
    var grid = document.getElementById("unitGrid");
    if (!grid) return;
    var chips = grid.querySelectorAll(".unit-chip");
    var f = value.trim();
    chips.forEach(function (chip) {
      var id = chip.dataset.id;
      chip.style.display = (!f || id.indexOf(f) !== -1) ? "" : "none";
    });
  }

  var currentUnitContext = null; // { questions, lang }

  function handleUnitFilter(value) {
    if (!currentUnitContext) return;
    var listEl = document.getElementById("questionList");
    if (!listEl) return;
    renderQuestionList(listEl, currentUnitContext.questions, currentUnitContext.lang, value);
  }

  // نعيد كتابة renderUnit لحفظ سياق البحث محليًا
  var originalRenderUnit = renderUnit;
  renderUnit = function (sectionKey, unitId) {
    var section = window.MANIFEST[sectionKey];
    if (!section || section.ids.indexOf(unitId) === -1) return renderNotFound();

    setBreadcrumb([
      { label: "الرئيسية", hash: "#/" },
      { label: section.title, hash: "#/section/" + sectionKey },
      { label: section.unitLabel + " " + unitId }
    ]);
    searchInput.placeholder = "بحث برقم السؤال أو نصه...";
    searchInput.value = "";
    searchInput.dataset.mode = "unit";
    currentUnitContext = null;

    mainEl.innerHTML =
      '<div class="unit-toolbar">' +
        "<h1>" + escapeHtml(section.unitLabel) + " " + unitId + "</h1>" +
        '<span class="meta">' + escapeHtml(section.title) + "</span>" +
      "</div>" +
      '<div id="questionList" class="question-list"><div class="empty-state">جاري التحميل...</div></div>';

    var listEl = document.getElementById("questionList");
    var lang = guessLanguage(sectionKey);

    loadUnitData(sectionKey, unitId).then(function (questions) {
      currentUnitContext = { questions: questions, lang: lang };
      renderQuestionList(listEl, questions, lang);
    }).catch(function (err) {
      listEl.innerHTML = '<div class="empty-state">' + escapeHtml(err.message) + "</div>";
    });
  };

  // ---------- التوجيه ----------
  function route() {
    var hash = window.location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);

    if (parts.length === 0) {
      renderHome();
    } else if (parts[0] === "section" && parts.length === 2) {
      renderSection(parts[1]);
    } else if (parts[0] === "section" && parts.length === 3) {
      renderUnit(parts[1], Number(parts[2]));
    } else {
      renderNotFound();
    }
  }

  window.addEventListener("hashchange", route);
  document.getElementById("btnHome").addEventListener("click", function () {
    window.location.hash = "#/";
  });

  route();
})();
