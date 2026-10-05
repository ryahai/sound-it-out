// A small reading school in the browser, laid out like the home learning app this tool grew beside:
// say how you feel, follow today's plan, take the break, collect stars and coins, finish with what went well.
// The reading content is made by the same code as the command-line tool, in a worker (demo-worker.js).
import { STAGES, graphemesUpTo } from './src/phonics.js';
import { LINES } from './voice-lines.js';

const $ = (sel) => document.querySelector(sel);
const app = $('#app');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const render = (html) => { app.innerHTML = html; window.scrollTo(0, 0); };
const waitClick = (sel) => new Promise((res) => {
  document.querySelectorAll(sel).forEach((b) => { b.onclick = () => res(b.dataset.v ?? ''); });
});

const FACES = ['🦁', '🐼', '🦊', '🐸', '🐵', '🐰'];
const LEVELS = ['Seedling', 'Sprout', 'Explorer', 'Pathfinder', 'Star Reader', 'Story Captain'];
const PER_LEVEL = 10;
const FRIENDS = [['turtle', '🐢', 'Tilly', 1], ['chick', '🐥', 'Pip', 2], ['fox', '🦊', 'Rusty', 3], ['dolphin', '🐬', 'Splash', 4], ['owl', '🦉', 'Hoot', 5], ['unicorn', '🦄', 'Comet', 6]]
  .map(([id, emoji, name, level]) => ({ id, emoji, name, level }));
const WORLDS = [['savannah', 'Savannah', 1], ['sea', 'Sea', 2], ['rainforest', 'Rainforest', 3], ['carnival', 'Carnival', 4], ['sunset', 'Sunset', 5], ['space', 'Space', 6]]
  .map(([id, name, level]) => ({ id, name, level }));
const REWARDS = [['📚', 'Choose tonight\'s story', 10], ['🎮', 'Ten minutes of a game', 20], ['🍪', 'Bake something together', 30], ['🏞️', 'Choose the weekend outing', 50]]
  .map(([emoji, title, cost], id) => ({ id, emoji, title, cost }));
const PLAN = [
  { id: 'checkin', kind: 'checkin', em: '🌤️', title: 'How are you feeling?', sub: 'Any feeling is okay.' },
  { id: 'ear', kind: 'read', em: '👂', title: 'Listen and say the word', sub: 'No letters. A grown-up says the parts, you say the whole word.' },
  { id: 'build', kind: 'read', em: '🧩', title: 'Build the word', sub: 'Hear the sounds, then tap the tiles in order.' },
  { id: 'words', kind: 'read', em: '🔤', title: 'Read the word', sub: 'Say each sound, then the whole word.' },
  { id: 'break', kind: 'break', em: '🧃', title: 'Break time', sub: 'Water, a snack, a stretch. No work now.', minutes: 3 },
  { id: 'chain', kind: 'read', em: '🔗', title: 'Word chains', sub: 'One sound changes each time. What changed?' },
  { id: 'phrases', kind: 'read', em: '🗣️', title: 'Phrases', sub: 'A few words that go together.', model: true },
  { id: 'sentences', kind: 'read', em: '📖', title: 'Sentences', sub: 'One sentence at a time, then tell what happened.', model: true },
  { id: 'story', kind: 'read', em: '📚', title: 'A story', sub: 'Five sentences about one person. Real reading.', model: true },
  { id: 'closing', kind: 'closing', em: '🌈', title: 'What went well today?', sub: 'Finish the day.' },
];

// ---------- what is remembered (on this device only) ----------
let S = { face: null, stars: 0, coins: 0, stage: 3, friend: 'turtle', world: 'savannah', voice: true, goal: null };
try { S = { ...S, ...JSON.parse(localStorage.getItem('readable-for-her') || '{}') }; } catch { /* storage may be blocked */ }
const keep = () => { try { localStorage.setItem('readable-for-her', JSON.stringify(S)); } catch { /* fine without it */ } };
const dayKey_ = () => new Date().toLocaleDateString('en-CA');      // the date where the child is, so a day ends at their midnight
const done = new Set(S.doneDay && S.doneDay.date === dayKey_() ? S.doneDay.ids : []);
{ // three orders for the reading activities, one per day in turn; the check-in stays first, the break in the middle, the closing last
  const order = [['ear', 'build', 'words', 'chain', 'phrases', 'sentences', 'story'], ['ear', 'chain', 'words', 'build', 'sentences', 'phrases', 'story'], ['build', 'ear', 'chain', 'words', 'phrases', 'story', 'sentences']][Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5) % 3];
  const by = Object.fromEntries(PLAN.map((b) => [b.id, b]));
  PLAN.splice(0, PLAN.length, by.checkin, ...order.slice(0, 3).map((k) => by[k]), by.break, ...order.slice(3).map((k) => by[k]), by.closing);
}
let greeted = false;
const level = () => Math.min(LEVELS.length, Math.floor(S.stars / PER_LEVEL) + 1);
const friend = () => FRIENDS.find((f) => f.id === S.friend) ?? FRIENDS[0];

// ---------- voice ----------
// A recorded natural voice (see voice-lines.js), the same in every browser. A line that has no
// recording is simply not spoken: the page never falls back to a robotic browser voice.
const KEY = new Map(Object.entries(LINES).map(([key, text]) => [text, key]));
let playing = null;
function hush() { if (playing) { playing.pause(); playing = null; } }
function speak(text) {
  hush();
  const key = KEY.get(String(text).trim());
  if (!S.voice || !key) return;
  playing = new Audio(`./voice/${key}.mp3`);
  playing.play().catch(() => { /* the browser wants a tap first: stay quiet */ });
}

// ---------- the helper that makes the reading content ----------
let worker = null;
function ask(message, onStatus) {
  if (!worker) worker = new Worker('./demo-worker.js', { type: 'module' });
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      if (data.type === 'status') onStatus?.(data.status);
      else if (data.type === 'error') reject(new Error(data.message));
      else resolve(data);
    };
    worker.onerror = (e) => reject(new Error(e.message || 'the page could not start its helper'));
    worker.postMessage(message);
  });
}
function restartWorker() { if (worker) worker.terminate(); worker = null; }

