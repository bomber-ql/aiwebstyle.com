// search.js — 站内搜索（⌘K / Ctrl+K / 斜杠 唤起）
//
// 为什么自己写而不是引库：
//   索引只有 25KB，逻辑就是「每个词都必须命中 + 权重求和」，40 行足够；
//   引一个 20KB 的搜索库反而比索引本身还大。
//
// 索引在第一次打开时才请求（defer 加载 + 懒 fetch），所以首屏不会多一次往返。

(function () {
  'use strict';

  var INDEX_URL = '/search-index.json';
  var MAX = 8;
  var SECTIONS = { Style: 'Styles', Preview: 'Previews', Comparison: 'Compare', Motion: 'Motions', Prompt: 'Prompts', Page: 'Pages' };

  var data = null;
  var loading = null;
  var overlay = null;
  var input = null;
  var listEl = null;
  var hintEl = null;
  var rows = [];
  var active = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = el('div', 'search-overlay');
    overlay.setAttribute('hidden', '');

    var panel = el('div', 'search-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Search this site');

    var bar = el('div', 'search-bar');
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('class', 'search-icon');
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '11'); circle.setAttribute('cy', '11'); circle.setAttribute('r', '7');
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', 'M16.6 16.6 L21 21');
    icon.appendChild(circle); icon.appendChild(line);

    input = el('input', 'search-input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = 'Search styles, motions, prompts…';
    input.setAttribute('aria-label', 'Search query');

    var close = el('button', 'search-close', 'Esc');
    close.type = 'button';

    bar.appendChild(icon); bar.appendChild(input); bar.appendChild(close);
    listEl = el('ul', 'search-results');
    hintEl = el('p', 'search-hint', '↑↓ to move · Enter to open · Esc to close');
    panel.appendChild(bar); panel.appendChild(listEl); panel.appendChild(hintEl);
    overlay.appendChild(panel);

    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeOverlay();
    });
    close.addEventListener('click', closeOverlay);
    input.addEventListener('input', function () { run(input.value); });
    listEl.addEventListener('mousemove', function (e) {
      var li = e.target.closest ? e.target.closest('li') : null;
      if (!li) return;
      var i = Number(li.getAttribute('data-i'));
      if (i !== active) { active = i; paintActive(); }
    });

    document.body.appendChild(overlay);
  }

  function loadIndex() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(INDEX_URL, { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (j) { data = j.items || []; return data; })
      .catch(function () { data = []; return data; });
    return loading;
  }

  function score(item, tokens) {
    var t = item.t.toLowerCase();
    var k = (item.k || '').toLowerCase();
    var d = (item.d || '').toLowerCase();
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var hit = 0;
      if (t === tok) hit = 40;
      else if (t.indexOf(tok) === 0) hit = 26;
      else if (t.indexOf(tok) > -1) hit = 16;
      else if (k.indexOf(tok) > -1) hit = 9;
      else if (d.indexOf(tok) > -1) hit = 4;
      if (!hit) return 0;
      total += hit;
    }
    return total - Math.min(6, t.length / 24);
  }

  function run(query) {
    // 索引还没到就先等它，否则第一次输入会被算成「无结果」
    if (!data) {
      loadIndex().then(function () { run(input ? input.value : query); });
      return;
    }

    var q = String(query || '').trim().toLowerCase();
    var tokens = q.split(/\s+/).filter(Boolean);
    var items = data;

    if (!tokens.length) {
      // 空查询：给一个「从哪儿开始」的默认列表
      rows = items.filter(function (i) { return i.s === 'Page' || i.s === 'Style'; }).slice(0, MAX);
      render(q);
      return;
    }

    var scored = [];
    for (var i = 0; i < items.length; i++) {
      var sc = score(items[i], tokens);
      if (sc > 0) scored.push({ item: items[i], sc: sc });
    }
    scored.sort(function (a, b) { return b.sc - a.sc; });
    rows = scored.slice(0, MAX).map(function (x) { return x.item; });
    render(q);
  }

  function mark(text, q) {
    var frag = document.createDocumentFragment();
    if (!q) { frag.appendChild(document.createTextNode(text)); return frag; }
    var lower = text.toLowerCase();
    var at = lower.indexOf(q);
    if (at < 0) { frag.appendChild(document.createTextNode(text)); return frag; }
    frag.appendChild(document.createTextNode(text.slice(0, at)));
    var m = document.createElement('mark');
    m.textContent = text.slice(at, at + q.length);
    frag.appendChild(m);
    frag.appendChild(document.createTextNode(text.slice(at + q.length)));
    return frag;
  }

  function render(q) {
    listEl.innerHTML = '';
    if (!rows.length) {
      var empty = el('li', 'search-empty', 'No match. Try “brutalism”, “scroll”, “prompt”.');
      listEl.appendChild(empty);
      hintEl.textContent = '';
      return;
    }
    var first = (q || '').split(/\s+/)[0] || '';
    rows.forEach(function (item, i) {
      var li = el('li', 'search-item');
      li.setAttribute('data-i', String(i));
      var a = el('a', 'search-link');
      a.href = item.u;
      var top = el('span', 'search-row');
      var title = el('span', 'search-title');
      title.appendChild(mark(item.t, first));
      var badge = el('span', 'search-badge search-badge-' + item.s.toLowerCase(), SECTIONS[item.s] || item.s);
      top.appendChild(title); top.appendChild(badge);
      var sub = el('span', 'search-desc', item.d || '');
      a.appendChild(top); a.appendChild(sub);
      li.appendChild(a);
      listEl.appendChild(li);
    });
    active = 0;
    paintActive();
    hintEl.textContent = q
      ? rows.length + ' result' + (rows.length === 1 ? '' : 's') + ' · ↑↓ to move · Enter to open'
      : 'Start typing, or open a section below · ↑↓ to move · Enter to open';
  }

  function paintActive() {
    var lis = listEl.querySelectorAll('li.search-item');
    for (var i = 0; i < lis.length; i++) {
      lis[i].classList.toggle('is-active', i === active);
    }
    var cur = lis[active];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }

  function openOverlay() {
    ensureOverlay();
    overlay.removeAttribute('hidden');
    document.documentElement.classList.add('search-open');
    input.value = '';
    input.focus();
    loadIndex().then(function () { run(''); });
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.setAttribute('hidden', '');
    document.documentElement.classList.remove('search-open');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function isOpen() {
    return overlay && !overlay.hasAttribute('hidden');
  }

  function go() {
    var item = rows[active];
    if (item) window.location.href = item.u;
  }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);

    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      isOpen() ? closeOverlay() : openOverlay();
      return;
    }
    if (e.key === '/' && !typing && !isOpen()) {
      e.preventDefault();
      openOverlay();
      return;
    }
    if (!isOpen()) return;

    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rows.length) { active = (active + 1) % rows.length; paintActive(); } return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (rows.length) { active = (active - 1 + rows.length) % rows.length; paintActive(); } return; }
    if (e.key === 'Enter') { e.preventDefault(); go(); }
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-search-open]');
    if (!trigger) return;
    e.preventDefault();
    openOverlay();
  });

  // 预取索引的空闲时机：用户很可能按 Cmd+K，等按了再请求会有 200ms 空窗
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function () { loadIndex(); }, { timeout: 4000 });
  } else {
    setTimeout(function () { loadIndex(); }, 2500);
  }
})();
