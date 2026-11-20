// Vice City Platinum Atlas — trophy tracker: checklist, filters, spoiler mode,
// export/import, roadmap stages and deep links. Data lives in data/trophies.json.
const STORE_KEY = 'vice-city-platinum-atlas-progress-v1';

const listEl = document.getElementById('trophyList');
const statusEl = document.getElementById('statusLine');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const kindChipsEl = document.getElementById('kindChips');
const emptyNoteEl = document.getElementById('emptyNote');
const onlineNoteEl = document.getElementById('onlineNote');

let trophies = [];
let earned = new Set(loadStored());
let selectedId = null;
let activeKind = 'all';
let activeView = 'checklist';

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort()));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id) || null;
}

function isStorySpoiler(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function kindMatches(t) {
  if (activeKind === 'all') return true;
  if (activeKind === 'missable') return t.missable === true;
  if (activeKind === 'online') return false;
  return t.kind === activeKind;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t)) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q && !t.name.toLowerCase().includes(q) && !(t.description || '').toLowerCase().includes(q)) return false;
    return true;
  });
}

function gradeCounts() {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (earned.has(t.name)) out[t.grade][0] += 1;
  }
  return out;
}

function renderProgress() {
  const total = trophies.length || 55;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = String(done);
  document.getElementById('ringPct').textContent = pct + '%';
  document.getElementById('ring').style.setProperty('--pct', String(pct));
  const g = gradeCounts();
  document.getElementById('gradeLine').textContent =
    'Platinum ' + g.platinum[0] + '/' + g.platinum[1] +
    ' · Gold ' + g.gold[0] + '/' + g.gold[1] +
    ' · Silver ' + g.silver[0] + '/' + g.silver[1] +
    ' · Bronze ' + g.bronze[0] + '/' + g.bronze[1];
}

function sourceLink(text) {
  const m = text.match(/^(.*?)\s+—\s+(https?:\/\/\S+)\s*$/);
  if (!m) return null;
  return { label: m[1], url: m[2] };
}

function renderDetail(t) {
  const panel = document.getElementById('detailPanel');
  const hidden = isStorySpoiler(t);
  document.getElementById('detailName').textContent = hidden ? 'Hidden story trophy' : t.name;
  document.getElementById('detailDesc').textContent = hidden
    ? 'Spoilers are hidden. Earn this trophy to reveal its official name and description.'
    : (t.description || '');
  document.getElementById('detailGrade').textContent = t.grade;
  document.getElementById('detailKind').textContent = t.kind + (t.missable ? ' · missable' : '');
  document.getElementById('detailCount').textContent = t.count !== undefined ? String(t.count) : '—';
  document.getElementById('detailMissable').textContent = t.missable
    ? 'YES — see Missable & Saves'
    : 'No';
  document.getElementById('detailStage').textContent = 'Stage ' + (t.roadmap_stage || '—');
  document.getElementById('detailGuide').textContent = hidden
    ? 'Guide hidden while spoilers are on. Turn spoilers off, or earn the trophy, to read it.'
    : t.guide;
  const srcList = document.getElementById('detailSources');
  srcList.replaceChildren();
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const parsed = sourceLink(s);
    if (parsed) {
      li.append(document.createTextNode(parsed.label + ' — '));
      const a = document.createElement('a');
      a.href = parsed.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'PowerPyx guide';
      li.append(a);
    } else {
      li.textContent = s;
    }
    srcList.append(li);
  }
  const btn = document.getElementById('detailToggle');
  const isEarned = earned.has(t.name);
  btn.textContent = isEarned ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.classList.toggle('earned', isEarned);
  btn.onclick = () => toggleEarned(t);
  panel.dataset.trophy = String(t.id);
}