// ---------- stars, coins, levels ----------
function overlay(html, cls = '') {
  const ov = document.createElement('div');
  ov.className = `overlay ${cls}`;
  ov.innerHTML = html;
  document.body.append(ov);
  return ov;
}
function confetti() {
  const colors = ['#f2b705', '#3f7cc4', '#3c9a6a', '#f2a65a', '#8a6cc7', '#e86a92'];
  return `<div class="confetti">${Array.from({ length: 40 }, (_, i) => `<i style="left:${(i * 37) % 100}%;background:${colors[i % 6]};
    animation-duration:${3 + (i % 5) * 0.6}s;animation-delay:${-(i % 7) * 0.5}s"></i>`).join('')}</div>`;
}
function celebrate(emoji, title, text, button = 'Keep going', line = '', extra = '') {
  return new Promise((res) => {
    const ov = overlay(`${confetti()}<div class="celebrate-emoji">${emoji}</div><h1>${esc(title)}</h1>
      <p class="lesson-text">${esc(text)}</p>${extra}<button class="big-btn green">${esc(button)}</button>`, 'celebrate');
    speak(line);
    ov.querySelector('button').onclick = () => { ov.remove(); hush(); res(); };
  });
}
async function reward() {
  const before = level();
  S.stars += 1; S.coins += 1; keep();
  const toast = document.createElement('div');
  toast.className = 'coin-toast'; toast.textContent = '+1 ⭐   +1 🪙';
  document.body.append(toast); setTimeout(() => toast.remove(), 1400);
  const burst = document.createElement('div');
  burst.className = 'burst';
  for (let i = 0; i < 10; i++) {
    const star = document.createElement('i');
    const angle = (Math.PI * 2 * i) / 10;
    star.textContent = i % 2 ? '⭐' : '✨';
    star.style.setProperty('--x', `${Math.cos(angle) * 170}px`);
    star.style.setProperty('--y', `${Math.sin(angle) * 150}px`);
    burst.append(star);
  }
  document.body.append(burst); setTimeout(() => burst.remove(), 950);
  if (level() > before) {
    await new Promise((r) => setTimeout(r, 900));
    const lv = level();
    const pal = FRIENDS.find((f) => f.level === lv);
    const world = WORLDS.find((w) => w.level === lv);
    await celebrate('🎉', `Level ${lv}: ${LEVELS[lv - 1]}!`,
      `You unlocked a new friend, ${pal.emoji} ${pal.name}, and a new world, ${world.name}. Find them in My collection.`, 'Keep going', LINES.levelup);
  }
}

