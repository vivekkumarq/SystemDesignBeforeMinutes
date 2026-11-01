(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: progress just won't persist */ } },
  };

  // ---------- Course index ----------
  const KIND_LABEL = { concept: 'Lesson', qa: 'Q&A + Quiz', tradeoff: 'Trade-off', case: 'Case study', flaw: 'Find the flaw', lab: 'Lab', crisp: '5-min read', pattern: 'Pattern', lld: 'LLD', revision: 'Revision' };
  const LESSONS = [];
  COURSE.forEach((ch, ci) => {
    ch.lessons = ch.lessons.map(([slug, title, kind], li) => {
      const l = { id: `${ch.slug}/${slug}`, slug, title, kind: kind || ch.kind, ch, ci, li, n: LESSONS.length };
      LESSONS.push(l);
      return l;
    });
  });
  const byId = new Map(LESSONS.map((l) => [l.id, l]));
  const done = new Set(store.get('sd.done', []).filter((id) => byId.has(id)));
  const saveDone = () => { store.set('sd.done', [...done]); paintProgress(); };
  const chDone = (ch) => ch.lessons.filter((l) => done.has(l.id)).length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  // ---------- Theme & text size ----------
  const root = document.documentElement;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  $('#themeToggle').onclick = () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    store.set('sd.theme', root.dataset.theme);
    if ($('.diagram')) route(); // diagrams are drawn for one theme; redraw them
  };
  let size = store.get('sd.size', 17);
  const setSize = (d) => { size = Math.min(21, Math.max(14, size + d)); root.style.setProperty('--fs', size + 'px'); store.set('sd.size', size); };
  $('#sizeUp').onclick = () => setSize(1);
  $('#sizeDown').onclick = () => setSize(-1);

  // ---------- Sidebar ----------
  const nav = $('#nav');
  const openChapters = new Set(store.get('sd.open', []));
  function buildNav() {
    let html = '', part = '';
    COURSE.forEach((ch, i) => {
      if (ch.part !== part) { part = ch.part; html += `<div class="nav-part">${esc(part)}</div>`; }
      html += `<div class="nav-ch${openChapters.has(ch.slug) ? ' open' : ''}" data-ch="${ch.slug}">
        <button type="button" aria-expanded="${openChapters.has(ch.slug)}"><span class="ch-icon">${ch.icon}</span><span class="ch-name">${i + 1}. ${esc(ch.title)}</span><span class="ch-count" data-count="${ch.slug}"></span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>
        <ul>${ch.lessons.map((l) => `<li><a href="#/l/${l.id}" data-id="${l.id}"><span class="dot"></span><span>${esc(l.title)}</span></a></li>`).join('')}</ul>
      </div>`;
    });
    nav.innerHTML = html;
    nav.onclick = (e) => {
      const b = e.target.closest('.nav-ch > button');
      if (b) toggleChapter(b.parentElement.dataset.ch);
      if (e.target.closest('a')) document.body.classList.remove('nav-open');
    };
  }
  function toggleChapter(slug, force) {
    const el = nav.querySelector(`[data-ch="${slug}"]`);
    const open = force ?? !el.classList.contains('open');
    el.classList.toggle('open', open);
    el.firstElementChild.setAttribute('aria-expanded', open);
    open ? openChapters.add(slug) : openChapters.delete(slug);
    store.set('sd.open', [...openChapters]);
  }
  function paintProgress() {
    const p = pct(done.size, LESSONS.length);
    $('#sideRing').style.setProperty('--p', p);
    $('#sidePct').textContent = p + '%';
    $('#sideCount').textContent = `${done.size} of ${LESSONS.length} lessons done`;
    $$('a[data-id]', nav).forEach((a) => a.firstElementChild.classList.toggle('done', done.has(a.dataset.id)));
    COURSE.forEach((ch) => { nav.querySelector(`[data-count="${ch.slug}"]`).textContent = `${chDone(ch)}/${ch.lessons.length}`; });
  }
  function markActive(id) {
    $$('a.active', nav).forEach((a) => a.classList.remove('active'));
    const a = nav.querySelector(`a[data-id="${CSS.escape(id || '')}"]`);
    if (!a) return;
    a.classList.add('active');
    toggleChapter(a.closest('.nav-ch').dataset.ch, true);
    a.scrollIntoView({ block: 'nearest' });
  }
  $('#menuToggle').onclick = () => { const o = document.body.classList.toggle('nav-open'); $('#menuToggle').setAttribute('aria-expanded', o); };
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  $('#resetProgress').onclick = () => {
    if (!done.size) return;
    const btn = $('#resetProgress');
    if (btn.dataset.armed) { done.clear(); saveDone(); route(); btn.textContent = 'Reset progress'; delete btn.dataset.armed; return; }
    btn.dataset.armed = '1'; btn.textContent = 'Click again to confirm';
    setTimeout(() => { btn.textContent = 'Reset progress'; delete btn.dataset.armed; }, 3000);
  };

  // ---------- Markdown loading ----------
  const cache = new Map();
  function loadMd(id) {
    if (!cache.has(id)) cache.set(id, fetch(`content/${id}.md`).then((r) => (r.ok ? r.text() : null)).catch(() => null));
    return cache.get(id);
  }
  const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const words = (md) => md.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).length;

  let mermaidP = null;
  async function drawDiagrams(el) {
    const blocks = $$('pre > code.language-mermaid', el);
    if (!blocks.length) return;
    const nodes = blocks.map((c) => { const d = document.createElement('div'); d.className = 'diagram loading'; d.textContent = 'Drawing diagram…'; const src = c.textContent; c.parentElement.replaceWith(d); return [d, src]; });
    try {
      mermaidP ??= import('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs').then((m) => m.default);
      const mermaid = await mermaidP;
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark() ? 'dark' : 'neutral', fontFamily: 'Inter, sans-serif', flowchart: { curve: 'basis' } });
      for (const [i, [d, src]] of nodes.entries()) {
        try { d.innerHTML = (await mermaid.render(`mmd${Date.now()}${i}`, src)).svg; d.classList.remove('loading'); }
        catch { d.textContent = 'This diagram could not be drawn.'; }
      }
    } catch { nodes.forEach(([d, src]) => { d.innerHTML = `<pre>${esc(src)}</pre>`; }); }
  }

  function enhance(el) {
    // GitHub-style callouts: > [!TIP] Title
    $$('blockquote', el).forEach((bq) => {
      const p = bq.firstElementChild;
      const m = p && p.innerHTML.match(/^\[!(NOTE|TIP|WARNING|INTERVIEW|EXAMPLE)\]\s*(.*?)(<br>|\n|$)/i);
      if (!m) return;
      const type = m[1].toLowerCase();
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.textContent.trim()) p.remove();
      const box = document.createElement('div');
      box.className = `callout ${type}`;
      box.innerHTML = `<div class="callout-title">${{ note: 'Note', tip: 'Tip', warning: 'Watch out', interview: 'Interview angle', example: 'Example' }[type]}${m[2] ? ' · ' + m[2] : ''}</div>`;
      box.append(...bq.childNodes);
      bq.replaceWith(box);
    });
    // Tables scroll sideways on phones instead of breaking the page.
    $$('table', el).forEach((t) => { const w = document.createElement('div'); w.className = 'table-wrap'; t.replaceWith(w); w.append(t); });
    // Quizzes: ```quiz [{ "q", "options", "answer", "why" }]
    $$('pre > code.language-quiz', el).forEach((c) => {
      let qs; try { qs = JSON.parse(c.textContent); } catch { return; }
      const box = document.createElement('div');
      box.className = 'quiz';
      let right = 0, answered = 0;
      box.innerHTML = `<div class="quiz-head"><b>Quick quiz</b><span class="quiz-score">${qs.length} questions</span></div>` + qs.map((q, i) => `
        <div class="qz" data-i="${i}"><p class="q">${i + 1}. ${marked.parseInline(q.q)}</p>
        <div class="opts">${q.options.map((o, j) => `<button type="button" class="opt" data-j="${j}">${marked.parseInline(o)}</button>`).join('')}</div></div>`).join('');
      box.onclick = (e) => {
        const b = e.target.closest('button.opt'); if (!b) return;
        const qz = b.closest('.qz'), q = qs[qz.dataset.i], j = +b.dataset.j;
        $$('button', qz).forEach((x) => { x.disabled = true; if (+x.dataset.j === q.answer) x.classList.add('right'); });
        if (j !== q.answer) b.classList.add('wrong'); else right++;
        answered++;
        if (q.why) qz.insertAdjacentHTML('beforeend', `<p class="why">${marked.parseInline(q.why)}</p>`);
        $('.quiz-score', box).textContent = `${right} / ${answered} correct${answered === qs.length ? ' · done' : ''}`;
      };
      c.parentElement.replaceWith(box);
    });
    // Flashcards: ```cards [["front", "back"], ...]
    $$('pre > code.language-cards', el).forEach((c) => {
      let cs; try { cs = JSON.parse(c.textContent); } catch { return; }
      const deck = document.createElement('div');
      deck.className = 'cards-deck';
      deck.innerHTML = cs.map(([f, b]) => `<button type="button" class="flash" aria-label="Flashcard: ${esc(f)}"><div class="flash-inner"><div class="flash-face flash-front">${marked.parseInline(f)}</div><div class="flash-face flash-back">${marked.parseInline(b)}</div></div></button>`).join('');
      deck.onclick = (e) => { const f = e.target.closest('.flash'); if (f) f.classList.toggle('flipped'); };
      c.parentElement.replaceWith(deck);
    });
    // Copy buttons
    $$('pre', el).forEach((pre) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
      b.onclick = () => navigator.clipboard?.writeText(pre.querySelector('code')?.textContent || '').then(() => { b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1200); });
      pre.append(b);
    });
    // Heading anchors
    $$('h2, h3', el).forEach((h) => { h.id = slugify(h.textContent); });
  }

  // ---------- Views ----------
  const view = $('#view');
  const icon = { arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>', check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>' };

  function home() {
    const last = byId.get(store.get('sd.last', ''));
    const next = last || LESSONS.find((l) => !done.has(l.id)) || LESSONS[0];
    let html = `<section class="hero">
      <span class="eyebrow">Complete course · ${COURSE.length} chapters</span>
      <h1>System design, <span>explained</span> the way you'd explain it in an interview.</h1>
      <p>From latency numbers to a full payment system. Every idea is in plain language, with diagrams, trade-offs, interview angles and a quiz at the end of each chapter.</p>
      <div class="hero-actions">
        <a class="btn primary" href="#/l/${next.id}">${last ? 'Continue: ' + esc(next.title) : done.size ? 'Pick up where you left off' : 'Start the course'} ${icon.arrow}</a>
        <a class="btn" href="#/c/17-revision">Interview tomorrow? Revise</a>
      </div>
      <div class="stats">
        <div class="stat"><b>${LESSONS.length}</b><small>lessons</small></div>
        <div class="stat"><b>${LESSONS.filter((l) => ['case', 'crisp', 'lld'].includes(l.kind)).length}</b><small>case studies</small></div>
        <div class="stat"><b>${done.size}</b><small>done so far</small></div>
        <div class="stat"><b>${pct(done.size, LESSONS.length)}%</b><small>complete</small></div>
      </div>
    </section>`;
    let part = '';
    COURSE.forEach((ch, i) => {
      if (ch.part !== part) {
        if (part) html += '</div>';
        part = ch.part;
        const chs = COURSE.filter((c) => c.part === part);
        html += `<div class="part-head"><h2>${esc(part)}</h2><span>${chs.reduce((n, c) => n + c.lessons.length, 0)} lessons</span></div><div class="cards">`;
      }
      const d = chDone(ch), p = pct(d, ch.lessons.length);
      html += `<a class="card" href="#/c/${ch.slug}">
        <div class="card-top"><span class="ch-icon">${ch.icon}</span><span class="num">Chapter ${String(i + 1).padStart(2, '0')}</span></div>
        <h3>${esc(ch.title)}</h3><p>${esc(ch.blurb)}</p>
        <div class="bar"><i style="width:${p}%"></i></div>
        <div class="card-foot"><span>${ch.lessons.length} lessons</span><span>${p ? p + '% done' : 'Not started'}</span></div></a>`;
    });
    view.innerHTML = html + '</div>';
    document.title = 'SystemDesignBeforeMinutes — System Design, Explained';
    markActive(null);
  }

  function chapter(slug) {
    const ch = COURSE.find((c) => c.slug === slug);
    if (!ch) return home();
    const i = COURSE.indexOf(ch), d = chDone(ch);
    const next = ch.lessons.find((l) => !done.has(l.id)) || ch.lessons[0];
    view.innerHTML = `<div class="crumbs"><a href="#/">Home</a><span>/</span><span>${esc(ch.part)}</span></div>
      <section class="ch-hero"><span class="tag">Chapter ${i + 1} · ${ch.lessons.length} lessons</span><h1>${ch.icon} ${esc(ch.title)}</h1><p>${esc(ch.blurb)}</p>
      <div class="bar" style="max-width:360px;margin-bottom:16px"><i style="width:${pct(d, ch.lessons.length)}%"></i></div>
      <a class="btn primary" href="#/l/${next.id}">${d ? 'Continue' : 'Start chapter'} ${icon.arrow}</a></section>
      <ol class="lesson-list">${ch.lessons.map((l, k) => `<li><a href="#/l/${l.id}"><span class="dot${done.has(l.id) ? ' done' : ''}"></span><span class="idx">${String(k + 1).padStart(2, '0')}</span><span class="t">${esc(l.title)}</span><span class="tag ${l.kind}">${KIND_LABEL[l.kind]}</span></a></li>`).join('')}</ol>`;
    document.title = `${ch.title} — SystemDesignBeforeMinutes`;
    markActive(null);
    toggleChapter(slug, true);
  }

  let tocObserver;
  async function lesson(id) {
    const l = byId.get(id);
    if (!l) return home();
    store.set('sd.last', id);
    const prev = LESSONS[l.n - 1], next = LESSONS[l.n + 1];
    document.title = `${l.title} — SystemDesignBeforeMinutes`;
    markActive(id);
    view.innerHTML = `<div class="lesson-wrap"><article>
      <div class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/c/${l.ch.slug}">${l.ci + 1}. ${esc(l.ch.title)}</a></div>
      <header class="lesson-head"><h1>${esc(l.title)}</h1><div class="meta" id="meta"><span class="tag ${l.kind}">${KIND_LABEL[l.kind]}</span><span>Lesson ${l.li + 1} of ${l.ch.lessons.length}</span></div></header>
      <div class="prose" id="prose"><div class="skeleton" style="width:90%"></div><div class="skeleton"></div><div class="skeleton" style="width:70%"></div></div>
      <div class="complete-box"><p>${done.has(id) ? 'You have finished this lesson.' : 'Finished reading? Mark it to track your progress.'}</p>
        <button type="button" class="btn ${done.has(id) ? 'done' : 'primary'}" id="markDone">${done.has(id) ? icon.check + ' Completed' : 'Mark as complete'}</button></div>
      <nav class="pager">${prev ? `<a class="prev" href="#/l/${prev.id}"><small>← Previous</small><b>${esc(prev.title)}</b></a>` : ''}${next ? `<a class="next" href="#/l/${next.id}"><small>Next →</small><b>${esc(next.title)}</b></a>` : ''}</nav>
    </article><aside class="toc" id="toc"></aside></div>`;
    $('#markDone').onclick = () => {
      done.has(id) ? done.delete(id) : done.add(id);
      saveDone();
      const b = $('#markDone'), on = done.has(id);
      b.className = `btn ${on ? 'done' : 'primary'}`;
      b.innerHTML = on ? icon.check + ' Completed' : 'Mark as complete';
      b.previousElementSibling.textContent = on ? 'You have finished this lesson.' : 'Finished reading? Mark it to track your progress.';
      if (on && next) setTimeout(() => { if (location.hash === `#/l/${id}`) location.hash = `#/l/${next.id}`; }, 450);
    };

    const md = await loadMd(id);
    if (location.hash !== `#/l/${id}`) return; // navigated away while loading
    const prose = $('#prose');
    if (md == null) {
      prose.innerHTML = `<div class="missing"><p><b>This lesson is still being written.</b></p><p>Every chapter is added as it is finished. Try the next lesson or come back soon.</p></div>`;
      return;
    }
    prose.innerHTML = marked.parse(md);
    enhance(prose);
    $('#meta').insertAdjacentHTML('beforeend', `<span>≈ ${Math.max(1, Math.round(words(md) / 220))} min read</span>`);
    const hs = $$('h2', prose);
    const toc = $('#toc');
    if (hs.length > 1) {
      toc.innerHTML = '<b>On this page</b>' + hs.map((h) => `<a href="#${h.id}" data-to="${h.id}">${esc(h.textContent)}</a>`).join('');
      toc.onclick = (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.to).scrollIntoView({ behavior: 'smooth' }); };
      tocObserver?.disconnect();
      tocObserver = new IntersectionObserver((es) => es.forEach((en) => {
        if (en.isIntersecting) { $$('a', toc).forEach((a) => a.classList.toggle('on', a.dataset.to === en.target.id)); }
      }), { rootMargin: '-80px 0px -70% 0px' });
      hs.forEach((h) => tocObserver.observe(h));
    }
    drawDiagrams(prose);
  }

  function route() {
    const h = location.hash.slice(1) || '/';
    const [, type, ...rest] = h.split('/');
    window.scrollTo(0, 0);
    if (type === 'l') lesson(rest.join('/'));
    else if (type === 'c') chapter(rest[0]);
    else home();
  }
  addEventListener('hashchange', route);

  // ---------- Reading progress ----------
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#readProgress').style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }, { passive: true });

  // ---------- Search ----------
  const input = $('#search'), results = $('#searchResults');
  let index = null, sel = -1;
  const plain = (md) => md.replace(/\]\([^)]*\)/g, ']').replace(/```(quiz|cards)[\s\S]*?```/g, ' ').replace(/```mermaid[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[#>*_`|\[\]()!-]+/g, ' ').replace(/\s+/g, ' ');
  function buildIndex() {
    index ??= Promise.all(LESSONS.map(async (l) => {
      const md = (await loadMd(l.id)) || '';
      const text = plain(md);
      return { l, text, low: text.toLowerCase(), title: l.title.toLowerCase(), chapter: l.ch.title.toLowerCase() };
    }));
    return index;
  }
  function highlight(s, terms) {
    let out = esc(s);
    terms.forEach((t) => { out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>'); });
    return out;
  }
  async function search() {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.hidden = true; return; }
    results.hidden = false;
    if (!index) results.innerHTML = '<div class="sr-empty">Building the search index…</div>';
    const docs = await buildIndex();
    if (input.value.trim().toLowerCase() !== q) return;
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = docs.map((d) => {
      let score = 0;
      for (const t of terms) {
        const inTitle = d.title.includes(t), inCh = d.chapter.includes(t), inText = d.low.includes(t);
        if (!inTitle && !inCh && !inText) return null;
        score += (inTitle ? 10 : 0) + (inCh ? 3 : 0) + (inText ? 1 : 0);
      }
      return { d, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
    sel = -1;
    results.innerHTML = hits.length ? hits.map(({ d }, i) => {
      const at = d.low.indexOf(terms[0]);
      const snip = at >= 0 ? (at > 60 ? '…' : '') + d.text.slice(Math.max(0, at - 60), at + 120) + '…' : '';
      return `<a class="sr-item" role="option" href="#/l/${d.l.id}" data-i="${i}"><b>${highlight(d.l.title, terms)}</b><small>${d.l.ci + 1}. ${esc(d.l.ch.title)}</small>${snip ? `<p>${highlight(snip, terms)}</p>` : ''}</a>`;
    }).join('') : `<div class="sr-empty">No lesson mentions “${esc(q)}”.</div>`;
  }
  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(search, 120); });
  input.addEventListener('focus', () => { buildIndex(); if (input.value.trim().length > 1) results.hidden = false; });
  input.addEventListener('keydown', (e) => {
    const items = $$('.sr-item', results);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.setAttribute('aria-selected', i === sel));
      items[sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const it = items[Math.max(0, sel)];
      if (it) { location.hash = it.getAttribute('href'); closeSearch(); }
    } else if (e.key === 'Escape') { closeSearch(); input.blur(); }
  });
  results.addEventListener('click', (e) => { if (e.target.closest('.sr-item')) closeSearch(); });
  function closeSearch() { results.hidden = true; input.value = ''; }
  document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) results.hidden = true; });

  // ---------- Keyboard ----------
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); input.focus(); input.select(); return; }
    if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
    const m = location.hash.match(/^#\/l\/(.+)$/);
    const l = m && byId.get(m[1]);
    if (!l) return;
    if (e.key === 'ArrowRight' && LESSONS[l.n + 1]) location.hash = `#/l/${LESSONS[l.n + 1].id}`;
    if (e.key === 'ArrowLeft' && LESSONS[l.n - 1]) location.hash = `#/l/${LESSONS[l.n - 1].id}`;
  });

  buildNav();
  paintProgress();
  route();
})();