function toggleEarned(t) {
  if (earned.has(t.name)) earned.delete(t.name);
  else earned.add(t.name);
  persist();
  renderAll();
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'grade-' + t.grade + (t.missable ? ' missable-flagged' : '');
    if (earned.has(t.name)) li.classList.add('earned');
    if (t.id === selectedId) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 't-check';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (e) => { e.stopPropagation(); toggleEarned(t); });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    const hidden = isStorySpoiler(t);
    name.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = hidden ? 'Story trophy hidden by the spoiler setting.' : (t.description || '');
    body.append(name, desc);
    if (t.hidden && !hidden) {
      const note = document.createElement('div');
      note.className = 't-hidden-note';
      note.textContent = 'Hidden on PlayStation until earned.';
      body.append(note);
    }
    const badges = document.createElement('div');
    badges.className = 't-badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = 'badge grade-' + t.grade;
    gradeBadge.textContent = t.grade;
    badges.append(gradeBadge);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge miss';
      m.textContent = '⚠ Missable';
      badges.append(m);
    }
    if (t.count !== undefined) {
      const c = document.createElement('span');
      c.className = 'badge count';
      c.textContent = '× ' + t.count;
      badges.append(c);
    }
    li.append(box, body, badges);
    li.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    listEl.append(li);
  }
  emptyNoteEl.hidden = shown.length !== 0 || activeKind === 'online';
  onlineNoteEl.hidden = activeKind !== 'online';
  statusEl.textContent = activeKind === 'online'
    ? 'Online trophies: 0 — all 55 trophies are offline / single-player.'
    : 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
      + (earned.size ? ' · ' + earned.size + ' earned' : '')
      + (activeKind === 'missable' ? ' · the only missable trophy is Positive Mental Attitude.' : '');
}

function renderRoadmapStages() {
  const names = { 1: [], 2: [], 3: [], 4: [] };
  for (const t of trophies) {
    if (names[t.roadmap_stage]) names[t.roadmap_stage].push(t.name);
  }
  for (const el of document.querySelectorAll('.stage-trophies')) {
    const stage = el.dataset.stage;
    el.textContent = 'Trophies: ' + (names[stage] || []).join(' · ');
  }
}

function renderAll() {
  renderProgress();
  renderList();
  const selected = selectedId !== null ? trophyById(selectedId) : null;
  if (selected) renderDetail(selected);
}

function setView(view) {
  activeView = view;
  document.getElementById('tabChecklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('active', view === 'roadmap');
  document.getElementById('tabMissable').classList.toggle('active', view === 'missable');
  const target = view === 'roadmap'
    ? document.getElementById('roadmapSection')
    : view === 'missable'
      ? document.getElementById('missableSection')
      : document.querySelector('.toolbar');
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
}

function exportProgress() {
  const payload = { app: 'vice-city-platinum-atlas', version: 1, earned: [...earned].sort(), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vice-city-platinum-atlas-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const good = names.filter((n) => typeof n === 'string' && known.has(n));
    if (good.length === 0 && names.length > 0) throw new Error('no known trophy names');
    earned = new Set(good);
    persist();
    renderAll();
    statusEl.textContent = 'Imported ' + good.length + ' earned trophies.';
  } catch {
    statusEl.textContent = 'Import failed: that file is not a valid progress export from this guide.';
  }
}

function applyDeepLinks() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view === 'roadmap' || view === 'missable' || view === 'checklist') setView(view);
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) gradeEl.value = grade;
  const filter = params.get('filter');
  if (filter && ['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(filter)) {
    activeKind = filter;
    for (const chip of kindChipsEl.querySelectorAll('.chip')) {
      chip.classList.toggle('active', chip.dataset.kind === filter);
    }
  }
  const spoiler = params.get('spoiler');
  if (spoiler === 'on') spoilerEl.checked = true;
  if (spoiler === 'off') spoilerEl.checked = false;
  const open = params.get('open');
  if (open) {
    const id = Number(open);
    if (Number.isInteger(id) && trophyById(id)) selectedId = id;
  }
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies || doc;
  applyDeepLinks();
  if (selectedId === null) {
    const stunts = trophies.find((t) => t.name === 'Cunning Stunts');
    selectedId = stunts ? stunts.id : trophies[0].id;
  }
  renderRoadmapStages();
  renderAll();
  searchEl.addEventListener('input', renderList);
  gradeEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', renderAll);
  hideEarnedEl.addEventListener('change', renderList);
  kindChipsEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    activeKind = chip.dataset.kind;
    for (const c of kindChipsEl.querySelectorAll('.chip')) c.classList.toggle('active', c === chip);
    renderList();
  });
  document.getElementById('tabChecklist').addEventListener('click', () => setView('checklist'));
  document.getElementById('tabRoadmap').addEventListener('click', () => setView('roadmap'));
  document.getElementById('tabMissable').addEventListener('click', () => setView('missable'));
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
}

boot();