// ---------- screens ----------
function pickFace() {
  $('#dock').hidden = true;
  render(`<div class="stage"><h1>📖 Sound It Out</h1><p class="lesson-text">Who is reading today? Pick your face.</p>
    <div class="kids" style="width:100%;max-width:820px">${FACES.map((f) => `<button class="kid" data-v="${f}"><span class="face">${f}</span>That's me</button>`).join('')}</div>
    <p class="muted small" style="max-width:760px">No sign-up. A name is optional, and it stays on this device with the stars and coins.<br>
      Every word here is built from the letter-sounds your child has been taught.</p></div>`);
  waitClick('.kid').then((face) => { S.face = face; keep(); today(); });
}

function heroHtml() {
  const lv = level();
  const inLevel = S.stars - (lv - 1) * PER_LEVEL;
  const top = lv >= LEVELS.length;
  const next = FRIENDS.find((f) => f.level === lv + 1);
  return `<div class="hero">
    <div class="avatar"><span class="face">${S.face}</span><span class="pet">${friend().emoji}</span></div>
    <div class="grow" style="min-width:240px">
      <h1 style="margin:0">Hello, reader!</h1>
      <div><span class="level-badge">⭐ Level ${lv}</span><b>${LEVELS[lv - 1]}</b></div>
      <div class="xp-bar"><span style="width:${top ? 100 : Math.min(100, (inLevel / PER_LEVEL) * 100)}%"></span></div>
      <div class="muted small">${top ? 'You reached the top level! Keep collecting stars.' : `${inLevel} of ${PER_LEVEL} stars to Level ${lv + 1}`}${
        next ? ` · next prize: ${next.emoji} ${next.name}` : ''} · ⭐ ${S.stars} stars</div>
    </div>
    <div class="hero-buttons">
      <button class="big-btn soft" id="collection">🎒 My collection</button>
      <button class="big-btn soft" id="shop">🎁 Rewards · 🪙 ${S.coins}</button>
      <button class="big-btn soft" id="switch">🙂 Change face</button>
    </div></div>`;
}

function today() {
  document.body.dataset.theme = S.world;
  $('#dock').hidden = false;
  const next = PLAN.find((b) => !done.has(b.id));
  const lvNow = level();
  render(`<div class="home">
    <div class="hi"><div class="avatar"><span class="face">${S.face}</span><span class="pet">${friend().emoji}</span></div>
      <h1>Hello, ${S.name ? esc(S.name) : 'reader'}!</h1><div class="starline"><span class="level-badge">⭐ Level ${lvNow}</span> ⭐ ${S.stars} stars${streak_() > 1 ? ` · 🔥 ${streak_()} days in a row` : ''}</div></div>
    ${next ? `<button class="go" id="start"><span class="goem">${next.em}</span><span class="gotx"><small>Play next</small>${esc(next.title)}</span><span class="goarrow">▶</span></button>` : '<p class="lesson-text">All done for today. Well done! 🎉</p>'}
    <div class="tiles">${PLAN.map((b) => `<button class="block tile ${b === next ? 'next' : ''} ${done.has(b.id) ? 'done' : ''}" data-v="${b.id}">
        <span class="em">${b.em}</span><b>${esc(b.title)}</b>${done.has(b.id) ? '<span class="tick">✔</span>' : ''}</button>`).join('')}</div>
    <div class="mini"><button class="round" id="collection" aria-label="My collection">🎒<small>Collection</small></button>
      <button class="round" id="shop" aria-label="Rewards">🎁<small>🪙 ${S.coins}</small></button>
      <button class="round" id="switch" aria-label="Change face">🙂<small>Change</small></button></div>
    <details class="grown"${nudge_() ? ' open' : ''}><summary>For grown-ups</summary>${nudgeHtml_()}${grownTop()}
      <div class="card"><b>Which sounds has your child been taught?</b>
        <div class="sets">${STAGES.map((_, i) => `<button data-v="${i + 1}" class="${S.stage === i + 1 ? 'on' : ''}">Set ${i + 1}</button>`).join('')}</div>
        <div>Sounds in use: <span class="letters">${esc([...graphemesUpTo(S.stage)].join(' '))}</span> <span class="muted small">and the sight word “the”</span></div></div>
      <div class="card" style="margin-top:16px"><b>🔎 Check a sentence</b>
        <p class="muted small" style="margin:4px 0 0">Type any sentence from a book. It shows the words your child cannot sound out yet.</p>
        <div class="check-row"><input id="checkText" value="The duck is in the pond" aria-label="Sentence to check"><button class="big-btn soft" id="checkBtn">Check</button></div>
        <div class="words" id="checkOut"></div><p class="muted" id="checkSum" style="margin:.6em 0 0"></p></div>
      <p class="muted small center" style="margin-top:16px">Nothing your child does here is sent anywhere. Stars are kept only on this device.<br>
        Want pages to print as well? <a href="../">See the Sound It Out printables</a>.</p>
    </details></div>`);
  document.querySelectorAll('.sets button').forEach((b) => { b.onclick = () => { S.stage = Number(b.dataset.v); keep(); today(); }; });
  document.querySelectorAll('.block').forEach((b) => { b.onclick = () => startBlock(PLAN.find((x) => x.id === b.dataset.v)); });
  if (next) $('#start').onclick = () => startBlock(next);
  $('#collection').onclick = () => collection();
  $('#shop').onclick = shop;
  $('#switch').onclick = () => { hush(); pickFace(); };
  if ($('#nameSave')) $('#nameSave').onclick = () => { S.name = $('#nameIn').value.replace(/[<>]/g, '').trim().slice(0, 20); keep(); today(); };
  if ($('#nudgeYes')) $('#nudgeYes').onclick = () => { const n = nudge_(); if (n) { S.stage = n.to; S.nudgeOff = null; keep(); today(); } };
  if ($('#nudgeNo')) $('#nudgeNo').onclick = () => { const d = new Date(); d.setDate(d.getDate() + 3); S.nudgeOff = { stage: S.stage, until: d.toLocaleDateString('en-CA') }; keep(); today(); };
  if ($('#checkStart')) $('#checkStart').onclick = quickCheck;
  if ($('#sheetBtn')) $('#sheetBtn').onclick = practiceSheet;
  $('#checkBtn').onclick = async () => {
    const data = await ask({ step: 'check', stage: S.stage, sentence: $('#checkText').value });
    $('#checkOut').innerHTML = data.words.map((w) => `<span class="word ${w.ok ? '' : 'no'}"><b>${esc(w.word)}</b><small>${esc(w.how)}</small></span>`).join('');
    const stuck = data.words.filter((w) => !w.ok).length;
    $('#checkSum').textContent = stuck ? `${stuck} word(s) your child cannot sound out yet with set ${S.stage}.` : 'Your child can read every word.';
  };
  $('#checkText').onkeydown = (e) => { if (e.key === 'Enter') $('#checkBtn').click(); };
  if (!greeted) { greeted = true; speak(LINES.hello); }
}

async function startBlock(block) {
  if (block.kind === 'checkin') await checkin();
  else if (block.kind === 'break') await breakTime(block);
  else if (block.kind === 'closing') await closing();
  else if (!(await lesson(block))) return today();
  done.add(block.id); S.doneDay = { date: dayKey_(), ids: [...done] }; keep(); note_(block);
  today();
}

// ---------- feelings, calm corner, pause, break, closing ----------
async function checkin() {
  const faces = [['😢', 'very sad'], ['😟', 'worried'], ['😐', 'okay'], ['🙂', 'good'], ['😄', 'great']];
  render(`<div class="stage"><h1>How are you feeling today?</h1>
    <div class="faces">${faces.map(([f, w], i) => `<button data-v="${i}" aria-label="${w}">${f}</button>`).join('')}</div>
    <p class="muted">Any feeling is okay.</p></div>`);
  speak('Hello. How are you feeling today? Any feeling is okay.');
  const v = Number(await waitClick('.faces button'));
  if (v <= 1) {
    render(`<div class="stage"><h1>Thank you for telling me.</h1><p class="lesson-text">Would you like a calm break first, or shall we start gently?</p>
      <div class="row"><button class="big-btn soft" data-v="calm">Calm break</button><button class="big-btn" data-v="go">Start gently</button></div></div>`);
    speak('Thank you for telling me. Would you like a calm break first, or shall we start gently?');
    if ((await waitClick('[data-v]')) === 'calm') await calmCorner();
  }
}
function calmCorner() {
  return new Promise((res) => {
    if (document.querySelector('.overlay')) return res();
    const ov = overlay(`<h1>Calm corner</h1><div class="breathe"></div>
      <p class="lesson-text">Breathe in as the circle grows.<br>Breathe out as it gets smaller.<br>Take all the time you need.</p>
      <button class="big-btn green">I'm ready</button>`);
    speak('This is the calm corner. Breathe in as the circle grows. Breathe out as it gets smaller. Take all the time you need.');
    ov.querySelector('button').onclick = () => { ov.remove(); hush(); res(); };
  });
}
function pauseOverlay() {
  if (document.querySelector('.overlay')) return;
  hush();
  const ov = overlay(`<div style="font-size:5rem">⏸</div><h1>Paused</h1>
    <p class="lesson-text">Take your time. Your stars are saved.</p>
    <button class="big-btn green" id="resumeBtn">▶ Keep going</button><button class="big-btn soft" id="stopBtn">🏠 Stop for now</button>`);
  speak('Paused. Take your time. Your stars are saved.');
  ov.querySelector('#resumeBtn').onclick = () => { ov.remove(); hush(); };
  ov.querySelector('#stopBtn').onclick = () => { ov.remove(); hush(); stopLesson(); today(); };
}
async function breakTime(block) {
  render(`<div class="stage"><div style="font-size:6rem">🧃</div><h1>Break time</h1>
    <p class="lesson-text">Have some water or a snack. Stretch, move or rest. No work now.</p>
    <p class="muted" id="left"></p><button class="big-btn green" data-v="back">I'm back</button></div>`);
  speak('Break time. Have some water or a snack. Stretch, move or rest. No work now.');
  const end = Date.now() + block.minutes * 60000;
  const tick = () => {
    const m = Math.max(0, Math.ceil((end - Date.now()) / 60000));
    if ($('#left')) $('#left').textContent = m ? `About ${m} minute${m > 1 ? 's' : ''} of break left` : 'Come back when you are ready';
  };
  tick();
  const timer = setInterval(tick, 1000);
  await waitClick('[data-v="back"]');
  clearInterval(timer);
}
async function closing() {
  const chips = ['I tried hard', 'I learned something new', 'I asked for help', 'I sounded out a hard word', 'I took a break when I needed one', 'I kept going'];
  render(`<div class="stage"><h1>What went well today?</h1>
    <div class="chips">${chips.map((c) => `<button class="chip">${esc(c)}</button>`).join('')}</div>
    <button class="big-btn green" data-v="finish">Finish</button></div>`);
  speak('What went well today? Pick as many as you like.');
  document.querySelectorAll('.chip').forEach((c) => { c.onclick = () => { c.classList.toggle('on'); speak(c.textContent); }; });
  await waitClick('[data-v="finish"]');
  await celebrate('🌈', 'You finished today!', `You have ${S.stars} stars and ${S.coins} coins. See you next time.`, 'Done', LINES.finished);
}

// ---------- the reading lessons ----------
async function lesson(block, useModel = Boolean(block.model)) {
  const message = { step: block.id, stage: S.stage, level: S.stage <= 1 ? 'A' : S.stage === 2 ? 'D' : 'E', seed: 1 + Math.floor(Math.random() * 900), useModel };
  let wait = null;
  let skipped = false;
  if (useModel) {
    wait = overlay(`<div class="spinner"></div><div class="prompt" id="loadText">Getting ready</div>
      <p class="muted" style="max-width:640px;margin:0">Choosing sentences that make sense. The first time takes a little while.</p>
      <button class="big-btn soft">Skip the wait</button>`);
    wait.querySelector('button').onclick = () => { skipped = true; restartWorker(); wait.remove(); };
  }
  let data;
  try {
    data = await Promise.race([
      ask(message, (status) => { if ($('#loadText')) $('#loadText').textContent = status; }),
      new Promise((_, reject) => { const t = setInterval(() => { if (skipped) { clearInterval(t); reject(new Error('skipped')); } }, 200); }),
    ]);
  } catch (error) {
    wait?.remove();
    if (useModel) { restartWorker(); return lesson(block, false); }   // no model here: carry on with the rules alone
    await message_('🛠️', 'That could not start', error.message);
    return false;
  }
  wait?.remove();
  if (!data.items.length) {
    await message_('🧱', 'Not enough sounds yet', 'Nothing can be made from these letter-sounds yet. Choose a later set.');
    return false;
  }
  if (block.id === 'words') {      // up to three words the child needed help with come first
    const back = backWords_();
    if (back.length) data.items = [...back, ...data.items.filter((x) => !back.some((b) => b.word === x.word))].slice(0, Math.max(5, data.items.length));
  }
  const badge = `<div class="acthead"><span>${block.em}</span><b>${esc(block.title)}</b></div>`;
  let got = 0; hardRun_ = 0;
  for (let at = 0; at < data.items.length; at++) {
    const dots = data.items.map((_, i) => `<span class="${i < at ? 'got' : i === at ? 'on' : ''}"></span>`).join('');
    render(`${badge}<div class="progress-dots big">${dots}</div><div class="stage" id="stage"></div>`);
    lastHelped_ = false;
    const earned = await item(block, data, data.items[at], at);
    if (['words', 'phrases', 'sentences'].includes(block.id)) {      // two in a row needed help: the shorter ones come next
      hardRun_ = lastHelped_ ? hardRun_ + 1 : 0;
      if (hardRun_ >= 2) { const size = (x) => (Array.isArray(x.sounds) ? x.sounds.length : String(x.text || x.word || '').length);
        const rest = data.items.slice(at + 1).sort((x, y) => size(x) - size(y)); data.items.splice(at + 1, rest.length, ...rest); hardRun_ = 0; }
    }
    if (earned === null) return false;      // stopped from the pause screen or the home button
    if (earned) { got += 1; await reward(); await new Promise((r) => setTimeout(r, 850)); }
  }
  await celebrate(got >= 4 ? '🏆' : '🌟', `${got} of ${data.items.length} stars`,
    `${got >= 4 ? 'Brilliant reading!' : 'Good trying!'} Grown-up: ${data.rule}`, 'Back to today', got >= 4 ? LINES.great : LINES.trying, PAPER);
  return true;
}
const PAPER = '<p class="paperline">Grown-ups: <a href="../free-decodable-reading-sampler/" target="_blank" rel="noopener">practice this on paper. Print free pages</a></p>';
// what was practiced, kept on this device only: activities per day and per sound set
function note_(block) {
  if (['checkin', 'break', 'closing'].includes(block.id)) return;
  const day = new Date().toISOString().slice(0, 10);
  S.days = S.days || {}; S.days[day] = (S.days[day] || 0) + 1;
  S.sets = S.sets || {}; S.sets[S.stage] = (S.sets[S.stage] || 0) + 1;
  const keys = Object.keys(S.days).sort(); while (keys.length > 120) delete S.days[keys.shift()];
  keep();
}
function grownTop() {
  setTimeout(fillPaper, 0);
  const sets = S.sets || {}, days = Object.keys(S.days || {}).length, acts = Object.values(S.days || {}).reduce((x, y) => x + y, 0);
  const times = (n) => (n === 1 ? '1 activity' : `${n} activities`);
  const row = (g, i) => { const n = i + 1, c = sets[n] || 0, cls = n < S.stage ? 'was' : n === S.stage ? 'now' : 'later';
    const label = n < S.stage ? (c ? `practiced: ${times(c)}` : 'taught before') : n === S.stage ? `learning now${c ? ` · practiced: ${times(c)}` : ''}` : n === S.stage + 1 ? 'next' : 'later';
    return `<li class="${cls}"><span>Set ${n}</span><b>${esc(g.join(' '))}</b><i>${label}</i></li>`; };
  const paper = S.stage <= 2
    ? 'The free sampler has the whole of Set 2 on paper: words, sentences and stories that use only s a t p i n m d.'
    : `The Sound It Out workbook has words, word chains, sentences and stories for Set ${S.stage}, using only the sounds your child has been taught. Sets 2 to 7 are in one pack. You can try Set 2 free first.`;
  const hardWords = Object.entries(S.hard || {}).sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x[0]);
  const chk = S.check;
  return `<div class="card prog"><b>📈 Progress</b>
    <p class="muted small" style="margin:4px 0 10px">Your child is on <b>Set ${S.stage}</b>. Practiced on ${days === 1 ? '1 day' : `${days} days`}, ${times(acts)} in all, ${S.stars} stars.</p>
    <ol class="path">${STAGES.map(row).join('')}</ol>
    <p class="muted small" style="margin:10px 0 0">“Practiced” counts the activities finished in this app on this device. The app cannot hear your child read, so you decide when to move up: when your child gets four out of five without help, on two different days.</p></div>
  <div class="card" style="margin:16px 0"><b>🏷️ Your child’s name (optional)</b>
    <p class="muted small" style="margin:4px 0 10px">A first name or nickname. It is shown on the home screen and on practice sheets. It stays on this device and is never sent anywhere.</p>
    <div class="check-row"><input id="nameIn" maxlength="20" value="${esc(S.name || '')}" placeholder="For example: Sam" aria-label="Your child’s name"><button class="big-btn soft" id="nameSave">Save</button></div></div>
  <div class="card" style="margin:16px 0"><b>🎯 Words to practice</b>
    ${hardWords.length ? `<p class="muted small" style="margin:4px 0 10px">Words your child needed help with in this app. A word leaves the list when it is read without help.</p>
      <div class="hardwords">${hardWords.map((w) => `<span>${esc(w)}</span>`).join('')}</div><button class="big-btn green" id="sheetBtn" style="margin-top:12px;font-size:1.05rem;padding:12px 24px">Print a practice sheet for these words</button>`
      : '<p class="muted small" style="margin:4px 0 0">No tricky words yet. When your child presses “Show the sounds” or skips a word, it is listed here so you can practice it.</p>'}</div>
  <div class="card" style="margin:16px 0"><b>🔎 Quick reading check</b>
    <p class="muted small" style="margin:4px 0 12px">About 3 minutes. Your child sees a picture and taps the word that matches. It shows which set of sounds your child can read words from. It cannot hear your child read, so treat it as a guide.${chk ? ` Last check, ${esc(chk.date)}: Set ${chk.suggest} looked like the right place to practice.` : ''}</p>
    <button class="big-btn soft" id="checkStart" style="font-size:1.05rem;padding:12px 24px">Start the check</button></div>
  <div class="card paper" style="margin:16px 0"><b>🖨️ Practice Set ${Math.max(2, S.stage)} on paper</b><p class="muted small" style="margin:4px 0 12px">${paper}</p>
    <a class="big-btn green" href="../free-decodable-reading-sampler/" target="_blank" rel="noopener">Print free pages</a>
    <a class="big-btn soft" href="../sound-it-out-decodable-phonics-practice/" target="_blank" rel="noopener">See the full workbook</a>
    <a class="big-btn soft" href="../what-next/" target="_blank" rel="noopener">Get a plan for today</a><div id="paperMore"></div></div>`;
}
// ---- what the child needed help with, the streak, the practice sheet and the quick check (all kept on this device)
const wordsOf = (t) => String(t).toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && w !== 'the');
let lastHelped_ = false, hardRun_ = 0;
// What was read today at the current set: without help, and with help or skipped. Kept for two weeks, on this device.
function stat_(ok) {
  const day = dayKey_(); S.stat = S.stat || {};
  if (!S.stat[day] || S.stat[day].set !== S.stage) S.stat[day] = { set: S.stage, ok: 0, help: 0 };
  S.stat[day][ok ? 'ok' : 'help'] += 1;
  const ks = Object.keys(S.stat).sort(); while (ks.length > 14) delete S.stat[ks.shift()];
  keep();
}
// A suggestion for the grown-up, never a change made by the app: move up after two days with most items read without
// help; offer to go back after two days in a row where most items needed help. A day counts only with 5 or more items.
function nudge_() {
  if (S.nudgeOff && S.nudgeOff.stage === S.stage && dayKey_() < S.nudgeOff.until) return null;
  const days = Object.entries(S.stat || {}).filter(([, d]) => d.set === S.stage && d.ok + d.help >= 5).sort((x, y) => (x[0] < y[0] ? -1 : 1));
  const good = days.filter(([, d]) => d.ok / (d.ok + d.help) >= 0.8), last2 = days.slice(-2);
  if (good.length >= 2 && S.stage < STAGES.length) { const d = good[good.length - 1][1]; return { kind: 'up', to: S.stage + 1, text: `Your child read ${d.ok} of ${d.ok + d.help} without help, and did as well on ${good.length === 2 ? 'one other day' : `${good.length - 1} other days`}. Ready to try Set ${S.stage + 1}?` }; }
  if (last2.length === 2 && last2.every(([, d]) => d.ok / (d.ok + d.help) <= 0.5) && S.stage > 1) { const d = last2[1][1]; return { kind: 'down', to: S.stage - 1, text: `Set ${S.stage} looks hard right now: your child needed help with ${d.help} of ${d.ok + d.help} last time. You can stay here, or go back to Set ${S.stage - 1} for a while.` }; }
  return null;
}
function nudgeHtml_() {
  const n = nudge_(); if (!n) return '';
  return `<div class="card nudge ${n.kind}"><b>${n.kind === 'up' ? '🌟 Ready for the next set?' : '🫶 A hard patch'}</b><p style="margin:6px 0 12px">${esc(n.text)}</p>
    <button class="big-btn green" id="nudgeYes" style="font-size:1.05rem;padding:12px 24px">${n.kind === 'up' ? `Move to Set ${n.to}` : `Go back to Set ${n.to}`}</button>
    <button class="big-btn soft" id="nudgeNo" style="font-size:1.05rem;padding:12px 24px">${n.kind === 'up' ? 'Not yet' : `Stay on Set ${S.stage}`}</button>
    <p class="muted small" style="margin:10px 0 0">This is only a suggestion from the buttons pressed in this app. It cannot hear your child read. You decide.</p></div>`;
}
function backWords_() {
  const known = [...graphemesUpTo(S.stage)].sort((x, y) => y.length - x.length), out = [];
  for (const [w] of Object.entries(S.hard || {}).sort((x, y) => y[1] - x[1])) {
    const sounds = []; let rest = w;
    while (rest) { const g = known.find((k) => rest.startsWith(k)); if (!g) break; sounds.push(g); rest = rest.slice(g.length); }
    if (!rest && sounds.length >= 2) out.push({ word: w, sounds });      // only words that can be sounded out with the child's set
    if (out.length === 3) break;
  }
  return out;
}
function hard_(t) { const ws = wordsOf(t); if (ws.length !== 1) return; S.hard = S.hard || {}; S.hard[ws[0]] = Math.min(5, (S.hard[ws[0]] || 0) + 1);
  const ks = Object.keys(S.hard); if (ks.length > 40) delete S.hard[ks[0]]; keep(); }
function easy_(t) { const ws = wordsOf(t); if (ws.length !== 1 || !S.hard || !S.hard[ws[0]]) return; S.hard[ws[0]] -= 1; if (S.hard[ws[0]] <= 0) delete S.hard[ws[0]]; keep(); }
function streak_() { const d = S.days || {}, day = new Date(); let n = 0; if (!d[day.toISOString().slice(0, 10)]) day.setUTCDate(day.getUTCDate() - 1);
  while (d[day.toISOString().slice(0, 10)]) { n += 1; day.setUTCDate(day.getUTCDate() - 1); } return n; }
function practiceSheet() {
  const ws = Object.entries(S.hard || {}).sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x[0]);
  if (!ws.length) return;
  const w = window.open('', '_blank'); if (!w) return;
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Practice words</title><style>
@page{margin:14mm}*{box-sizing:border-box}body{font-family:"Comic Sans MS","Trebuchet MS",Arial,sans-serif;color:#1f2a44;margin:0;padding:10px}
h1{font-size:26pt;margin:0 0 2mm}p{margin:0 0 6mm;font-size:12pt}.row{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:6mm;align-items:center;border:2pt solid #1f2a44;border-radius:6mm;padding:5mm 6mm;margin-bottom:5mm;break-inside:avoid}
.say{font-size:34pt;font-weight:700;letter-spacing:3pt}.say small{display:block;font-size:10pt;letter-spacing:0;font-weight:400}.trace{font-size:34pt;font-weight:700;letter-spacing:3pt;color:transparent;-webkit-text-stroke:1.2pt #9aa3b2}
.write{border-bottom:2pt solid #1f2a44;height:16mm;position:relative}.write:before{content:"";position:absolute;left:0;right:0;top:50%;border-top:1pt dashed #9aa3b2}
.stars{font-size:16pt;letter-spacing:4pt}.foot{font-size:10pt;color:#55617a;margin-top:6mm;display:flex;justify-content:space-between}button{font:inherit;font-size:13pt;padding:8px 20px;border-radius:99px;border:2px solid #1f2a44;background:#ffe066;cursor:pointer;margin-bottom:6mm}
@media print{button{display:none}}</style></head><body><button onclick="print()">Print this page</button>
<h1>${S.name ? `${esc(S.name)}’s practice words` : 'My practice words'}</h1><p>Point under each sound and say it. Say the word. Trace it. Write it. Color a star each time you read it.</p>
${ws.map((x) => `<div class="row"><div class="say">${esc(x)}<small>Read it</small><span class="stars">☆☆☆</span></div><div class="trace">${esc(x)}</div><div class="write"></div></div>`).join('')}
<div class="foot"><span>${S.name ? `Name: ${esc(S.name)}` : 'Name ______________________'}</span><span>Sound It Out · ryahai.github.io/sound-it-out</span></div></body></html>`);
  w.document.close();
}
// The quick check: a picture and three words; the child taps the word. Words of each set use only that set's sounds,
// and the wrong words start with the same letter, so the first letter alone is not enough.
const CHECK = { 2: [['📌', 'pin', 'pan', 'pit'], ['🍳', 'pan', 'pin', 'pat'], ['🗺️', 'map', 'mat', 'man'], ['🐜', 'ant', 'and', 'at']],
  3: [['🐱', 'cat', 'cot', 'can'], ['🐶', 'dog', 'dig', 'dot'], ['🐷', 'pig', 'pin', 'pit'], ['🥫', 'can', 'cat', 'cap']],
  4: [['☀️', 'sun', 'sum', 'sit'], ['🖊️', 'pen', 'pin', 'peg'], ['🐀', 'rat', 'ran', 'rag'], ['🦆', 'duck', 'dock', 'deck']],
  5: [['🎩', 'hat', 'hit', 'ham'], ['🚌', 'bus', 'bug', 'but'], ['🛏️', 'bed', 'bad', 'beg'], ['🔔', 'bell', 'bill', 'beg']],
  6: [['🦊', 'fox', 'fix', 'fog'], ['📦', 'box', 'bog', 'bit'], ['🚐', 'van', 'vat', 'vet'], ['🕸️', 'web', 'wet', 'wed']] };
async function quickCheck() {
  hush(); $('#dock').hidden = false;
  const scores = {}; let top = 1, stop = false;
  for (const set of [2, 3, 4, 5, 6]) {
    if (stop) break;
    let right = 0;
    for (const [pic, word, w1, w2] of CHECK[set]) {
      const options = [word, w1, w2].sort(() => Math.random() - 0.5);
      render(`<div class="acthead"><span>🔎</span><b>Quick check</b></div><div class="stage"><div class="prompt">Tap the word that matches the picture.</div>
        <div style="font-size:7rem;line-height:1.1;margin:10px 0">${pic}</div><div class="options">${options.map((o) => `<button class="opt" data-w="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`);
      const picked = await new Promise((res) => { document.querySelectorAll('.opt').forEach((b) => { b.onclick = () => res(b.dataset.w); }); });
      if (picked === word) right += 1;
    }
    scores[set] = right;
    if (right >= 3) top = set; else stop = true;
  }
  const suggest = Math.min(7, stop ? Math.max(1, top + (scores[top + 1] === undefined ? 0 : 1)) : 7);
  S.check = { date: new Date().toISOString().slice(0, 10), scores, suggest }; keep();
  render(`<div class="card" style="max-width:720px;margin:20px auto;text-align:left"><h1 style="margin-top:0">🔎 Check finished</h1>
    <p>For the grown-up. Your child matched pictures to words:</p><ul>${Object.entries(scores).map(([k, v]) => `<li>Set ${k} words: ${v} of 4</li>`).join('')}</ul>
    <p><b>Set ${suggest}</b> looks like the right place to practice now.</p>
    <p class="muted small">This check only shows matching a picture to a word. It cannot hear your child read, and a child can guess. You know your child best.</p>
    <div class="row" style="gap:10px;flex-wrap:wrap"><button class="big-btn green" id="useSet">Use Set ${suggest}</button><button class="big-btn soft" id="noSet">Keep Set ${S.stage}</button></div></div>`);
  $('#useSet').onclick = () => { S.stage = suggest; keep(); today(); };
  $('#noSet').onclick = () => today();
}
// Reading and sight-word pages now on the website, read from the site's own list (free ones first).
function fillPaper() {
  const box = document.getElementById('paperMore');
  if (!box) return;
  fetch('../search.json').then((r) => r.json()).then((all) => {
    const shown = ['free-decodable-reading-sampler/', 'sound-it-out-decodable-phonics-practice/'];
    const items = all.filter((x) => (x.c === 'Learn to Read' || x.c === 'Sight Words') && (x.k === 'Pack' || x.k === 'Free') && !shown.includes(x.u))
      .sort((x, y) => (y.k === 'Free') - (x.k === 'Free')).slice(0, 8);
    if (!items.length || !document.body.contains(box)) return;
    box.innerHTML = '<p class="muted small" style="margin:14px 0 8px"><b>More reading pages to print</b></p>' + items.map((x) =>
      `<a class="morelink" href="../${esc(x.u)}" target="_blank" rel="noopener"><span>${esc(x.t)}</span><small>${x.k === 'Free' ? 'FREE' : esc(x.p || '')}</small></a>`).join('');
  }).catch(() => { /* the list is a bonus; the two links above always work */ });
}
function message_(emoji, title, text) {
  return new Promise((res) => {
    const ov = overlay(`<div style="font-size:5rem">${emoji}</div><h1>${esc(title)}</h1><p class="lesson-text">${esc(text)}</p><button class="big-btn">OK</button>`);
    ov.querySelector('button').onclick = () => { ov.remove(); res(); };
  });
}

function item(block, data, it, at) {
  const stage = $('#stage');
  return new Promise((res) => {
    const readIt = (bigHtml, soundsText, tell, say) => {
      stage.innerHTML = `<div class="prompt">${esc(data.about)}</div><div class="read">${bigHtml}</div><div class="soundline" id="snd"></div>
        <div class="row" style="justify-content:center"><button class="big-btn green" id="yes">✔ I read it</button>
        <button class="big-btn soft" id="hint">Show the sounds</button><button class="big-btn soft" id="skip">Try another</button></div>
        <div class="feedback help">${tell ? esc(tell) : ''}</div>`;
      if (say) speak(say);
      $('#yes').onclick = () => { $('#yes').disabled = true; if (!$('#snd').textContent) easy_(stage.querySelector('.read').textContent); stat_(!$('#snd').textContent); speak('Well done!'); res(true); };
      $('#hint').onclick = () => { $('#snd').textContent = soundsText; lastHelped_ = true; hard_(stage.querySelector('.read').textContent); };
      $('#skip').onclick = () => { lastHelped_ = true; stat_(false); hard_(stage.querySelector('.read').textContent); res(false); };
    };
    if (block.id === 'ear') {
      const options = [...new Set(it.options)].sort(() => Math.random() - 0.5);
      stage.innerHTML = `<div class="prompt">Grown-up, say the parts slowly with a gap. No letters to look at.</div>
        <div class="say">${it.say.map(esc).join(' &nbsp;…&nbsp; ')}</div><div class="prompt">What word is it?</div>
        <div class="options">${options.map((o) => `<button class="opt" data-w="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback" id="fb"></div>`;
      speak('Listen to the parts. What word is it?');
      stage.querySelectorAll('.opt').forEach((b) => { b.onclick = () => {
        if (b.dataset.w === it.word) {
          b.classList.add('right'); $('#fb').className = 'feedback good'; $('#fb').textContent = `Yes! ${it.word}`; speak(LINES.yes);
          stage.querySelectorAll('.opt').forEach((x) => { x.onclick = null; }); res(true);
        } else { b.classList.add('wrong'); $('#fb').className = 'feedback help'; $('#fb').textContent = 'Listen again. Push the parts together.'; speak('Listen again. Push the parts together.'); }
      }; });
    } else if (block.id === 'build') {
      const extra = [...graphemesUpTo(S.stage)].filter((g) => !it.sounds.includes(g)).slice(at, at + 2);
      const tiles = [...it.sounds, ...extra].sort(() => Math.random() - 0.5);
      let built = [];
      stage.innerHTML = `<div class="prompt">Grown-up, say the sounds. Your child builds the word.</div>
        <div class="say">${it.sounds.map(esc).join(' &nbsp;…&nbsp; ')}</div><div class="answer-box" id="box">&nbsp;</div>
        <div class="tiles">${tiles.map((g) => `<button class="tile" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div>
        <div class="row" style="justify-content:center"><button class="big-btn soft" id="clear">Start again</button><button class="big-btn soft" id="skip">Try another</button></div>
        <div class="feedback" id="fb"></div>`;
      speak('Build the word. Tap the sounds in order.');
      const redraw = () => { $('#box').textContent = built.join('') || ' '; };
      $('#clear').onclick = () => { built = []; stage.querySelectorAll('.tile').forEach((t) => t.classList.remove('used')); $('#fb').textContent = ''; redraw(); };
      $('#skip').onclick = () => res(false);
      stage.querySelectorAll('.tile').forEach((t) => { t.onclick = () => {
        built.push(t.dataset.g); t.classList.add('used'); redraw();
        if (built.length < it.sounds.length) return;
        if (built.join('') === it.word) {
          $('#box').classList.add('right'); $('#fb').className = 'feedback good'; $('#fb').textContent = `You built ${it.word}!`; speak(LINES.built);
          stage.querySelectorAll('.tile').forEach((x) => { x.onclick = null; }); res(true);
        } else { $('#fb').className = 'feedback help'; $('#fb').textContent = 'Not yet. Say each sound and try again.'; speak('Not yet. Say each sound and try again.'); setTimeout(() => $('#clear')?.click(), 900); }
      }; });
    } else if (block.id === 'words') {
      readIt(esc(it.word), it.sounds.join('  -  '), '', 'Say each sound, then the word.');
    } else if (block.id === 'chain') {
      let n = 0;
      const draw = () => {
        const word = it.chain[n], prev = it.chain[n - 1];
        const html = [...word].map((ch, i) => (prev && prev[i] !== ch ? `<span class="new">${esc(ch)}</span>` : esc(ch))).join('');
        stage.innerHTML = `<div class="prompt">${esc(data.about)}</div><div class="muted">${it.chain.slice(0, n).map(esc).join('  →  ') || '&nbsp;'}</div>
          <div class="read">${html}</div><div class="row" style="justify-content:center"><button class="big-btn green" id="yes">✔ I read it</button></div>
          <div class="feedback help">${n ? 'What changed?' : 'Read the first word.'}</div>`;
        speak(n ? 'What changed?' : 'Read the first word.');
        $('#yes').onclick = () => { n += 1; if (n >= it.chain.length) { $('#yes').disabled = true; speak('Well done!'); res(true); } else draw(); };
      };
      draw();
    } else {
      readIt(esc(it.text), it.sounds, block.id === 'story' ? `Sentence ${at + 1} of the story` : '', at === 0 ? 'Read it out loud.' : '');
    }
    stopLesson = () => res(null);
  });
}
let stopLesson = () => {};

// ---------- collection and rewards ----------
function collection(tab = 'friend') {
  const lv = level();
  const cards = (tab === 'friend' ? FRIENDS : WORLDS).map((u) => {
    const open = lv >= u.level;
    const using = (tab === 'friend' ? S.friend : S.world) === u.id;
    const look = tab === 'friend' ? `<div class="big">${u.emoji}</div>` : `<div class="theme-swatch" data-theme="${u.id}"></div>`;
    return `<div class="collect ${open ? '' : 'locked'}">${look}<b>${esc(u.name)}</b>${
      !open ? `<div class="muted">🔒 Level ${u.level}</div>` : using ? '<div class="using">✓ Using</div>' : `<button data-v="${u.id}">Use this</button>`}</div>`;
  }).join('');
  render(`<div class="row"><h1 class="grow">🎒 My collection</h1><button class="big-btn soft" id="back">Back</button></div>
    <p class="muted">⭐ Level ${lv} ${LEVELS[lv - 1]} · every 10 stars is a new level, with a new friend and a new world.</p>
    <div class="collection-tabs"><button class="${tab === 'friend' ? 'on' : ''}" data-tab="friend">🐾 Friends</button>
      <button class="${tab === 'world' ? 'on' : ''}" data-tab="world">🎨 Worlds</button></div>
    <div class="collection">${cards}</div>`);
  $('#back').onclick = today;
  document.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => collection(b.dataset.tab); });
  document.querySelectorAll('.collect button').forEach((b) => { b.onclick = () => {
    if (tab === 'friend') S.friend = b.dataset.v; else { S.world = b.dataset.v; document.body.dataset.theme = S.world; }
    keep(); collection(tab);
  }; });
}
function shop() {
  const goal = REWARDS.find((r) => r.id === S.goal);
  render(`<div class="row"><h1 class="grow">🎁 Rewards</h1><button class="big-btn soft" id="back">Back</button></div>
    <div class="card"><b>🪙 ${S.coins} coins</b> <span class="muted">· one coin for every star. A grown-up agrees each reward.</span>
      ${goal ? `<p>Saving for ${goal.emoji} <b>${esc(goal.title)}</b>: ${Math.min(S.coins, goal.cost)} of ${goal.cost}</p>
      <div class="coin-bar"><span style="width:${Math.min(100, Math.round((100 * S.coins) / goal.cost))}%"></span></div>` : ''}</div>
    <div class="shop">${REWARDS.map((r) => `<div class="card shop-item"><div style="font-size:2.6rem">${r.emoji}</div><h3>${esc(r.title)}</h3><p><b>🪙 ${r.cost}</b></p>
      <div class="coin-bar"><span style="width:${Math.min(100, Math.round((100 * S.coins) / r.cost))}%"></span></div>
      ${S.coins >= r.cost ? `<button class="big-btn green" data-v="${r.id}">I'd like this</button>`
        : `<p class="muted">${r.cost - S.coins} more coins to go</p><button class="big-btn soft" data-save="${r.id}">Save for this</button>`}</div>`).join('')}</div>`);
  $('#back').onclick = today;
  document.querySelectorAll('[data-save]').forEach((b) => { b.onclick = () => { S.goal = Number(b.dataset.save); keep(); shop(); }; });
  document.querySelectorAll('.shop-item [data-v]').forEach((b) => { b.onclick = async () => {
    const r = REWARDS[Number(b.dataset.v)];
    const ov = overlay(`<div style="font-size:5rem">${r.emoji}</div><h1>${esc(r.title)}</h1>
      <p class="lesson-text">Show this to your grown-up.</p>
      <button class="big-btn green" data-v="yes">Grown-up: yes, spend 🪙 ${r.cost}</button><button class="big-btn soft" data-v="no">Not now</button>`);
    ov.querySelectorAll('button').forEach((x) => { x.onclick = () => {
      if (x.dataset.v === 'yes') { S.coins -= r.cost; if (S.goal === r.id) S.goal = null; keep(); }
      ov.remove(); shop();
    }; });
  }; });
}

// ---------- dock ----------
$('#homeBtn').onclick = () => { hush(); stopLesson(); if (S.face) today(); };
$('#calmBtn').onclick = () => calmCorner();
$('#pauseBtn').onclick = () => pauseOverlay();
const voiceBtn = $('#voiceBtn');
const showVoice = () => { voiceBtn.setAttribute('aria-pressed', String(S.voice)); voiceBtn.textContent = S.voice ? '🔊 Read aloud' : '🔇 Read aloud off'; };
voiceBtn.onclick = () => { S.voice = !S.voice; keep(); if (!S.voice) hush(); showVoice(); };
showVoice();

document.body.dataset.theme = S.world;
const Q = new URLSearchParams(location.search), playId = Q.get('play'), playSet = Number(Q.get('set'));
if (playId && PLAN.some((b) => b.id === playId && b.kind === 'read')) {
  if (!S.face) { S.face = '🦁'; if (!(playSet >= 1 && playSet <= STAGES.length)) S.stage = 2; }      // a first-time visitor starts with eight sounds
  if (playSet >= 1 && playSet <= STAGES.length) S.stage = playSet;
  keep(); $('#dock').hidden = false; startBlock(PLAN.find((b) => b.id === playId));
} else if (S.face) today(); else pickFace();
