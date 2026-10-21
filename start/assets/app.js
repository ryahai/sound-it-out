/* Sound It Out guided app (the NEW FEEL prototype, wired to the site by site/newfeel/newfeel.mjs) */
/* NEW FEEL prototype: the guided visit, the learning path, the real book. Classic script (works from file://). */
(function () {
'use strict';
var SIO = window.SIO || {}, BRAND = SIO.brand || 'Sound It Out';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var PHONE = function () { return innerWidth < 900; };
var SPRING = 'linear(0,.088,.278,.532,.768,.969,1.127,1.214,1.247,1.233,1.191,1.13,1.071,1.019,.976,.951,.94,.941,.95,.964,.979,.992,1.004,1.011,1.015,1.015,1.013,1.01,1.006,1.003,1,.998,.997,.996,.997,.997,.998,.999,1,1,1)';
var SNAP = 'linear(0,.029,.086,.175,.263,.37,.461,.561,.641,.723,.785,.847,.89,.932,.96,.986,1.002,1.016,1.023,1.029,1.031,1.031,1.03,1.028,1.025,1.022,1.019,1.016,1.013,1.011,1.008,1.006,1.005,1.003,1.002,1.001,1,1,.999,.999,1)';
var EASE = 'cubic-bezier(.2,.8,.2,1)';
function anim(el, kf, o) { if (!el || !el.animate) return { finished: Promise.resolve() }; if (RM) o = Object.assign({}, o, { duration: 1 }); return el.animate(kf, o); }
var store = {
  get: function () { try { return JSON.parse(localStorage.getItem('sio.p') || 'null'); } catch (e) { return null; } },
  set: function (p) { try { localStorage.setItem('sio.p', JSON.stringify(p)); } catch (e) {} },
  clear: function () { try { localStorage.removeItem('sio.p'); } catch (e) {} }
};
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

var AS = SIO.as || AS + '', ROOT = SIO.root || '', LASTST = null;
function sioEv(d) { try { document.dispatchEvent(new CustomEvent('sio:pack', { detail: String(d).slice(0, 60) })); } catch (e) {} }
function tplUrl(id) { var u = (SIO.tpl || {})[id]; return u ? ROOT + u : ''; }
function curStep() { try { var p = profOrDefault(); return findStep(pathKey(p.grade, p.subject), p.step); } catch (e) { return null; } }
function makerFor(st) { if (!st) return ''; var c = st.code || '', m = SIO.mk || {}; if (m[c]) return ROOT + m[c]; var id = (st.sh || [])[0]; return id ? tplUrl(id) : ''; }
// Print: prints the very sheets on screen, one per page (the book screen: the whole book as customized; the child's page: today's
// sheets). Each zoomed sheet also has "Print or change this sheet", which opens the free maker set to make exactly that sheet.
function printNow() { var st = LASTST || curStep() || {}, ids = (st.sh || []).slice(), onBook = parse().r === 'book';
  try { var p = profOrDefault(), c = JSON.parse(localStorage.getItem('sio.pack.' + pathKey(p.grade, p.subject) + '.' + st.id) || 'null'); if (onBook && c && c.sh && c.sh.length) ids = c.sh.slice(); } catch (e) {}
  if (!onBook && !LASTST) ids = ids.slice(0, 3);
  if (!ids.length) { location.href = makerFor(st) || ROOT + 'free-worksheet-maker/'; return; }
  sioEv('print ' + (st.id || '') + ' ' + ids.length);
  var d = document.getElementById('nfprint'); if (d) d.remove(); d = document.createElement('div'); d.id = 'nfprint'; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = ids.map(function (id) { return '<img src="' + AS + 'sheets/' + id + '-1800.webp" alt="" width="2025" height="2619">'; }).join(''); document.body.appendChild(d);
  toast(ids.length === 1 ? 'Getting the page ready to print' : 'Getting ' + ids.length + ' pages ready to print');
  Promise.all([].map.call(d.querySelectorAll('img'), function (i) { return i.decode ? i.decode().catch(function () {}) : 0; })).then(function () { setTimeout(function () { window.print(); }, 60); }); }
function makersNow() { var st = LASTST || curStep(); location.href = makerFor(st) || ROOT + 'free-worksheet-maker/'; }
var SJ = null, SJP = null;
function sjLoad() { if (!SJP) SJP = fetch(ROOT + 'search.json').then(function (r) { return r.json(); }).then(function (j) { SJ = j; return j; }).catch(function () { SJ = []; return SJ; }); return SJP; }
function siteHits(q) { siteHits.n = 0; if (!SJ) { sjLoad().then(function () { var i = document.querySelector('.askpane input'); if (i && i.value) i.dispatchEvent(new Event('input')); }); return ''; }
  var w = q.toLowerCase().split(/\s+/).filter(function (x) { return x.length > 1; }); if (!w.length) return '';
  var hits = SJ.map(function (x) { var t = ((x.t || '') + ' ' + (x.w || '') + ' ' + (x.c || '')).toLowerCase(), s = 0; w.forEach(function (y) { if (t.indexOf(y) >= 0) s += (x.t || '').toLowerCase().indexOf(y) >= 0 ? 2 : 1; }); return { x: x, s: s }; })
    .filter(function (h) { return h.s >= w.length; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4);
  siteHits.n = hits.length; if (!hits.length) return '';
  return '<p style="font:600 16px/1 var(--font);color:var(--ink3);margin:18px 0 4px">On the site</p>' + hits.map(function (h) { var x = h.x; return '<a class="rowlink" href="' + esc(ROOT + x.u) + '">' + (x.i ? '<span class="thumb" style="width:52px;height:67px;border-radius:6px;overflow:hidden;flex:none;box-shadow:0 0 0 1px var(--line)"><img src="' + esc(ROOT + x.i) + '" alt="" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block"></span>' : '<span class="node" style="width:52px;height:52px;flex:none;box-shadow:0 4px 0 var(--d)">' + I.book + '</span>') + '<span><strong>' + esc(x.t) + '</strong><small>' + esc((x.k ? x.k + ' · ' : '') + (x.c || '')) + '</small></span><span class="go">' + I.next + '</span></a>'; }).join(''); }
function siteLinks() { var L = SIO.site || []; if (!L.length) return ''; return '<h2 style="font-size:30px;margin:34px 0 14px">Everything on the site</h2><div class="xrow">' + L.map(function (x) { return '<a class="rowlink nf-xl" style="--c:var(--' + (x[4] || 'sky') + ');--d:var(--' + (x[4] || 'sky') + 'D);--t:var(--' + (x[4] || 'sky') + 'T)" href="' + esc(ROOT + x[0]) + '"><span class="nf-xi">' + (I[x[2]] || I.next) + '</span><span><strong>' + esc(x[1]) + '</strong><small>' + esc(x[3] || '') + '</small></span><span class="go">' + I.next + '</span></a>'; }).join('') + '</div>'; }
var poss = function (n) { return n ? n + (/s$/i.test(n) ? "'" : "'s") : 'Your'; };

/* ---------------- icons (vector, razor sharp at any size) ---------------- */
var I = {
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" stroke="none" opacity=".9"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>',
  tune: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 7h6M8 11h6"/></svg>',
  parent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6.5" r="2.6"/><path d="M4.5 20v-4.5a4.5 4.5 0 0 1 9 0V20"/><circle cx="17" cy="10" r="2"/><path d="M14.5 20v-2.8a2.5 2.5 0 0 1 5 0V20"/></svg>',
  teacher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.5" width="18" height="11.5" rx="2"/><path d="M7 8h7M7 11h4M9 20l3-5 3 5"/></svg>',
  homeschool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.8 9v11h12.4V9"/><path d="M9 14.5c1-.6 2-.6 3 0 1-.6 2-.6 3 0V19c-1-.6-2-.6-3 0-1-.6-2-.6-3 0z"/></svg>',
  reading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5.5c3.3-1.3 6.5-1 9.5 1v13c-3-2-6.2-2.3-9.5-1z"/><path d="M21.5 5.5c-3.3-1.3-6.5-1-9.5 1v13c3-2 6.2-2.3 9.5-1z"/></svg>',
  writing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 4.5l4 4L9 19l-5 1 1-5z"/><path d="M13.5 6.5l4 4"/></svg>',
  math: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 9h4M9.5 7v4M13.5 9h3.5M7.5 15.5l3 0M13.5 14l3 3M16.5 14l-3 3"/></svg>',
  unsure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
  grow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M7 20v-5M12 20V10M17 20V5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  flag: '<svg viewBox="0 0 30 20" class="flag" aria-hidden="true"><rect width="30" height="20" rx="3" fill="#fff"/><g fill="#d6334a"><rect y="0" width="30" height="2.2" rx="1"/><rect y="4.45" width="30" height="2.2"/><rect y="8.9" width="30" height="2.2"/><rect y="13.35" width="30" height="2.2"/><rect y="17.8" width="30" height="2.2" rx="1"/></g><rect width="13" height="11.1" rx="2" fill="#2f4fa0"/><g fill="#fff"><circle cx="3" cy="2.8" r=".8"/><circle cx="6.5" cy="2.8" r=".8"/><circle cx="10" cy="2.8" r=".8"/><circle cx="4.7" cy="5.5" r=".8"/><circle cx="8.2" cy="5.5" r=".8"/><circle cx="3" cy="8.2" r=".8"/><circle cx="6.5" cy="8.2" r=".8"/><circle cx="10" cy="8.2" r=".8"/></g><rect width="30" height="20" rx="3" fill="none" stroke="rgba(22,36,92,.18)"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9"/></svg>'
};

// our own icon set (src/icons.mjs, put on the page by build.mjs) replaces the plain ones above
if (SIO.ic) Object.keys(SIO.ic).forEach(function (k) { I[k] = SIO.ic[k]; });
var BD = SIO.bd || {};
// one picture per kind of skill, from the standard's code
function badgeOf(x) {
  var c = (x && x.code) || '', id = (x && x.id) || '';
  if (/^RF\.K\.1[abc]/.test(c)) return 'print';
  if (id === 'blend') return 'blend';
  if (/^RF\.K\.2/.test(c) || id === 'sounds' || id === 'begin') return 'sound';
  if (/^RF\.K\.1d/.test(c) || /^L\.K\.(1a|2c|2d)/.test(c) || ['letters', 'trace', 'hand', 'name', 'spella'].indexOf(id) >= 0) return 'letter';
  if (/^RF\.K\.3b/.test(c) || /^short/.test(id)) return 'word';
  if (/^RF\.K\.3c/.test(c) || id === 'sight' || id === 'heart') return 'heart';
  if (/^RF\.K\.3d/.test(c)) return 'swap';
  if (/^RF\.K\.4|^RL/.test(c) || id === 'story') return 'story';
  if (/^RI/.test(c) || /^h\d/.test(id)) return 'fact';
  if (/^W\./.test(c)) return 'write';
  if (/^L\./.test(c)) return 'sentence';
  if (/K\.CC\.A\.3/.test(c) || id === 'numt') return 'numeral';
  if (/K\.CC\.C/.test(c)) return 'compare';
  if (/K\.CC/.test(c) || id === 'ten' || id === 'line') return 'count';
  if (/K\.OA/.test(c) || id === 'bonds' || /^m\d/.test(id)) return 'add';
  if (/K\.NBT/.test(c)) return 'tens';
  if (/K\.MD/.test(c)) return 'measure';
  if (/K\.G/.test(c)) return 'shape';
  return '';
}

/* ---------------- pictures: srcset at 1x/2x/3x, AVIF first ---------------- */
var SW = [400, 800, 1200, 1800];
function pic(id, sizes, alt, eager) {
  var s = function (f) { return SW.map(function (w) { return AS + 'sheets/' + id + '-' + w + '.' + f + ' ' + w + 'w'; }).join(', '); };
  return '<picture><source type="image/avif" srcset="' + s('avif') + '" sizes="' + sizes + '"><img src="' + AS + 'sheets/' + id + '-800.webp" srcset="' + s('webp') + '" sizes="' + sizes + '" width="2025" height="2619" alt="' + esc(alt || '') + '" ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" draggable="false"></picture>';
}
var FRIEND = { owl: 'Hoot', turtle: 'Tilly', chick: 'Pip', fox: 'Rusty', dolphin: 'Splash', unicorn: 'Comet' };
function frSrc(k, f) { return [1, 2, 3].map(function (i) { return AS + 'friends/' + k + '-' + i + 'x.' + f + ' ' + i + 'x'; }).join(', '); }
function fr(a, pose, cls, eager, style) {
  var k = a + '-' + pose, d = (SIO.fr || {})[k] || [170, 200];
  return '<span class="fr ' + (cls || '') + '"' + (style ? ' style="' + style + '"' : '') + ' data-a="' + a + '"><picture><source type="image/avif" srcset="' + frSrc(k, 'avif') + '"><img src="' + AS + 'friends/' + k + '-1x.webp" srcset="' + frSrc(k, 'webp') + '" width="' + d[0] + '" height="' + d[1] + '" alt="' + FRIEND[a] + '" ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" draggable="false"></picture></span>';
}
function pose(el, p) {
  if (!el) return; var a = el.getAttribute('data-a'), k = a + '-' + p, d = (SIO.fr || {})[k];
  var src = $('source', el), img = $('img', el); if (!img) return;
  src.srcset = frSrc(k, 'avif'); img.srcset = frSrc(k, 'webp'); img.src = AS + 'friends/' + k + '-1x.webp'; if (d) { img.width = d[0]; img.height = d[1]; }
}
// friend reactions: only when something happens (idle stays calm)
function react(el, how) {
  if (!el) return;
  var K = {
    wave: [[{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], 1000, EASE],
    nod: [[{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(7px) rotate(-3deg) scaleY(.96)' }, { transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(4px) rotate(-1deg)' }, { transform: 'none' }], 620, EASE],
    cheer: [[{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(0) scale(1.08,.9)', offset: .15 }, { transform: 'translateY(-34px) scale(.96,1.06)', offset: .45 }, { transform: 'translateY(0) scale(1.06,.94)', offset: .72 }, { transform: 'none' }], 820, EASE],
    think: [[{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg) translateX(-4px)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], 900, EASE],
    pop: [[{ transform: 'scale(.5) translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 700, SPRING]
  }[how];
  if (K) anim(el, K[0], { duration: K[1], easing: K[2] });
}

/* ---------------- content: real sheets, real steps ---------------- */
var SHEET = {
  '0202dd561f': 'Match capital and small letters', '19ff6ece69': 'Trace small letters a to z', '4fcf529926': 'Letter sound checklist',
  '08b73918ae': 'Beginning sounds: e, u, r, h', '012e2bc1d3': 'Match-up puzzles', '00eb47cb89': 'Clip cards: say and clip',
  '017859d3af': 'Build CVC words: the -an family', '0ab7544edd': 'Label it: short a pictures', '05234b7c1f': 'Spelling list: short a',
  '09f3e0bac0': 'Write the room: short a', '03c8ae28ab': 'Word building mat: short e', '045556120b': 'Spelling: short o words',
  '593c1210b5': 'Sight words: the, a, I, see', '252bf3817c': 'Heart words: the, a, to, is, of', '0e476951ea': 'Read a story, answer questions',
  '786df852fc': 'Name tracing', '42a86f6ef3': 'Handwriting practice', '167cdd3699': 'Ten frames: count and write',
  '3e7bc7a4f0': 'Trace numbers 0 to 9', '05fb379f4d': 'Number line 0 to 5', '3d6d87cd78': 'Number bonds within 5'
};
var COL = { green: ['var(--green)', 'var(--greenD)'], sky: ['var(--sky)', 'var(--skyD)'], purple: ['var(--purple)', 'var(--purpleD)'], orange: ['var(--orange)', 'var(--orangeD)'], pink: ['var(--pink)', 'var(--pinkD)'] };
var BOOKC = { reading: ['#2457b3', '#163a80'], writing: ['#6a45b8', '#4a2c8a'], math: ['#1f8a5a', '#145e3c'] };
function S(id, t, code, d, sh, les) { return { id: id, t: t, code: code, d: d, sh: sh, les: les }; }
var L = {
  letters: ['Point to B and b. Say: "This is big B and little b. Same letter."', 'Hold up three cards. Your child points as you say each name.', 'Your child draws a line from each capital to its small letter.'],
  sounds: ['Point to m. Say: "m says /mmm/, like in moon." Keep your lips together.', 'Say the sound together for s, a and t. Hold each one for two seconds.', 'Your child says the sound of each letter on the checklist and colors the ones they know.'],
  begin: ['Hold up the ham picture. Say: "ham. The first sound is /h/."', 'Say three words together and clap on the first sound of each.', 'Your child circles the pictures that start with the sound at the top.'],
  blend: ['Say slowly: /c/ /a/ /t/. Then fast: "cat." Sweep your finger under the word.', 'Do map and jam together: touch each letter, say the sound, sweep and say the word.', 'Your child says each picture, then clips the word that matches.'],
  shorta: ['Point to cat. Say each sound, /c/ /a/ /t/, then blend: "cat." The a says /a/ like in apple.', 'Do map and jam together. Touch each letter, say the sound, then sweep and say the word.', 'Your child reads ham, can, bat, jam, pan and fan on the sheet and writes each word.'],
  shorte: ['Point to bed. Say: "/b/ /e/ /d/, bed. The e says /e/ like in egg."', 'Build pen and net together with letter tiles, one sound at a time.', 'Your child builds each word on the mat and reads it back to you.'],
  shorto: ['Point to dog. Say: "/d/ /o/ /g/, dog. The o says /o/ like in octopus."', 'Spell pot together: say each sound and write its letter.', 'Your child writes each short o word and reads the list to you.'],
  sight: ['Say: "Some words we just know by sight. This is the." Read it in a short sentence.', 'Read the, a, I and see together three times, faster each time.', 'Your child reads, traces and writes each word on the sheet.'],
  heart: ['Say: "In said, the s and d are easy. The ai is the tricky part we learn by heart."', 'Tap the easy sounds together and put a heart over the tricky part.', 'Your child reads each heart word, traces it and writes it from memory.'],
  story: ['Read the first two lines aloud. Point under each word as you read.', 'Read the next lines together. Stop and ask: "Who is in the story?"', 'Your child reads the story and answers the questions on the page.'],
  name: ['Write the name slowly and say each letter as you write it.', 'Trace the first line together, your hand over theirs.', 'Your child traces the name on every line, starting at the dots.'],
  trace: ['Trace a on the board. Say: "Start at the top, go around, then down."', 'Trace two letters together in the air with big arms.', 'Your child traces each letter on the sheet, starting at the dot.'],
  hand: ['Show how to hold the pencil: pinch it, then rest it on the middle finger.', 'Write one word together, saying each letter as you go.', 'Your child copies the words on the lines, top line to bottom line.'],
  spella: ['Say: "cat." Then: "/c/ /a/ /t/. I write c, a, t."', 'Spell map together. Your child says the sounds, you write.', 'Your child spells each word on the list, saying the sounds first.'],
  numt: ['Trace 3 big on the table with your finger. Say: "Around the top, around again."', 'Trace 4 and 5 together in the air.', 'Your child traces 0 to 9 on the sheet and says each number.'],
  ten: ['Show 7 dots in a ten frame. Say: "5 on top, 2 more. That is 7."', 'Count the next frame together, touching each dot.', 'Your child counts each frame and writes the number.'],
  line: ['Hop a finger along the line: 0, 1, 2, 3. Say each number as you land.', 'Start at 2 and hop 2 more together. Where do we land?', 'Your child hops along each line and writes where they land.'],
  bonds: ['Show 5 counters. Split them 3 and 2. Say: "3 and 2 make 5."', 'Find another way to split 5 together.', 'Your child fills in each number bond on the sheet.']
};
var PATHS = {
  'k-reading': [
    { t: 'Letters and sounds', u: 1, c: 'green', f: 'chick', steps: [
      S('letters', 'Capital and small letters', 'RF.K.1d', 'Name every capital and small letter.', ['0202dd561f', '19ff6ece69'], L.letters),
      S('sounds', 'Letter sounds', 'RF.K.3a', 'Say the most common sound of each letter.', ['4fcf529926', '08b73918ae'], L.sounds),
      S('begin', 'Beginning sounds', 'RF.K.2d', 'Hear the first sound in a word.', ['08b73918ae', '012e2bc1d3'], L.begin)] },
    { t: 'Short vowel words', u: 2, c: 'sky', f: 'fox', steps: [
      S('blend', 'Blend sounds into words', 'RF.K.2d', 'Put sounds together to read a word: /c/ /a/ /t/, cat.', ['00eb47cb89', '017859d3af'], L.blend),
      S('shorta', 'Short a words', 'RF.K.3b', 'Read and write words like cat, map and jam.', ['0ab7544edd', '017859d3af', '012e2bc1d3', '00eb47cb89', '05234b7c1f', '09f3e0bac0'], L.shorta),
      S('shorte', 'Short e words', 'RF.K.3b', 'Read and build words like bed, pen and net.', ['03c8ae28ab'], L.shorte),
      S('shorto', 'Short o words', 'RF.K.3b', 'Read and spell words like dog, pot and hop.', ['045556120b'], L.shorto)] },
    { t: 'Words and stories', u: 3, c: 'purple', f: 'unicorn', steps: [
      S('sight', 'First sight words', 'RF.K.3c', 'Read the, a, I and see at a glance.', ['593c1210b5'], L.sight),
      S('heart', 'Heart words', 'RF.K.3c', 'Learn the tricky part of common words by heart.', ['252bf3817c'], L.heart),
      S('story', 'Read a short story', 'RF.K.4', 'Read a short story and answer questions about it.', ['0e476951ea'], L.story)] }
  ],
  'prek-reading': [
    { t: 'Letters', u: 1, c: 'green', f: 'chick', steps: [
      S('letters', 'Capital and small letters', null, 'Find and match the letters.', ['0202dd561f', '19ff6ece69'], L.letters),
      S('trace', 'Trace small letters', null, 'Trace each letter from the dot.', ['19ff6ece69'], L.trace),
      S('sounds', 'Letter sounds', null, 'Say the sound each letter makes.', ['4fcf529926', '08b73918ae'], L.sounds),
      S('begin', 'Beginning sounds', null, 'Hear the first sound in a word.', ['08b73918ae', '012e2bc1d3'], L.begin)] }
  ],
  '1-reading': [
    { t: 'Short vowels', u: 1, c: 'sky', f: 'fox', steps: [
      S('shorta', 'Short a words', 'RF.1.3b', 'Read and write words like cat, map and jam.', ['0ab7544edd', '017859d3af', '012e2bc1d3', '00eb47cb89', '05234b7c1f', '09f3e0bac0'], L.shorta),
      S('shorte', 'Short e words', 'RF.1.3b', 'Read and build words like bed, pen and net.', ['03c8ae28ab'], L.shorte),
      S('shorto', 'Short o words', 'RF.1.3b', 'Read and spell words like dog, pot and hop.', ['045556120b'], L.shorto)] },
    { t: 'Words by heart', u: 2, c: 'purple', f: 'unicorn', steps: [
      S('sight', 'Sight words', 'RF.1.3g', 'Read common words at a glance.', ['593c1210b5'], L.sight),
      S('heart', 'Heart words', 'RF.1.3g', 'Learn the tricky part of common words by heart.', ['252bf3817c'], L.heart),
      S('story', 'Read a short story', 'RF.1.4', 'Read a short story and answer questions.', ['0e476951ea'], L.story)] }
  ],
  '2-reading': [
    { t: 'Short vowel review', u: 1, c: 'sky', f: 'fox', steps: [
      S('shorta', 'Short a words', 'RF.2.3a', 'Tell short a from long a when reading.', ['0ab7544edd', '017859d3af', '00eb47cb89', '05234b7c1f'], L.shorta),
      S('shorte', 'Short e words', 'RF.2.3a', 'Tell short e from long e when reading.', ['03c8ae28ab'], L.shorte),
      S('shorto', 'Short o words', 'RF.2.3a', 'Tell short o from long o when reading.', ['045556120b'], L.shorto)] },
    { t: 'Read with understanding', u: 2, c: 'purple', f: 'unicorn', steps: [
      S('heart', 'Heart words', 'RF.2.3f', 'Read words with tricky spellings.', ['252bf3817c'], L.heart),
      S('story', 'Read and answer', 'RF.2.4a', 'Read a story with purpose and answer questions.', ['0e476951ea'], L.story)] }
  ],
  'k-math': [
    { t: 'Numbers to 10', u: 1, c: 'green', f: 'turtle', steps: [
      S('numt', 'Write numbers 0 to 9', 'K.CC.A.3', 'Trace and write each number.', ['3e7bc7a4f0'], L.numt),
      S('ten', 'Count with ten frames', 'K.CC.B.5', 'Count dots and write how many.', ['167cdd3699'], L.ten),
      S('line', 'Count on a number line', 'K.CC.A.2', 'Count forward from any number.', ['05fb379f4d'], L.line),
      S('bonds', 'Number bonds within 5', 'K.OA.A.3', 'Split a number into two parts.', ['3d6d87cd78'], L.bonds)] }
  ],
  'k-writing': [
    { t: 'Letters and words', u: 1, c: 'purple', f: 'unicorn', steps: [
      S('name', 'Write your name', null, 'Trace and write their own name.', ['786df852fc'], L.name),
      S('trace', 'Small letters a to z', 'L.K.1a', 'Print every small letter.', ['19ff6ece69'], L.trace),
      S('hand', 'Handwriting practice', 'L.K.1a', 'Copy short words on the lines.', ['42a86f6ef3'], L.hand),
      S('spella', 'Spell short a words', 'L.K.2d', 'Spell simple words by their sounds.', ['05234b7c1f'], L.spella)] }
  ]
};
function pathKey(g, s) {
  var k = g + '-' + s; if (PATHS[k]) return k;
  if (s === 'math') return 'k-math'; if (s === 'writing') return 'k-writing'; return 'k-reading';
}
// how many different standards a unit covers (several sample steps can share one standard)
function nStd(u) { var o = {}, n = 0; u.steps.forEach(function (x) { var c = x.code || x.id; if (!o[c]) { o[c] = 1; n++; } }); return n; }
function steps(key) { var a = []; PATHS[key].forEach(function (u) { u.steps.forEach(function (s) { s.unit = u; a.push(s); }); }); return a; }
function findStep(key, id) { var a = steps(key); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return a[0]; }
var TRICKY = {
  'k-reading': [['letters', 'Knowing the letters', 'chick', 'read', [['letters', 'Naming the letters'], ['sounds', 'Saying the letter sounds'], ['RF.K.1a', 'Following words on a page']]],
    ['hearing', 'Hearing sounds in words', 'dolphin', 'think', [['begin', 'Hearing the first sound'], ['blend', 'Putting sounds together'], ['RF.K.2a', 'Rhyming words']]],
    ['words', 'Sounding out words', 'fox', 'read', [['shorta', 'Words like cat and map'], ['shorte', 'Words like bed and pen'], ['shorto', 'Words like dog and pot']]],
    ['reading', 'Reading sentences and stories', 'unicorn', 'read', [['sight', 'Little words like the and see'], ['heart', 'Tricky words like said'], ['story', 'Reading a short story']]]],
  'k-writing': [['name', 'Writing their name', 'unicorn', 'pencil', [['name', 'Writing their name']]], ['form', 'Forming letters', 'chick', 'pencil', [['trace', 'Small letters a to z'], ['hand', 'Copying words neatly']]],
    ['spell', 'Spelling words', 'fox', 'pencil', [['spella', 'Spelling words like cat'], ['L.K.2c', 'A letter for each sound']]], ['share', 'Writing about something', 'owl', 'pencil', [['W.K.3', 'Telling what happened'], ['W.K.1', 'Saying what they like and why'], ['W.K.2', 'Telling about a topic']]]],
  'k-math': [['count', 'Counting', 'turtle', 'point', [['numt', 'Writing the numbers'], ['ten', 'Counting how many'], ['line', 'Counting on from a number']]],
    ['add', 'Adding and taking apart', 'turtle', 'think', [['bonds', 'Splitting a number in two'], ['K.OA.A.4', 'Making 10'], ['K.OA.A.2', 'Story problems']]],
    ['compare', 'Comparing numbers', 'fox', 'think', [['K.CC.C.6', 'More, fewer or the same'], ['K.CC.C.7', 'Which number is bigger']]],
    ['shapes', 'Shapes', 'chick', 'point', [['K.G.A.2', 'Naming shapes'], ['K.G.A.3', 'Flat or solid']]]]
};
var GRADES = { prek: 'Pre-K', k: 'Kindergarten', 1: '1st grade', 2: '2nd grade' };
var SUBJ = { reading: 'Reading', writing: 'Writing', math: 'Math' };
function prof() { var p = store.get(); return p && p.grade ? p : null; }
var CURR = window.CURR || { states: [], xw: {} };
var FW = { TX: 'TEKS', FL: 'B.E.S.T.', VA: 'SOL' };
/* Kindergarten paths come from the standards (assets/curriculum.js, made from products/site/standards/ccss.json):
   every Kindergarten reading, writing and math standard is one step, in teaching order. Where we already have real
   sheets and a lesson for a standard, those steps (short a, short e...) stand in its place. Titles are plain words. */
var KT = { 'RF.K.1a': 'Follow the words on a page', 'RF.K.1b': 'Spoken words are written with letters', 'RF.K.1c': 'Spaces between words', 'RF.K.2a': 'Rhyming words', 'RF.K.2b': 'Clap the syllables', 'RF.K.2c': 'Blend c + at into cat', 'RF.K.2e': 'Change a sound, make a new word', 'RF.K.3d': 'Spot the letter that changed: cat, cot',
  'L.K.2a': 'Capitals: first word and I', 'L.K.2b': 'Periods and question marks', 'L.K.2c': 'A letter for each sound',
  'RL.K.1': 'Questions about a story', 'RL.K.2': 'Retell a story', 'RL.K.3': 'Characters, place and events', 'RL.K.4': 'New words in a story', 'RL.K.5': 'Storybooks and poems', 'RL.K.6': 'Who wrote it, who drew it', 'RL.K.7': 'Pictures and the story', 'RL.K.9': 'Compare two characters', 'RL.K.10': 'Read along: stories',
  'RI.K.1': 'Questions about a fact book', 'RI.K.2': 'Main topic and details', 'RI.K.3': 'How two ideas connect', 'RI.K.4': 'New words in a fact book', 'RI.K.5': 'Cover, back and title page', 'RI.K.6': 'Author and illustrator', 'RI.K.7': 'Pictures and the facts', 'RI.K.8': 'Reasons the author gives', 'RI.K.9': 'Two books, one topic', 'RI.K.10': 'Read along: fact books',
  'W.K.1': 'Say what you like and why', 'W.K.2': 'Tell about a topic', 'W.K.3': 'Tell what happened', 'W.K.5': 'Add details with help', 'W.K.6': 'Write on a tablet or computer', 'W.K.7': 'Find out together', 'W.K.8': 'Answer from what you know',
  'L.K.1b': 'Naming and action words', 'L.K.1c': 'One dog, two dogs', 'L.K.1d': 'Who, what, where, when, why', 'L.K.1e': 'Little place words: in, on, off', 'L.K.1f': 'Make full sentences', 'L.K.4a': 'Words with two meanings', 'L.K.4b': 'Word endings: -s, -ed, re-', 'L.K.5a': 'Sort things into groups', 'L.K.5b': 'Opposites', 'L.K.5c': 'Words in real life', 'L.K.5d': 'Walk, march, prance: act it out', 'L.K.6': 'Use new words',
  'K.CC.A.1': 'Count to 100', 'K.CC.B.4a': 'Touch and count', 'K.CC.B.4b': 'The last number tells how many', 'K.CC.B.4c': 'Each next number is one more', 'K.CC.C.6': 'More, fewer, the same', 'K.CC.C.7': 'Compare two numbers', 'K.OA.A.1': 'Show adding and taking away', 'K.OA.A.2': 'Story problems within 10', 'K.OA.A.4': 'Make 10', 'K.OA.A.5': 'Add and take away within 5', 'K.NBT.A.1': 'Ten and some more: 11 to 19',
  'K.MD.A.1': 'Long, short, heavy, light', 'K.MD.A.2': 'Which is taller?', 'K.MD.B.3': 'Sort and count', 'K.G.A.1': 'Shapes around us', 'K.G.A.2': 'Name the shapes', 'K.G.A.3': 'Flat or solid?', 'K.G.B.4': 'Sides and corners', 'K.G.B.5': 'Build and draw shapes', 'K.G.B.6': 'Put shapes together' };
var KUNITS = {
  reading: [['Books and letters', 'chick', 'green', ['RF.K.1a', 'RF.K.1b', 'RF.K.1c', 'RF.K.1d']], ['Hearing sounds', 'dolphin', 'sky', ['RF.K.2a', 'RF.K.2b', 'RF.K.2c', 'RF.K.2d', 'RF.K.2e']], ['Sounds into words', 'fox', 'orange', ['RF.K.3a', 'RF.K.3b', 'RF.K.3c', 'RF.K.3d', 'RF.K.4']], ['Stories', 'owl', 'pink', ['RL.K.1', 'RL.K.2', 'RL.K.3', 'RL.K.4', 'RL.K.5', 'RL.K.6', 'RL.K.7', 'RL.K.9', 'RL.K.10']], ['Books about real things', 'turtle', 'green', ['RI.K.1', 'RI.K.2', 'RI.K.3', 'RI.K.4', 'RI.K.5', 'RI.K.6', 'RI.K.7', 'RI.K.8', 'RI.K.9', 'RI.K.10']], ['Word power', 'chick', 'purple', ['L.K.1b', 'L.K.1c', 'L.K.1d', 'L.K.1e', 'L.K.1f', 'L.K.4a', 'L.K.4b', 'L.K.5a', 'L.K.5b', 'L.K.5c', 'L.K.5d', 'L.K.6']]],
  writing: [['Letters and words', 'unicorn', 'purple', ['L.K.1a', 'L.K.2a', 'L.K.2b', 'L.K.2c', 'L.K.2d']], ['Writing to share', 'owl', 'sky', ['W.K.1', 'W.K.2', 'W.K.3', 'W.K.5', 'W.K.6', 'W.K.7', 'W.K.8']]],
  math: [['Counting', 'turtle', 'green', ['K.CC.A.1', 'K.CC.A.2', 'K.CC.A.3', 'K.CC.B.4a', 'K.CC.B.4b', 'K.CC.B.4c', 'K.CC.B.5']], ['Comparing numbers', 'fox', 'sky', ['K.CC.C.6', 'K.CC.C.7']], ['Adding and taking away', 'turtle', 'orange', ['K.OA.A.1', 'K.OA.A.2', 'K.OA.A.3', 'K.OA.A.4', 'K.OA.A.5']], ['Numbers 11 to 19', 'chick', 'purple', ['K.NBT.A.1']], ['Measuring and sorting', 'dolphin', 'pink', ['K.MD.A.1', 'K.MD.A.2', 'K.MD.B.3']], ['Shapes', 'unicorn', 'green', ['K.G.A.1', 'K.G.A.2', 'K.G.A.3', 'K.G.B.4', 'K.G.B.5', 'K.G.B.6']]]
};
var KSAMPLE = { 'RF.K.1d': ['letters'], 'RF.K.3a': ['sounds'], 'RF.K.2d': ['begin', 'blend'], 'RF.K.3b': ['shorta', 'shorte', 'shorto'], 'RF.K.3c': ['sight', 'heart'], 'RF.K.4': ['story'], 'L.K.1a': ['name', 'trace', 'hand'], 'L.K.2d': ['spella'], 'K.CC.A.2': ['line'], 'K.CC.A.3': ['numt'], 'K.CC.B.5': ['ten'], 'K.OA.A.3': ['bonds'] };
/* K-ADDITIONS-START (made by grade-tools/apply_k_data.js, edit k_data.js and run it again) */
var KLES = {"RF.K.1a":["Open a picture book. Say: \"We read this way.\" Sweep your finger left to right, then drop down to the next line.","Read one page together. Your child moves a finger under the words while you read.","Your child shows you where to start on each page and turns the pages in order as you read."],"RF.K.1b":["Say \"dog.\" Then write d, o, g. Say: \"When we say a word, we can write it with letters.\"","Say and write your child's name together. Point to each letter as you say it.","Your child says a word, like cat or mom, watches you write it, then copies the letters."],"RF.K.1c":["Write \"I see a cat.\" Point to each gap. Say: \"This space means one word is done.\"","Count the words together. Touch each word and clap once for it.","Your child copies \"I can run.\" with a finger space between the words."],"RF.K.2a":["Say: \"cat, hat. They rhyme. They both end with at.\"","Say pairs together: sun and fun, sun and dog. Thumbs up if they rhyme.","Your child says a word that rhymes with bed, then one that rhymes with big."],"RF.K.2b":["Say \"pen-cil\" and clap twice. Say: \"Two claps, two parts.\"","Clap names together: Sam, Ma-ri-a, then your child's name.","Your child claps words you say, like ap-ple and but-ter-fly, and tells you how many claps."],"RF.K.2c":["Say: \"/c/ and at. Put them together: cat.\" Then split it back: \"/c/, at.\"","Take turns: you say /m/, your child says at. Together: \"mat.\"","Your child puts /s/ and it together to make sit, then splits hop into /h/ and op."],"RF.K.2e":["Say \"cat.\" Change the /c/ to /h/. Say: \"Now it is hat.\"","Change one sound together: hat to hot, then hot to hop.","Your child changes the first sound in man to make new words, like can, fan and pan."],"RF.K.3d":["Write cat and cot. Say: \"Only one letter is different. a says /a/, o says /o/.\"","Read pin and pan together. Find the letter that changed and say its sound.","Your child reads pairs like sit and sat, bug and big, and circles the letter that changed."],"RL.K.1":["Read a short story. Stop and ask: \"Who is this? What did she do?\" Point to the picture that shows it.","Read one more page together. Take turns asking one question each.","Your child answers who, what and where questions about the story, using the pictures to help."],"RL.K.2":["After The Three Little Pigs, say: \"First the pigs left home. Next the wolf came. Last, they hid in the brick house.\"","Retell it together with first, next and last, holding up one finger for each part.","Your child retells a favorite story in three parts: first, next and last."],"RL.K.3":["Say: \"The characters are who the story is about. The setting is where it happens.\" Point to each in the pictures.","Read a story together and name the characters, then the place.","Your child draws one character and the setting, and tells you one big thing that happened."],"RL.K.4":["Stop at a new word, like enormous. Say: \"The picture shows a huge bear. Enormous means very big.\"","Find one more new word together and use the picture to work out what it means.","Your child points to a word they do not know and asks, \"What does that mean?\""],"RL.K.5":["Show a storybook and a poem. Say: \"This one tells a story. This one has short lines that rhyme.\"","Read a short poem together and clap along. Then read one page of a storybook.","Your child sorts three books into storybook or poem and tells you why."],"RL.K.6":["Point to the cover. Say: \"The author wrote the words. The illustrator drew the pictures.\"","Find the author and the illustrator together on two more books.","Your child points to who wrote the book and who drew the pictures, and says what each one did."],"RL.K.7":["Hold up a page. Say: \"This picture shows the moment the pig builds his straw house.\"","Look at the next picture together and say which part of the story it shows.","Your child picks a picture and tells you what is happening in the story at that moment."],"RL.K.9":["After two stories, say: \"Goldilocks went into a house. So did the wolf. But the wolf wanted to eat the pigs.\"","Talk together about how the two characters are the same and how they are different.","Your child tells you one way two characters are alike and one way they are different."],"RL.K.10":["Read the mini book Pip in the Pan aloud with a happy voice. Say: \"Listen for what Pip does.\"","Read it again. Your child joins in on the words they know, like I and sat.","Your child reads along with you, points under each word, and tells you what Pip did."],"RI.K.1":["Read a page about frogs. Ask: \"What do frogs eat?\" Find the answer in the words or the picture.","Read the next page together. Take turns asking a question about it.","Your child answers questions about the fact book and shows you where the answer is."],"RI.K.2":["After a book about whales, say: \"This book is all about whales. One fact is that they breathe air.\"","Name two more facts from the book together.","Your child tells you what the book is about and one fact they learned."],"RI.K.3":["Read about seeds. Say: \"The seed gets water, then it grows. The water helps it grow.\"","Find another pair that goes together, like rain and puddles.","Your child tells you how two things in the book are connected."],"RI.K.4":["Stop at a new word, like hatch. Say: \"The picture shows a chick coming out of its egg. That is hatch.\"","Find one more new word together and look for clues in the picture.","Your child stops at a word they do not know and asks what it means."],"RI.K.5":["Hold up a book. Say: \"This is the front cover. This is the back cover. Inside is the title page.\"","Hand the book over and find each part together.","Your child shows you the front cover, the back cover and the title page of three books."],"RI.K.6":["Open a fact book. Say: \"The author wrote these words. The illustrator made the pictures.\"","Find both names together on the cover and the title page.","Your child points to the author and the illustrator and tells you what each one did."],"RI.K.7":["Point to a picture in a book about bees. Say: \"This picture shows a bee on a flower, just like the words say.\"","Look at a second picture together and find the words that match it.","Your child points to a picture and tells you what it shows about the topic."],"RI.K.8":["Read: \"Brush your teeth. It keeps them strong.\" Say: \"The author says brush. The reason is strong teeth.\"","Find one more reason in the book together. Ask: \"Why does the author say that?\"","Your child tells you one reason the author gives for an idea in the book."],"RI.K.9":["Read two short books about dogs. Say: \"Both books say dogs need food. Only this one shows puppies.\"","Look through both books together and find one more thing that is the same.","Your child tells you one thing both books say and one thing that is different."],"RI.K.10":["Read a fact book aloud. Say: \"Let's find out where bears sleep in winter.\"","Read it again. Your child reads the words they know and points to the pictures.","Your child joins in reading a fact book and tells you one new thing they learned."],"W.K.1":["Say: \"My favorite fruit is apples because they crunch.\" Draw an apple and write \"I like apples.\"","Pick a topic together, like pets. Your child says what they like and you help write it.","Your child draws a favorite toy and writes or tells you \"I like it because...\""],"W.K.2":["Say: \"I will tell about cats. Cats have whiskers.\" Draw a cat and write one fact.","Choose a topic together and say two facts about it. Write the first word together.","Your child draws something they know about, like dogs, and writes or tells one fact."],"W.K.3":["Say: \"First I woke up. Then I ate eggs. I was happy.\" Draw two boxes and sketch each part.","Plan a story about today together: what happened first, and what happened next.","Your child draws and writes what happened, in order, and how they felt about it."],"W.K.5":["Look at your child's drawing. Say: \"I see a dog. What color is it? Let's add that.\"","Ask one question together, like \"Where was it?\", and add the answer to the page.","Your child adds one more detail to their picture or words after you ask a question."],"W.K.6":["On a tablet, type \"I like cats.\" Say: \"We can write with keys too.\"","Type a short sentence together. Your child finds each letter on the keys.","Your child types their name and one short sentence, then shows it to someone in the family."],"W.K.7":["Pick two books by one author. Say: \"Let's read both and find out which one we like best.\"","Read both together and talk about the pictures and the stories.","Your child tells you which book they like best and draws a picture to show why."],"W.K.8":["Ask: \"What did we see at the park?\" Say: \"I remember the ducks.\"","Look at a photo or a book together to find the answer to a question.","Your child answers a question, like \"What do birds eat?\", by drawing or telling what they found."],"SL.K.1a":["Say: \"When one person talks, the other listens. Then we switch.\" Hold a toy. Whoever holds it talks.","Talk about your day together, passing the toy back and forth.","Your child waits for the toy, listens while you talk, and speaks when it is their turn."],"SL.K.1b":["Say: \"I saw a big dog today.\" Then ask: \"What did you see?\"","Keep one talk going together for three turns. Each answer adds one new thing.","Your child answers you and asks a question back, keeping the talk going for three turns."],"SL.K.2":["Read a short book aloud. Stop and ask: \"Why did the bear go home?\"","Read on together. Your child stops you once to ask a question.","Your child answers questions about what you read and asks about any part that was not clear."],"SL.K.3":["Say: \"When you need help, you can ask. Like: Can you open this, please?\"","Play a game together: you hide a toy and your child asks questions to find it.","Your child asks for help, or asks a question, when something is not clear."],"SL.K.4":["Hold up your cup. Say: \"This is my cup. It is blue and it has a handle.\"","Pick someone in the family together and say three things about them.","Your child describes a favorite place, then adds one more detail when you ask."],"SL.K.5":["Say: \"This is my house,\" and draw it. Point to the drawing as you tell about it.","Draw a pet or a toy together while you talk about it.","Your child draws a picture to go with what they tell you about their day."],"SL.K.6":["Say clearly: \"I feel happy because we went to the park.\" Look at your child as you say it.","Take turns saying how you feel and why, in a full sentence.","Your child tells you an idea or a feeling in a clear voice that is easy to hear."],"L.K.1b":["Say: \"Dog is a naming word. Run is an action word. The dog runs.\"","Point to things in the room together. Name them, then act out an action.","Your child names five things and says what each one can do, like \"The ball rolls.\""],"L.K.1c":["Hold one block. Say: \"one block.\" Add another. Say: \"two blocks. We add /s/.\"","Say more together: cup and cups, box and boxes.","Your child says the word for more than one, like cats, hats and dishes."],"L.K.1d":["Ask: \"Who is at the door? Where is my hat?\" Say the question word a little louder each time.","Ask each other questions together using who, what and where.","Your child asks you a question with who, what, where, when, why or how."],"L.K.1e":["Put a toy in a box. Say: \"The toy is in the box.\" Then put it on the box and say it again.","Move the toy together: on, off, in, out. Say each word as you go.","Your child puts the toy where you say and tells you where it is, like \"on the chair.\""],"L.K.1f":["Say: \"Dog.\" Then say: \"The dog runs.\" Say: \"Now it is a full sentence.\"","Grow a sentence together: \"The dog runs fast to the park.\"","Your child says a full sentence about a picture, then adds one more word to it."],"L.K.2a":["Write \"the cat sat.\" Fix it to \"The cat sat.\" Say: \"The first word gets a capital letter.\"","Write \"I like dogs.\" together and make the I a capital.","Your child copies three short sentences with a capital first letter and a capital I."],"L.K.2b":["Write \"I see a cat.\" and \"Do you see a cat?\" Say: \"This dot is a period. This is a question mark.\"","Read the sentences together and name the mark at the end of each.","Your child names the mark at the end of each sentence and adds one to a sentence you write."],"L.K.2c":["Say \"mop.\" Then say: \"/m/ is the letter m.\" Write m.","Say a sound together and write its letter: /s/, /t/, /a/.","Your child writes the letter for each sound you say, like /b/, /p/ and /i/."],"L.K.4a":["Say: \"A bat flies at night. A bat is also what you hit a ball with.\"","Act out two meanings together: a duck says quack, and you duck down low.","Your child tells you two meanings for a word like bat, duck or ring."],"L.K.4b":["Say: \"jump, jumped. The -ed tells us it already happened.\"","Try more together: play and played, cat and cats, do and redo.","Your child adds -s or -ed to a word you say and tells you what changed."],"L.K.5a":["Put out a spoon, an apple and a banana. Say: \"The apple and the banana go together. They are both food.\"","Sort toys together into groups, like cars and animals.","Your child sorts things from the toy box into groups and names each group."],"L.K.5b":["Say: \"Hot and cold are opposites. Big and small are opposites.\"","Play opposites together: you say up, your child says down.","Your child gives the opposite of words like fast, happy, open and wet."],"L.K.5c":["Say: \"Our kitchen is a place that smells good.\" Then name one thing in it that is shiny.","Walk around the house together and find things that are soft, loud or bright.","Your child finds three colorful things at home and tells you about each one."],"L.K.5d":["Walk across the room. Then march. Then tiptoe. Say: \"These are all ways to walk.\"","Act out walk, march and prance together and talk about how they feel different.","Your child acts out each word you say, like stomp, tiptoe and stroll."],"L.K.6":["Use a new word from a book, like gigantic. Say: \"That truck is gigantic!\"","Pick one new word together and use it three times today.","Your child uses a new word from a story when telling you about their day."],"K.CC.A.1":["Count from 1 to 20, tapping the table each time. Then count by tens: 10, 20, 30.","Count to 30 together, then count by tens to 100.","Your child counts as far as they can by ones, then by tens to 100."],"K.CC.B.4a":["Line up 5 toys. Touch each one and say one number: 1, 2, 3, 4, 5.","Count a row of spoons together, touching each spoon once.","Your child counts a group of up to 10 things, touching each one only once."],"K.CC.B.4b":["Count 6 cars. Say: \"6. The last number tells how many.\"","Mix the cars up and count again together. Still 6.","Your child counts a group, then tells you how many without counting again."],"K.CC.B.4c":["Show 3 blocks. Add one. Say: \"Now there are 4. Each next number is one more.\"","Add one block at a time together and say the new number.","Your child adds one more block each time and tells you the new number."],"K.CC.C.6":["Put 4 apples next to 2 apples. Say: \"This group has more. That group has fewer.\"","Line up two groups together, one across from one, to see which has more.","Your child compares two groups and says more, fewer or the same."],"K.CC.C.7":["Write 7 and 4. Say: \"7 is more than 4. 7 is the bigger number.\"","Find two numbers on a number line together and point to the bigger one.","Your child circles the bigger number in pairs like 3 and 8, or 6 and 2."],"K.OA.A.1":["Hold up 3 fingers, then 2 more. Say: \"3 and 2 make 5.\"","Act it out with toys together: 4 cars, 1 drives away. How many are left?","Your child shows adding and taking away with fingers, toys or a drawing."],"K.OA.A.2":["Say: \"I have 3 grapes. I get 2 more. How many now?\" Use real grapes.","Solve one more story together with counters, then say the answer in a sentence.","Your child solves a story problem within 10 using objects or a drawing."],"K.OA.A.4":["Show 7 dots in a ten frame. Say: \"3 empty spaces. 7 and 3 make 10.\"","Fill ten frames together and count the empty spaces each time.","Your child finds how many more make 10 for numbers like 6, 2 and 9."],"K.OA.A.5":["Say: \"2 and 2 make 4.\" Show it fast with your fingers.","Play a quick game together: you say a fact within 5, your child answers.","Your child answers adding and taking away facts within 5, quickly and correctly."],"K.NBT.A.1":["Show a full ten frame and 3 more counters. Say: \"Ten and 3 more make 13.\"","Build 15 together: one full ten frame and 5 more.","Your child builds the numbers 11 to 19 as ten and some more."],"K.MD.A.1":["Hold a pencil. Say: \"It is long. It is light.\"","Pick things up together and say if they are heavy or light, long or short.","Your child tells you two things they notice about an object, like long and light."],"K.MD.A.2":["Stand two toys side by side. Say: \"This one is taller.\"","Compare two shoes together. Which one is longer?","Your child compares two things and says which is taller, longer or heavier."],"K.MD.B.3":["Pour out buttons. Sort them by color. Say: \"Red ones here, blue ones there.\"","Count each group together and say which group has the most.","Your child sorts things into groups, counts each group and tells which has the most."],"K.G.A.1":["Point to a clock. Say: \"That is a circle. It is above the door.\"","Look for shapes around the room together and say where each one is.","Your child finds shapes at home and tells you where they are, like next to the bed."],"K.G.A.2":["Show a small triangle and a big one turned upside down. Say: \"Both are triangles. Three sides.\"","Name shapes together while you turn them different ways.","Your child names shapes of any size, turned any way."],"K.G.A.3":["Hold a ball and a paper circle. Say: \"The ball is solid. The circle is flat.\"","Sort things together into flat and solid.","Your child sorts shapes and objects into flat and solid."],"K.G.B.4":["Show a square. Count its sides and corners: 4 sides, 4 corners.","Count sides and corners together on a triangle and a rectangle.","Your child tells you how two shapes are the same and how they are different."],"K.G.B.5":["Make a triangle with three sticks. Say: \"Three sides make a triangle.\"","Build a square together with sticks or clay.","Your child builds or draws a circle, a square and a triangle."],"K.G.B.6":["Put two triangles together. Say: \"Look, they make a square.\"","Make a house together from a square and a triangle.","Your child puts shapes together to make a bigger shape or a picture."]};
var KADD = [{"c":"SL.K.1a","t":"Follow talking rules, like listening to others and taking turns to speak.","d":"SL","k":0},{"c":"SL.K.1b","t":"Keep a conversation going through several back-and-forth turns.","d":"SL","k":1},{"c":"SL.K.2","t":"Show they understood a read-aloud by asking and answering questions, and asking when something is not clear.","d":"SL","k":0},{"c":"SL.K.3","t":"Ask and answer questions to get help, find something out, or clear up confusion.","d":"SL","k":0},{"c":"SL.K.4","t":"Describe familiar people, places, things and events, and with help add more detail.","d":"SL","k":2},{"c":"SL.K.5","t":"Add drawings or other pictures to a description to show more detail.","d":"SL","k":0},{"c":"SL.K.6","t":"Speak clearly and share thoughts, feelings and ideas.","d":"SL","k":1}];
var KSHEETS = {"RL.K.10":["4cb6e1e312"]};
Object.assign(KT, {"SL.K.1a":"Take turns talking","SL.K.1b":"Keep a talk going","SL.K.2":"Questions about a read-aloud","SL.K.3":"Ask when you need help","SL.K.4":"Tell about people and places","SL.K.5":"Add a drawing to show more","SL.K.6":"Speak clearly","L.K.5b":"Opposites like hot and cold"}); Object.assign(SHEET, {"4cb6e1e312":"Mini book: Pip in the Pan"});
(function () { var ua = ["Talking and listening","dolphin","sky",["SL.K.1a","SL.K.1b","SL.K.2","SL.K.3","SL.K.4","SL.K.5","SL.K.6"]], R = KUNITS.reading, at = R.length; for (var i = 0; i < R.length; i++) { if (R[i][0] === ua[0]) return; if (R[i][0] === "Word power") at = i; } R.splice(at, 0, ua); })();
/* K-ADDITIONS-END */
(function buildK() {
  if (!CURR.ela || !CURR.ela.length) return;
  var std = {}; CURR.ela.concat(CURR.math, KADD).forEach(function (x) { std[x.c] = x; });
  var smp = {}; ['k-reading', 'k-writing', 'k-math'].forEach(function (k) { PATHS[k].forEach(function (u) { u.steps.forEach(function (x) { smp[x.id] = x; }); }); });
  [['k-reading', 'reading'], ['k-writing', 'writing'], ['k-math', 'math']].forEach(function (kk) {
    PATHS[kk[0]] = KUNITS[kk[1]].map(function (u, i) {
      var st = []; u[3].forEach(function (code) { var x = std[code] || { t: '', k: 0 };
        if (KSAMPLE[code]) KSAMPLE[code].forEach(function (id) { var o = Object.assign({}, smp[id]); o.code = code; o.std = x.t; o.k = x.k; st.push(o); });
        else st.push({ id: code, t: KT[code] || code, code: code, d: x.t, std: x.t, sh: (KSHEETS[code] || []).slice(), les: KLES[code] || null, k: x.k }); });
      return { t: u[0], u: i + 1, f: u[1], c: u[2], steps: st };
    });
  });
})();
function stateOf(ab) { for (var i = 0; i < CURR.states.length; i++) if (CURR.states[i].s === ab) return CURR.states[i]; return null; }
// the code a step shows: the chosen state's own code where it is mapped, else Common Core
function codeOf(ccss) {
  if (!ccss) return null; var p = prof(), st = p && p.state;
  if (st && CURR.xw[st]) { var a = CURR.xw[st].m[ccss]; if (a && a.length) return FW[st] + ' ' + a[0]; return 'Common Core ' + ccss; }
  return ccss;
}
var ROLES = { parent: 'Parent', teacher: 'Teacher', homeschool: 'Homeschool', student: 'Student' };
function role() { var r = ''; try { r = localStorage.getItem('sio.role') || ''; } catch (e) {} return ROLES[r] ? r : ((prof() || {}).who || 'parent'); }
function setRole(r) { try { localStorage.setItem('sio.role', r); } catch (e) {} var p = prof(); if (p && r !== 'student') { p.who = r; store.set(p); } var l = document.getElementById('role-l'); if (l) l.textContent = ROLES[r]; }
var GSHORT = { prek: 'Pre-K', k: 'K', 1: '1st', 2: '2nd' };
function paintWhere() {
  var b = document.querySelector('[data-where]'); if (!b) return; var p = prof();
  if (!p) { b.hidden = true; return; }
  b.hidden = false; b.innerHTML = I.flag + '<span>' + (p.state || 'US') + '</span><i></i><span>' + (GSHORT[p.grade] || 'K') + '</span>';
  b.setAttribute('aria-label', 'Change country, state or grade: ' + (p.state ? (stateOf(p.state) || {}).n : 'United States') + ', ' + (GRADES[p.grade] || ''));
}
function profOrDefault() { return prof() || { who: 'parent', grade: 'k', subject: 'reading', step: 'shorta', name: '' }; }
function saveProf(p) { var st = findStep(pathKey(p.grade, p.subject), p.step); p.stepT = st.t; store.set(p); paintWhere(); }

/* ---------------- toast + zoom ---------------- */
var toastT;
function toast(t) { var e = $('.toast'); if (!e) { e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', 'status'); document.body.appendChild(e); } e.textContent = t; requestAnimationFrame(function () { e.classList.add('on'); }); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 2600); }
function zoom(id, from) {
  var z = document.createElement('div'); z.className = 'zoom'; z.innerHTML = pic(id, '(max-width:900px) 96vw, 70vh', SHEET[id] || 'Sheet', true) + (tplUrl(id) ? '<a class="btn sky zprint" href="' + esc(tplUrl(id)) + '">' + I.print + 'Print or change this sheet</a>' : ''); document.body.appendChild(z);
  var img = $('img', z);
  requestAnimationFrame(function () { z.classList.add('on'); });
  if (from && !RM) { var a = from.getBoundingClientRect(); img.decode && img.decode().catch(function () {}); requestAnimationFrame(function () { var b = img.getBoundingClientRect(); if (!b.width) return; anim(img, [{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + a.width / b.width + ')', transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 560, easing: SNAP }); }); }
  z.addEventListener('click', function () { z.classList.remove('on'); setTimeout(function () { z.remove(); }, 300); });
}

/* ---------------- router: screens slide like cards ---------------- */
var app = $('#app'), base = $('[data-screen]', app), cur = base, depth = 0, pending = null;
var ROUTES = { start: flowScreen, me: meScreen, book: bookScreen, path: pathScreen, grow: growScreen, explore: exploreScreen };
function parse(h) { h = (h || location.hash).replace(/^#\/?/, ''); var q = {}, parts = h.split('?'); (parts[1] || '').split('&').forEach(function (kv) { if (kv) { var a = kv.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); } }); return { r: parts[0] || '', q: q }; }
function go(r, opts) {
  opts = opts || {};
  if (r === 'home') { if (SIO.base !== 'home') { location.href = SIO.home || '../'; return; } r = ''; }
  if (r === 'pack') { r = prof() ? 'book' : 'start'; }
  if (r === 'teach') { r = 'start'; opts.who = 'teacher'; }
  pending = opts; depth++;
  history.pushState({ d: depth }, '', '#/' + r + (opts.qs ? '?' + opts.qs : ''));
  show(parse(), 1);
}
addEventListener('popstate', function (e) { var d = (e.state && e.state.d) || 0, dir = d < depth ? -1 : 1; depth = d; closeSheet(true); closeAsk(); show(parse(), dir); });
function navMark(r) {
  var key = r === 'book' || r === 'me' ? 'pack' : r === 'path' ? 'path' : r === 'explore' || r === 'grow' ? 'explore' : r === '' ? 'home' : '';
  $$('[data-go]', document).forEach(function (a) { if (a.closest('.nav,.tabs')) a.toggleAttribute('aria-current', a.getAttribute('data-go') === key); if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
}
function show(loc, dir) {
  var r = loc.r, el;
  if (!r || !ROUTES[r]) el = base; else el = ROUTES[r](loc.q, pending || {});
  pending = null;
  document.body.classList.toggle('focus', r === 'start'); document.body.classList.toggle('imm', r === 'book');
  navMark(r);
  if (el === cur) return;
  var old = cur, shared = old && old.querySelector('.panel-book .bk, .party .bk');
  var sharedRect = shared && r === 'book' ? shared.getBoundingClientRect() : null;
  cur = el;
  var sy = scrollY;
  if (old && !old.classList.contains('flowscr')) { old.classList.add('leaving'); old.style.top = -sy + 'px'; } else if (old) old.style.pointerEvents = 'none';
  if (el.getAnimations) el.getAnimations().forEach(function (x) { x.cancel(); });
  el.classList.remove('leaving'); el.style.top = '';
  if (!el.parentNode) app.appendChild(el);
  scrollTo(0, 0);
  if (el.onShow) el.onShow();
  var done = function () { if (old && old !== base) old.remove(); else if (old) { old.classList.remove('leaving'); old.style.top = ''; old.remove(); } };
  if (RM || !old) { done(); return; }
  app.style.overflow = 'clip';
  var w = Math.min(innerWidth, 900) * .22 * dir;
  anim(old, [{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + (-w) + 'px) scale(.98)', opacity: 0 }], { duration: 340, easing: EASE, fill: 'forwards' });
  var a;
  if (sharedRect) {
    a = anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: EASE });
    var bk = $('.bk', el); if (bk) { var b = bk.getBoundingClientRect(); var s = sharedRect.width / b.width; anim(bk, [{ transform: 'translate(' + (sharedRect.left - b.left + (sharedRect.width - b.width) / 2) + 'px,' + (sharedRect.top - b.top + (sharedRect.height - b.height) / 2) + 'px) scale(' + s + ')' }, { transform: 'none' }], { duration: 900, easing: SNAP }); }
  } else {
    a = anim(el, [{ transform: 'translateX(' + w * 1.4 + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 620, easing: SNAP });
  }
  a.finished.then(function () { done(); app.style.overflow = ''; });
}
function mk(html, cls) { var s = document.createElement('section'); s.className = 'screen ' + (cls || ''); s.innerHTML = html; return s; }

/* ---------------- global taps ---------------- */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go],[data-ask],[data-where],[data-role-btn],[data-zoom],[data-toast],[data-print],[data-dismiss],[data-reset],[data-lesson]');
  if (!t) return;
  if (t.hasAttribute('data-go')) {
    e.preventDefault(); var g = t.getAttribute('data-go'), o = {};
    if (t.hasAttribute('data-preset')) { o.preset = t.getAttribute('data-preset'); }
    if (t.hasAttribute('data-open')) o.qs = 'open=' + t.getAttribute('data-open');
    if (g === 'book' && o.preset && !prof()) o.qs = 'step=' + o.preset;
    go(g, o);
  } else if (t.hasAttribute('data-ask')) openAsk();
  else if (t.hasAttribute('data-where')) go('start', { where: 1 });
  else if (t.hasAttribute('data-role-btn')) roleMenu(t);
  else if (t.hasAttribute('data-zoom')) zoom(t.getAttribute('data-zoom'), $('img', t) || t);
  else if (t.hasAttribute('data-toast')) { if (/opens the free makers/.test(t.getAttribute('data-toast'))) makersNow(); else toast(t.getAttribute('data-toast')); }
  else if (t.hasAttribute('data-print')) printNow();
  else if (t.hasAttribute('data-dismiss')) { var o2 = $('#offer'); anim(o2, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 260, easing: EASE, fill: 'forwards' }).finished.then(function () { o2.remove(); }); }
  else if (t.hasAttribute('data-reset')) { store.clear(); location.hash = ''; location.reload(); }
  else if (t.hasAttribute('data-lesson')) { var k = 'k-reading'; openSheet(findStep(k, t.getAttribute('data-lesson')), k, 'lesson'); }
});
// press feedback that feels physical on every button, even on touch screens that skip :active
document.addEventListener('pointerdown', function (e) { var b = e.target.closest('.btn,.opt,.node,.round,.rowlink'); if (b) { b.classList.add('pressed'); var up = function () { b.classList.remove('pressed'); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); }; addEventListener('pointerup', up); addEventListener('pointercancel', up); } }, { passive: true });
var top = $('#top'); addEventListener('scroll', function () { top && top.classList.toggle('lined', scrollY > 6); }, { passive: true });

/* ================= 1. GUIDED FIRST VISIT ================= */
function flowScreen(q, o) {
  var pre = o.preset ? findStep('k-reading', o.preset) : null;
  var F = { a: { who: o.who || null, subject: pre ? 'reading' : null, step: pre ? pre.id : null }, i: 0, list: [] };
  F.list = pre ? ['who', 'country', 'state', 'grade', 'name'] : ['who', 'country', 'state', 'grade', 'subject', 'tricky', 'narrow', 'name'];
  if (o.who === 'teacher') F.list = F.list.filter(function (x) { return x !== 'who'; });
  var old0 = prof();
  if (o.where && old0) { F.a = { who: old0.who, grade: old0.grade, subject: old0.subject, step: old0.step, name: old0.name, state: old0.state }; F.list = ['country', 'state', 'grade']; F.where = 1; }
  var s = mk('<div class="flow"><div class="flow-head"><button class="iconbtn" data-back aria-label="Back" hidden>' + I.back + '</button><div class="bar" role="progressbar" aria-label="Progress"><i></i></div><button class="iconbtn" data-x aria-label="Close">' + I.x + '</button></div><div class="flow-steps"></div><div class="flow-foot" hidden><div class="in"><button class="btn ghost sm" data-skip>Skip</button><button class="btn" data-make>Make my pack</button></div></div></div>', 'flowscr');
  var box = $('.flow-steps', s), bar = $('.bar i', s), back = $('[data-back]', s), foot = $('.flow-foot', s);
  $('[data-x]', s).onclick = function () { history.length > 1 ? history.back() : go('home'); };
  back.onclick = function () { if (F.i > 0) { F.i--; render(-1); } };
  function setBar() { bar.style.setProperty('--p', Math.max(.04, F.i / F.list.length)); }
  function guide(a, p, say, small) { var pro = F.a.who === 'teacher'; return '<div class="guide' + (pro ? ' pro' : '') + '">' + (pro ? '' : fr(a, p, '', true)) + '<div class="bubble" aria-live="polite">' + say + (small ? '<small>' + small + '</small>' : '') + '</div></div>'; }
  function opt(v, ic, label, small, col, cls, extra) { var c = COL[col] || COL.sky; return '<button class="opt ' + (cls || '') + '" data-v="' + v + '" style="--c:' + c[0] + ';--d:' + c[1] + ';--t:var(--' + col + 'T)">' + (ic ? '<span class="ic">' + ic + '</span>' : '') + (extra || '') + '<span>' + label + (small ? '<small>' + small + '</small>' : '') + '</span></button>'; }
  var kid = function () { return F.a.who === 'teacher' ? 'your students' : F.a.who === 'student' ? 'you' : 'your child'; };
  var STEP = {
    who: function () { return guide('owl', 'wave', "Hi, I'm Hoot! Which one are you?", 'A few quick questions, then your free pack is ready.') + '<div class="opts c3 c4">' + opt('parent', frIc('turtle', 'read'), 'Parent', 'Learning at home with my child', 'pink', 'big') + opt('teacher', frIc('owl', 'point'), 'Teacher', 'Sheets and plans for my class', 'sky', 'big') + opt('homeschool', frIc('chick', 'read'), 'Homeschool', 'A full path we follow at home', 'green', 'big') + opt('student', frIc('fox', 'read'), 'Student', 'Learning on my own', 'orange', 'big') + '</div>'; },
    country: function () {
      var us = guessUS(), t = F.a.who === 'teacher';
      return guide('owl', 'wave', us ? (t ? 'Teaching in the United States?' : 'Learning in the United States?') : 'Where are you learning?', us ? 'We guessed from this device\'s language and clock. Nothing is looked up.' : 'Today our steps follow US school standards.') +
        '<div class="opts c2">' + opt('US', '<span class="flagic">' + I.flag + '</span>', us ? 'Yes, the United States' : 'The United States', 'All 50 states and DC', 'sky') + opt('elsewhere', frIc('dolphin', 'wave'), 'Somewhere else', 'See where we are going next', 'orange') + '</div><div class="note" hidden></div>';
    },
    state: function () {
      var t = F.a.who === 'teacher';
      return guide('owl', 'point', t ? 'Which state do you teach in?' : 'Which state?', t ? 'So every step shows your state\'s own codes.' : 'So it matches what school teaches. You can skip this.') +
        '<div class="statebox"><div class="mapwrap"><div class="map-skel">Loading the map</div><div class="map-tools"><button class="chip" data-ne>Zoom in on the Northeast</button><button class="chip" data-zout hidden>Whole map</button></div></div>' +
        '<div class="state-side"><label class="sr" for="stq">Type your state</label><div class="askbox stq">' + I.search + '<input id="stq" placeholder="Type your state" autocomplete="off"></div><div class="st-sugs"></div><div class="st-card" hidden></div></div></div>';
    },
    grade: function () {
      var soon = ''; for (var g = 3; g <= 12; g++) soon += '<button data-soon="' + g + '">' + g + (g === 3 ? 'rd' : 'th') + '<small>Soon</small></button>';
      return guide('owl', 'point', F.a.who === 'teacher' ? 'What grade do you teach?' : F.a.who === 'student' ? 'What grade are you in?' : 'What grade is your child in?', pre ? 'So we pick the right short a sheets.' : '') +
        '<div class="grades">' + opt('prek', '', 'Pre-K', 'Ages 4 to 5', 'green') + opt('k', '', 'Kindergarten', 'Ages 5 to 6', 'sky') + opt('1', '', '1st grade', 'Ages 6 to 7', 'purple') + opt('2', '', '2nd grade', 'Ages 7 to 8', 'orange') + '</div>' +
        '<div class="soon-h">Not here yet</div><div class="soon">' + soon + '</div><div class="note" hidden></div>';
    },
    subject: function () { return guide('owl', 'think', 'What would you like to work on?', 'Pick one. You can add more later.') + '<div class="opts c2">' + opt('reading', frIc('fox', 'read'), 'Reading', 'Letters, sounds, words, stories', 'pink') + opt('writing', frIc('unicorn', 'pencil'), 'Writing', 'Tracing, names, handwriting', 'purple') + opt('math', frIc('turtle', 'point'), 'Math', 'Counting, numbers, shapes', 'green') + opt('unsure', frIc('owl', 'think'), "I'm not sure", 'Take the 2-minute check', 'orange') + '</div>' +
      '<div class="soon-h">More subjects, not here yet</div><div class="soon subj">' + ['Science', 'Social studies', 'Health', 'Art', 'Music', 'Computer skills'].map(function (x) { return '<button data-soonsub="' + x + '">' + x + '<small>Soon</small></button>'; }).join('') + '</div><div class="note" hidden></div>'; },
    tricky: function () {
      var G = groups(), sub = F.a.subject;
      return guide('owl', 'think', 'What\'s tricky right now?', 'Pick the one that sounds most like ' + kid() + '.') + '<div class="opts c2">' + G.map(function (g, i) { return opt('g' + i, frIc(g[2], g[3]), g[1], g[4].length > 1 ? g[4].length + ' small steps inside' : 'One step on the path', ['pink', 'sky', 'orange', 'purple'][i % 4]); }).join('') + opt('unsure', frIc('owl', 'think'), 'Not sure?', 'Take the 2-minute check', 'green') + opt('other', frIc('unicorn', 'think'), 'Something else', 'Tell me in your own words', 'purple') + '</div>' +
        '<div class="all-row"><button class="link" data-all>See the full ' + gradeName(F.a.grade) + ' ' + sub + ' syllabus, every standard</button></div><div class="all-list" hidden></div>' +
        '<div class="other-box" hidden><label class="sr" for="oth">What is tricky?</label><div class="askbox">' + I.search + '<input id="oth" placeholder="Like: mixes up b and d, or reading long words" autocomplete="off"></div><div class="oth-sugs"></div></div>';
    },
    narrow: function () {
      var g = groups()[F.a.g] || groups()[0];
      return guide(g[2], g[3], 'Which part, exactly?', esc(g[1]) + '. Each one is a step on the path.') + '<div class="opts c2">' + g[4].map(function (x, i) { var st = findStep(pathKey(F.a.grade, F.a.subject), x[0]); return opt(x[0], st.sh && st.sh.length ? '<span class="thumb">' + pic(st.sh[0], '58px', '') + '</span>' : '', x[1], st.code ? codeOf(st.code) : '', ['pink', 'sky', 'orange', 'purple'][i % 4]); }).join('') + '</div>';
    },
    skill: function () {
      var k = pathKey(F.a.grade, F.a.subject), st = steps(k), h = '';
      st.forEach(function (x, i) { h += opt(x.id, '', x.t, (x.code ? x.code + ' · ' : '') + x.d, x.unit.c, '', '<span class="thumb">' + pic(x.sh[0], '58px', '') + '</span>'); });
      return guide(PATHS[k][0].f, 'read', 'Which one is it today?', 'Pick a step. Everything on the path stays free.') + '<div class="opts c2">' + h + '</div>';
    },
    check1: function () { return F.a.subject === 'math' ? checkCard('Can ' + kid() + ' count to 10 out loud?', '1 2 3 … 10', 'sen') : checkCard('Point to this letter. Can ' + kid() + ' say its sound?', 'm', ''); },
    check2: function () { return F.a.subject === 'math' ? checkCard('Can ' + kid() + ' tell how many dots?', '● ● ● ● ● ● ●', 'sen') : checkCard('Can ' + kid() + ' read this word?', 'cat', ''); },
    check3: function () { return F.a.subject === 'math' ? checkCard('Can ' + kid() + ' answer this?', '2 + 3', '') : checkCard('Can ' + kid() + ' read this sentence?', 'The cat sat on a mat.', 'sen'); },
    name: function () {
      var lead = F.a.check ? 'Thanks! We will start with ' + findStep(pathKey(F.a.grade, F.a.subject), F.a.step).t.toLowerCase() + '. ' : '';
      return guide('owl', 'read', lead + (F.a.who === 'teacher' ? 'What should we put on the cover?' : F.a.who === 'student' ? "What's your name?" : "What's your child's name?"), F.a.who === 'teacher' ? 'Your class name, like Room 12. You can skip this.' : 'It goes on the cover of their book. You can skip this.') +
        '<div class="name-row"><div class="namebox"><label class="sr" for="nm">Name</label><input class="field" id="nm" maxlength="18" autocomplete="off" placeholder="' + (F.a.who === 'teacher' ? 'Room 12' : 'Emma') + '"></div><div class="name-prev">' + previewBook() + '</div></div>';
    }
  };
  // the plain-words choices, each one leads to real steps (standards) on the path
  function groups() {
    // every unit of the syllabus, every step inside it: nothing on the syllabus is left out
    var sub = F.a.subject || 'reading', k = pathKey(F.a.grade || 'k', sub), ps = sub === 'math' ? 'point' : sub === 'writing' ? 'pencil' : 'read';
    return PATHS[k].map(function (u) { return [u.t, u.t, u.f || 'owl', ps, u.steps.map(function (x) { return [x.id, x.t]; })]; });
  }
  function frIc(a, p) { return '<span class="fri">' + fr(a, p, '', true) + '</span>'; }
  function setFoot(name) {
    var sk = $('[data-skip]', s), mkb = $('[data-make]', s), t = F.a.who === 'teacher';
    foot.hidden = name !== 'name' && name !== 'state';
    if (name === 'name') { sk.hidden = false; sk.textContent = 'Skip'; mkb.textContent = 'Make my pack'; mkb.disabled = false; }
    if (name === 'state') { sk.hidden = t; sk.textContent = 'Skip'; mkb.textContent = 'Continue'; mkb.disabled = !F.a.state; }
  }
  function guessUS() { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '', l = (navigator.language || '').toLowerCase(); if (l === 'en-us') return true; return /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Indiana|Kentucky|North_Dakota|Menominee|Juneau|Sitka|Nome|Adak|Metlakatla|Yakutat)|Pacific\/Honolulu)/.test(tz); } catch (e) { return false; } }
  function previewBook() { var k = pathKey(F.a.grade || 'k', F.a.subject || 'reading'), st = findStep(k, F.a.step || steps(k)[0].id); return bookHTML({ grade: F.a.grade || 'k', subject: F.a.subject || 'reading', name: '' }, st, PHONE() ? 150 : 210); }
  function checkCard(say, big, cls) { return guide('owl', 'think', say, 'A quick look, not a test. Three cards, then we pick the step.') + '<div class="check-card"><div class="big ' + cls + '">' + big + '</div><div class="row">' + opt('yes', '', 'Yes', '', 'green') + opt('no', '', 'Not yet', '', 'orange') + '</div></div>'; }
  function render(dir) {
    var name = F.list[F.i], el = document.createElement('div'); el.className = 'step'; el.innerHTML = STEP[name]();
    back.hidden = F.i === 0; setFoot(name); setBar();
    var old = $('.step:not(.leaving)', box);
    box.appendChild(el);
    if (old) { old.classList.add('leaving'); anim(old, [{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + (-60 * dir) + 'px)', opacity: 0 }], { duration: 260, easing: EASE, fill: 'forwards' }).finished.then(function () { old.remove(); }); setTimeout(function () { if (old.parentNode) old.remove(); }, 420); }
    if (dir) anim(el, [{ transform: 'translateX(' + (110 * dir) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 640, easing: SNAP });
    // choices bounce in, one after another
    $$('.opt,.grades .opt', el).forEach(function (b, i) { anim(b, [{ transform: 'translateY(26px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 640, delay: 60 + i * 55, easing: SPRING, fill: 'backwards' }); });
    var f = $('.guide .fr', el); if (f && dir) react(f, F.i === 0 ? 'wave' : 'nod');
    wire(el, name);
    if (name === 'name') setTimeout(function () { var n = $('#nm', el); n && n.focus({ preventScroll: true }); }, RM ? 0 : 450);
  }
  function soonCountry(el, b) {
    b.classList.remove('on'); var n = $('.note', el);
    n.hidden = false; n.innerHTML = '<span>The United Kingdom, Canada, Australia and more are not here yet. Today every step follows US school standards, and every sheet is free to use anywhere.</span>';
    anim(n, [{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: SPRING });
    var f = $('.guide .fr', el); pose(f, 'think'); react(f, 'think');
  }
  function choose(btn, el, fn) {
    $$('.opt', el).forEach(function (b) { b.classList.toggle('on', b === btn); });
    anim(btn, [{ transform: 'scale(1)' }, { transform: 'scale(1.045)' }, { transform: 'scale(1)' }], { duration: 420, easing: SPRING });
    react($('.guide .fr', el), 'nod');
    F.i++; setBar(); F.i--;
    setTimeout(function () { fn(); }, RM ? 0 : 340);
  }
  // "Something else": they type it, we match it to real steps on every path for this grade (never a dead end)
  function otherBox(el, btn) {
    $$('.opt', el).forEach(function (x) { x.classList.toggle('on', x === btn); });
    var bx = $('.other-box', el), inp = $('#oth', el), out = $('.oth-sugs', el), f = $('.guide .fr', el);
    bx.hidden = false; inp.focus({ preventScroll: true }); bx.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
    pose(f, 'think'); $('.bubble', el).firstChild.textContent = 'Tell me in your own words. '; var sm = $('.bubble small', el); if (sm) sm.textContent = 'Type it below, then pick the closest step.';
    var g = F.a.grade || 'k', pool = [];
    ['reading', 'writing', 'math'].forEach(function (sub) { var k = pathKey(g, sub); if (PATHS[k]) steps(k).forEach(function (x) { pool.push({ sub: sub, s: x }); }); });
    function show() {
      var q = inp.value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && !/^(my|the|and|to|of|is|it|he|she|they|with|can|cant|not|on|in|a|an|at|for|child|kid|son|daughter|really|very|has|have|trouble|struggles|struggling|hard|tricky|help|words?)$/.test(w); }).map(function (w) { return w.length > 3 ? w.replace(/(es|s)$/, '') : w; });
      if (!q.length) { out.innerHTML = ''; return; }
      var hits = pool.map(function (o) { var hay = (o.s.t + ' ' + (o.s.d || '') + ' ' + (o.s.code || '') + ' ' + o.sub).toLowerCase(), n = 0; q.forEach(function (w) { if (hay.indexOf(w) >= 0) n++; }); return { o: o, n: n }; }).filter(function (h) { return h.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
      out.innerHTML = hits.length ? '<div class="soon-h">Closest steps we have</div>' + hits.map(function (h) { return '<button class="chip" data-pick="' + h.o.sub + '|' + h.o.s.id + '">' + esc(h.o.s.t) + ' <small>' + h.o.sub + '</small></button>'; }).join('') :
        '<div class="note"><span>Thanks, we have noted it so we can build it. For now the <button class="link" data-oth-check style="padding:4px 0">2-minute check</button> will find the right step.</span></div>';
    }
    if (!inp._w) { inp._w = 1; inp.addEventListener('input', show);
      out.addEventListener('click', function (e) {
        var pk = e.target.closest('[data-pick]');
        if (pk) { var a = pk.getAttribute('data-pick').split('|'); F.a.subject = a[0]; F.a.step = a[1]; F.list.splice(F.i + 1, 1); react(f, 'nod'); setTimeout(nextStep, RM ? 0 : 300); return; }
        if (e.target.closest('[data-oth-check]')) { try { var L = JSON.parse(localStorage.getItem('sio.asked') || '[]'); L.push(inp.value.trim()); localStorage.setItem('sio.asked', JSON.stringify(L.slice(-50))); } catch (er) {} F.a.check = []; F.list.splice(F.i + 1, 1, 'check1', 'check2', 'check3'); nextStep(); }
      }); }
  }
  function gradeName(g) { return { prek: 'pre-K', k: 'kindergarten', '1': '1st grade', '2': '2nd grade' }[g] || 'grade ' + g; }
  // the whole syllabus for this grade and subject, grouped by unit, each standard tappable
  function allList(el) {
    var L = $('.all-list', el), k = pathKey(F.a.grade || 'k', F.a.subject || 'reading'), n = 0;
    if (!L.hidden) { L.hidden = true; return; }
    var ps = F.a.subject === 'math' ? 'point' : F.a.subject === 'writing' ? 'pencil' : 'read';
    L.innerHTML = PATHS[k].map(function (u) { var c = u.c || 'sky'; return '<section class="al-unit" style="--c:var(--' + c + ');--d:var(--' + c + 'D);--t:var(--' + c + 'T)"><header class="al-head"><span class="al-fr">' + fr(u.f || 'owl', ps, '', true) + '</span><span><b>' + esc(u.t) + '</b><small>' + nStd(u) + (nStd(u) === 1 ? ' standard' : ' standards') + '</small></span></header><div class="al-grid">' + u.steps.map(function (x) { n++; return '<button class="al-std" data-pick="' + (F.a.subject || 'reading') + '|' + x.id + '">' + (x.code ? '<i class="al-code">' + esc(codeOf(x.code)) + '</i>' : '') + '<b>' + esc(x.t) + '</b>' + (x.std ? '<small>' + esc(x.std) + '</small>' : '') + '<span class="al-go" aria-hidden="true">→</span></button>'; }).join('') + '</div></section>'; }).join('') + stateExtra();
    L.hidden = false; anim(L, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: SPRING });
    if (!L._w) { L._w = 1; L.addEventListener('click', function (e) { var pk = e.target.closest('[data-pick]'); if (!pk) return; var a = pk.getAttribute('data-pick').split('|'); F.a.subject = a[0]; F.a.step = a[1]; F.list.splice(F.i + 1, 1); react($('.guide .fr', el), 'nod'); setTimeout(nextStep, RM ? 0 : 300); }); }
  }
  // standards a state has that Common Core does not: shown under their own heading, never left out
  function stateExtra() {
    var st = F.a.state || (prof() || {}).state, X = st && CURR.xw[st], sub = F.a.subject === 'math' ? 'Math' : 'ELA';
    if (!X || !X.extra || (F.a.grade || 'k') !== 'k') return '';
    var ex = X.extra.filter(function (x) { return x.s === sub; }); if (!ex.length) return '';
    var nm = (stateOf(st) || {}).n || st;
    return '<section class="al-unit" style="--c:var(--orange);--d:var(--orangeD);--t:var(--orangeT)"><header class="al-head"><span class="al-fr">' + fr('owl', 'point', '', true) + '</span><span><b>Only in ' + esc(nm) + '</b><small>' + ex.length + ' more for your state</small></span></header><div class="al-grid">' + ex.map(function (x) { return '<div class="al-std soon"><i class="al-code">' + esc(X.fw + ' ' + x.c) + '</i><b>' + esc(x.t) + '</b><small>Sheets for this step are on the way</small></div>'; }).join('') + '</div></section>';
  }
  function nextStep() { F.i++; if (F.i >= F.list.length) return finish(); render(1); }
  function wire(el, name) {
    $$('.opt', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        if (name === 'tricky' && v === 'other') { otherBox(el, b); return; }
        if (b.closest('.all-list')) return;
        choose(b, el, function () {
          if (name === 'who') { F.a.who = v; setRole(v); }
          else if (name === 'country') { if (v !== 'US') { soonCountry(el, b); return; } F.a.country = 'US'; }
          else if (name === 'grade') F.a.grade = v;
          else if (name === 'subject') {
            if (v === 'unsure') { F.a.subject = 'reading'; F.a.check = []; F.list.splice(F.i + 1, 2, 'check1', 'check2', 'check3'); }
            else F.a.subject = v;
          } else if (name === 'skill' || name === 'narrow') F.a.step = v;
          else if (name === 'tricky') {
            if (v === 'unsure') { F.a.check = []; if (F.a.subject === 'writing') { F.a.step = 'name'; F.list.splice(F.i + 1, 1); } else F.list.splice(F.i + 1, 1, 'check1', 'check2', 'check3'); }
            else { F.a.g = +v.slice(1); var gg = groups()[F.a.g]; if (gg[4].length === 1) { F.a.step = gg[4][0][0]; F.list.splice(F.i + 1, 1); } }
          }
          else if (/^check/.test(name)) {
            F.a.check.push(v);
            if (name === 'check3' || v === 'no') {
              var c = F.a.check, math = F.a.subject === 'math', map = math ? ['numt', 'ten', 'bonds'] : ['sounds', 'blend', 'shorta'], id = c.indexOf('no') >= 0 ? map[c.indexOf('no')] : (math ? 'K.OA.A.4' : 'sight');
              var k = pathKey(F.a.grade, math ? 'math' : 'reading'), have = steps(k).map(function (x) { return x.id; });
              F.a.step = have.indexOf(id) >= 0 ? id : have[0];
              F.list = F.list.filter(function (x, i) { return i <= F.i || !/^check/.test(x); });
            }
          }
          nextStep();
        });
      });
    });
    $$('[data-soon]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig');
        var g = +b.getAttribute('data-soon'), n = $('.note', el), f = $('.guide .fr', el);
        n.hidden = false; n.innerHTML = '<span>' + b.firstChild.textContent + ' grade is on its way. Today we cover pre-K to 2nd grade. <button class="link" data-go="grow" style="padding:4px 0">See how it will look</button></span>';
        anim(n, [{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: SPRING });
        pose(f, 'think'); react(f, 'think');
        $('.bubble', el).firstChild.textContent = 'Not here yet! ';
      });
    });
    $$('[data-soonsub]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig');
        var n = $('.note', el), f = $('.guide .fr', el);
        n.hidden = false; n.innerHTML = '<span>' + esc(b.getAttribute('data-soonsub')) + ' is on its way, built around the standards for every grade. Today we cover reading, writing and math.</span>';
        anim(n, [{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: SPRING });
        pose(f, 'think'); react(f, 'think');
        $('.bubble', el).firstChild.textContent = 'Not here yet! ';
      });
    });
    var ab = $('[data-all]', el); if (ab) ab.addEventListener('click', function () { allList(el); });
    if (name === 'state') stateMap(el);
    if (name === 'name') {
      var n = $('#nm', el), cvn = $('.cv-name', el), bkp = $('.name-prev .bk', el);
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); finishName(); } });
      n.addEventListener('input', function () { var v = n.value.trim(); cvn.textContent = v ? poss(v) + ' book' : 'My practice book'; if (!n._b) { n._b = 1; anim(bkp, [{ transform: 'scale(1)' }, { transform: 'scale(1.05) rotate(-1deg)' }, { transform: 'scale(1)' }], { duration: 520, easing: SPRING }); setTimeout(function () { n._b = 0; }, 260); } });
      anim(bkp, [{ transform: 'translateY(40px) scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: 150, easing: SPRING, fill: 'backwards' });
    }
  }
  // ---- the US map: tap a state, it lifts and the map glides in; small states get a zoom; type to find one
  function stateMap(el) {
    var wrap = $('.mapwrap', el), side = $('.state-side', el), inp = $('#stq', el), sugs = $('.st-sugs', el), card = $('.st-card', el), svg, vb = [0, 0, 975, 610], raf = 0;
    loadScript(AS + 'usmap.js').then(function () {
      var M = window.USMAP || {}, h = '';
      Object.keys(M).forEach(function (ab) { h += '<path class="st" data-s="' + ab + '" d="' + M[ab].d + '"><title>' + esc((stateOf(ab) || {}).n || ab) + '</title></path>'; });
      wrap.insertAdjacentHTML('afterbegin', '<svg class="usmap" viewBox="0 0 975 610" role="group" aria-label="Map of the United States">' + h + '</svg>');
      svg = $('svg', wrap); $('.map-skel', wrap).remove();
      anim(svg, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: SNAP });
      svg.addEventListener('click', function (e) { var p = e.target.closest('[data-s]'); if (p) pick(p.getAttribute('data-s'), true); });
      if (F.a.state) pick(F.a.state, false);
    });
    function zoomTo(t, ms) {
      cancelAnimationFrame(raf); var f = vb.slice(), t0 = performance.now(); ms = RM ? 1 : ms || 750;
      (function step(now) { var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3) * (1 - 2.2 * k * (1 - k) * 0);
        vb = f.map(function (v, i) { return v + (t[i] - v) * e; }); if (svg) svg.setAttribute('viewBox', vb.join(' ')); if (k < 1) raf = requestAnimationFrame(step); })(t0);
      $('[data-zout]', el).hidden = t[2] >= 975;
    }
    function boxFor(ab) { var b = window.USMAP[ab].b, w = b[2] - b[0], h = b[3] - b[1], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, W = Math.max(w * 2.4, 300), H = W * 610 / 975; if (h * 2.2 > H) { H = h * 2.2; W = H * 975 / 610; } return [cx - W / 2, cy - H / 2, W, H]; }
    function pick(ab, user) {
      var st = stateOf(ab); if (!st || !svg) return; F.a.state = ab; setFoot('state');
      $$('.st', svg).forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-s') === ab); p.classList.toggle('dim', p.getAttribute('data-s') !== ab); });
      var p = $('[data-s="' + ab + '"]', svg); svg.appendChild(p);
      if (!RM) anim(p, [{ transform: 'translateY(0)' }, { transform: 'translateY(-7px)' }], { duration: 600, easing: SPRING, fill: 'forwards' });
      zoomTo(boxFor(ab));
      var x = CURR.xw[ab], line;
      if (x) line = st.n + ' uses its own standards (' + FW[ab] + '). They are mapped: every step shows its ' + FW[ab] + ' code.';
      else if (st.e === 'ccss' && st.m === 'ccss') line = st.n + ' uses Common Core. Every step shows its Common Core code.';
      else if (st.e === 'own' || st.m === 'own') line = st.n + ' has its own standards (' + (st.e === 'own' ? st.ef : st.mf) + '). For now each step shows the matching Common Core code.';
      else line = st.n + ' uses standards built on Common Core (' + (st.ef || st.mf) + '). Each step shows the matching Common Core code.';
      card.hidden = false; card.innerHTML = '<span class="flagic">' + I.flag + '</span><div><strong>' + esc(st.n) + '</strong><span>' + esc(line) + '</span></div>';
      anim(card, [{ transform: 'translateY(14px) scale(.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 620, easing: SPRING });
      inp.value = st.n; sugs.innerHTML = '';
      var f = $('.guide .fr', el); if (user) react(f, 'nod');
    }
    $('[data-ne]', el).onclick = function () { zoomTo([735, 40, 240, 150]); };
    $('[data-zout]', el).onclick = function () { zoomTo([0, 0, 975, 610]); };
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(); if (!q) { sugs.innerHTML = ''; return; }
      var hits = CURR.states.filter(function (x) { return x.n.toLowerCase().indexOf(q) === 0 || x.s.toLowerCase() === q; }).concat(CURR.states.filter(function (x) { return x.n.toLowerCase().indexOf(q) > 0; })).slice(0, 5);
      sugs.innerHTML = hits.map(function (x) { return '<button class="chip" data-pick="' + x.s + '">' + esc(x.n) + '</button>'; }).join('');
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = $('[data-pick]', sugs); if (b) pick(b.getAttribute('data-pick'), true); } });
    sugs.addEventListener('click', function (e) { var b = e.target.closest('[data-pick]'); if (b) pick(b.getAttribute('data-pick'), true); });
  }
  function finishName() { var n = $('#nm', s); F.a.name = n ? n.value.trim().replace(/\s+/g, ' ').slice(0, 18) : ''; nextStep(); }
  $('[data-make]', s).onclick = function () { if (F.list[F.i] === 'state') { if (F.a.state) nextStep(); } else finishName(); };
  $('[data-skip]', s).onclick = function () { if (F.list[F.i] === 'state') { F.a.state = ''; nextStep(); return; } var n = $('#nm', s); if (n) n.value = ''; finishName(); };
  function finish() { sioEv('guided ' + (F.a.who || '') + ' ' + (F.a.grade || '') + ' ' + (F.a.subject || '') + ' ' + (F.a.step || ''));
    var a = F.a; if (!a.subject) a.subject = 'reading';
    var k = pathKey(a.grade || 'k', a.subject); if (!a.step) a.step = steps(k)[0].id;
    var p = { who: a.who || 'parent', country: 'US', state: a.state || '', grade: a.grade || 'k', subject: a.subject, step: a.step, name: a.name || '', ts: Date.now() };
    p.step = findStep(k, p.step).id; saveProf(p);
    if (F.where) { toast('Saved: ' + (p.state ? (stateOf(p.state) || {}).n + ', ' : 'United States, ') + GRADES[p.grade]); history.length > 1 ? history.back() : go('path'); return; }
    bar.style.setProperty('--p', 1);
    celebrate(p);
  }
  s.onShow = function () { render(0); };
  return s;
}

/* the small celebration: sheets fly into the book, the friend cheers */
function confetti(host) {
  if (RM) return; var c = document.createElement('canvas'), d = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d; host.appendChild(c);
  var g = c.getContext('2d'), cols = ['#f2317f', '#2f80d0', '#2f9e63', '#f6b20c', '#8a5cd0', '#ef8a2b'], P = [], t0 = performance.now();
  for (var i = 0; i < 110; i++) P.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .42, vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 5, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, w: 7 + Math.random() * 7, h: 4 + Math.random() * 5, c: cols[i % 6] });
  (function f(t) { var e = t - t0; g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight); P.forEach(function (p) { p.vy += .42; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - e / 2000); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); }); if (e < 2000) requestAnimationFrame(f); else c.remove(); })(t0);
}
function celebrate(p) {
  var k = pathKey(p.grade, p.subject), st = findStep(k, p.step), n = p.name, bc = BOOKC[p.subject] || BOOKC.reading;
  var party = document.createElement('div'); party.className = 'party';
  party.innerHTML = '<div class="party-in"><div class="mini-stage" style="perspective:1400px;height:250px;display:grid;place-items:center">' + bookHTML(p, st, 170) + '</div>' + fr('owl', 'cheer', 'pf', true, 'width:120px;margin-top:-30px;opacity:0') +
    '<h2>' + esc(n ? poss(n) + ' pack is ready!' : 'Your pack is ready!') + '</h2><p>' + (st.sh.length ? st.sh.length + ' free ' + (st.sh.length === 1 ? 'sheet' : 'sheets') + ', a 10-minute lesson and a book' + (n ? ' with ' + esc(n) + ' on the cover' : '') + '.' : 'Your place on the path: ' + esc(st.t) + ', with the free makers for it.') + '</p><button class="btn" data-see>' + esc(n ? 'See ' + poss(n) + ' page' : 'See my page') + '</button></div>';
  document.body.appendChild(party);
  var bk = $('.bk', party), f = $('.pf', party), h2 = $('h2', party), pp = $('p', party), btn = $('[data-see]', party);
  [h2, pp, btn].forEach(function (e) { e.style.opacity = 0; });
  anim(party, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE });
  anim(bk, [{ transform: 'scale(.3) translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, easing: SPRING });
  var r = bk.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  var list = st.sh.slice(0, 5), landed = 0;
  if (!list.length) setTimeout(function () { f.style.opacity = 1; react(f, 'pop'); setTimeout(function () { react(f, 'cheer'); }, 500); confetti(party); [h2, pp, btn].forEach(function (e, j) { anim(e, [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 120 + j * 110, easing: SPRING, fill: 'forwards' }); }); }, 500);
  list.forEach(function (id, i) {
    var im = document.createElement('div'); im.className = 'fly'; im.innerHTML = pic(id, '120px', ''); party.appendChild(im);
    var ang = (i / list.length) * 6.28 + .6, sx = innerWidth / 2 + Math.cos(ang) * innerWidth * .42 - 60, sy = innerHeight / 2 + Math.sin(ang) * innerHeight * .4 - 78;
    var k1 = { transform: 'translate(' + sx + 'px,' + sy + 'px) rotate(' + (i % 2 ? 14 : -12) + 'deg) scale(1)', opacity: 0 };
    var k2 = { transform: 'translate(' + sx + 'px,' + sy + 'px) rotate(' + (i % 2 ? 8 : -6) + 'deg) scale(1)', opacity: 1, offset: .3 };
    var k3 = { transform: 'translate(' + (cx - 60) + 'px,' + (cy - 78) + 'px) rotate(0) scale(.25)', opacity: .2 };
    im.style.left = '0'; im.style.top = '0';
    anim(im, [k1, k2, k3], { duration: 1050, delay: 250 + i * 150, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'both' }).finished.then(function () {
      im.remove(); anim(bk, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 420, easing: SPRING });
      if (++landed === list.length) {
        f.style.opacity = 1; react(f, 'pop'); setTimeout(function () { react(f, 'cheer'); }, 500); confetti(party);
        [h2, pp, btn].forEach(function (e, j) { anim(e, [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 120 + j * 110, easing: SPRING, fill: 'forwards' }); });
      }
    });
  });
  btn.onclick = function () {
    go('me'); var bb = $('.panel-book .bk'); if (bb && !RM) { var a = bk.getBoundingClientRect(), b = bb.getBoundingClientRect(); anim(bb, [{ transform: 'translate(' + (a.left - b.left + (a.width - b.width) / 2) + 'px,' + (a.top - b.top + (a.height - b.height) / 2) + 'px) scale(' + a.width / b.width + ')' }, { transform: 'none' }], { duration: 900, easing: SNAP }); }
    anim(party, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: EASE, fill: 'forwards' }).finished.then(function () { party.remove(); });
  };
}

/* ================= THE BOOK (3D closed book + page flip) ================= */
function bookHTML(p, st, w, opts) {
  opts = opts || {}; var bc = BOOKC[p.subject] || BOOKC.reading, h = Math.round(w / 0.7733), n = p.name, fF = st.unit.f;
  return '<div class="bk' + (opts.cls ? ' ' + opts.cls : '') + '" style="--w:' + w + 'px;--h:' + h + 'px;--d:' + Math.max(12, Math.round(w * .085)) + 'px;--bc:' + bc[0] + ';--bd:' + bc[1] + '" role="img" aria-label="' + esc((n ? poss(n) + ' ' : '') + st.t + ' book') + '">' +
    '<div class="bk-shadow"></div><div class="bk-3d"><div class="bk-face bk-back"></div><div class="bk-face bk-spine"></div><div class="bk-face bk-edge-r"></div><div class="bk-face bk-edge-t"></div><div class="bk-face bk-edge-b"></div>' +
    '<div class="bk-face bk-first">' + (opts.inner || '') + '</div>' +
    '<div class="bk-cover"><div class="bk-face bk-board"></div><div class="bk-face cv">' + coverArt(p, st, fF) + '<div class="bk-gloss"></div></div><div class="bk-face cv cv-in"><div class="endpaper"></div></div></div></div></div>';
}
function coverArt(p, st, fF) { /* cover letters: the site's logo letters */
  var n = p.name;
  return '<div class="cv-art"><div class="cv-brand">' + esc(BRAND) + '<i></i></div><div class="cv-label">' + fr(fF, 'read', 'cv-fr') + '<h3>' + esc(st.t) + '</h3><p>' + esc(GRADES[p.grade] || 'Kindergarten') + ' · ' + esc(SUBJ[p.subject] || 'Reading') + '</p></div>' +
    '<div class="cv-name">' + (n ? esc(poss(n)) + ' book' : 'My practice book') + '</div><div class="cv-foot">FREE PRACTICE PACK</div></div>';
}
var scriptP = {};
function loadScript(src) { return scriptP[src] || (scriptP[src] = new Promise(function (res, rej) { var x = document.createElement('script'); x.src = src; x.async = true; x.onload = res; x.onerror = rej; document.head.appendChild(x); })); }
var flipP;
function loadFlip() {
  if (flipP) return flipP;
  flipP = new Promise(function (res, rej) {
    var add = function (src, fail) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = function () { window.St ? res(window.St) : fail(); }; s.onerror = fail; document.head.appendChild(s); };
    add(AS + 'vendor/page-flip.browser.js', function () { add('https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js', function () { rej(new Error('page-flip')); }); });
  });
  return flipP;
}
// lesson lines are written for a parent; a teacher reads "your student"
function forWho(t) { return role() === 'teacher' ? String(t || '').replace(/Your child/g, 'Your student').replace(/your child/g, 'your student') : t; }
function lessonHTML(st) {
  var l = (st.les || []).map(forWho);
  return '<div class="lesson"><div class="ls"><b>Watch me</b><div><strong>You show it</strong><span>' + esc(l[0]) + '</span></div></div><div class="ls"><b>We do</b><div><strong>Do it together</strong><span>' + esc(l[1]) + '</span></div></div><div class="ls"><b>You do</b><div><strong>They try it</strong><span>' + esc(l[2]) + '</span></div></div></div>';
}
function bookScreen(q) {
  var p = profOrDefault(); if (q.step && !prof()) p = Object.assign({}, p, { step: q.step });
  var k = pathKey(p.grade, p.subject), st = findStep(k, p.step), n = p.name;
  // the reader's own version of this pack (pages, order, name, class list), kept on this device
  var ckey = 'sio.pack.' + k + '.' + st.id, cur = null; try { cur = JSON.parse(localStorage.getItem(ckey) || 'null'); } catch (e) {}
  if (!cur || !cur.sh) cur = { sh: st.sh.slice(), cls: '' }; if (cur.name != null) n = cur.name;
  var phone = PHONE(), availH = innerHeight - (phone ? 64 : 76) - (phone ? 230 : 250), pw, ph;
  if (phone) { pw = Math.min(innerWidth - 48, 420); ph = Math.round(pw / .7733); if (ph > availH) { ph = availH; pw = Math.round(ph * .7733); } }
  else { ph = Math.min(availH, 640); pw = Math.round(ph * .7733); if (pw * 2 > innerWidth - 120) { pw = Math.floor((innerWidth - 120) / 2); ph = Math.round(pw / .7733); } }
  function tI() { return '<div class="title-pg"><small>This book belongs to</small><div class="who">' + esc(n || '________') + '</div>' + fr(st.unit.f, 'wave', '') + '<small>' + esc(st.t) + '</small></div>'; }
  var titleInner = tI();
  var s = mk('<div class="stage"><div class="stage-top"><button class="iconbtn" data-close aria-label="Back">' + I.back + '</button><div style="flex:1;min-width:0"><h1>' + esc((n ? poss(n) + ' ' : '') + st.t) + '</h1><p>' + esc(GRADES[p.grade]) + ' · free practice book</p></div><button class="btn ghost sm" data-cust>' + I.tune + '<span>Customize</span></button><button class="btn sm" data-print>' + I.print + '<span class="hide-phone">Print</span></button></div>' +
    '<div class="book-area"><div class="bkwrap">' + bookHTML(p, st, pw, { inner: titleInner }) + '</div><div class="flipwrap"><div class="flipbox' + (phone ? ' single' : '') + '"><div class="flip"></div></div></div><div class="hint">' + (PHONE() ? 'Tap' : 'Click') + ' the book to open it</div></div>' +
    '<div class="book-ctl" style="visibility:hidden"><button class="round" data-prev aria-label="Previous page">' + I.back + '</button><span class="count" aria-live="polite"></span><button class="round" data-next aria-label="Next page">' + I.next + '</button><button class="btn ghost sm" data-shut>Close the book</button></div></div>');
  var bk = $('.bk', s), wrap = $('.flipwrap', s), box = $('.flipbox', s), flip = $('.flip', s), ctl = $('.book-ctl', s), cnt = $('.count', s), hint = $('.hint', s), pf = null, opening = false;
  if (phone) bk.style.setProperty('--sx', 0);
  $('[data-close]', s).onclick = function () { history.length > 1 ? history.back() : go('me'); };
  // pages: cover, endpaper, title, lesson, sheets, (stars), you did it, endpaper, back cover
  function pages() {
    var bc = BOOKC[p.subject] || BOOKC.reading, P = [];
    P.push({ hard: 1, h: '<div class="bk-face cv" style="position:absolute;inset:0;--w:' + pw + 'px;--bc:' + bc[0] + ';--bd:' + bc[1] + '">' + coverArt(p, st, st.unit.f) + '</div>' });
    P.push({ h: '<div class="endpaper"></div>' });
    P.push({ h: tI() });
    P.push({ h: '<div class="title-pg" style="justify-content:flex-start;padding:9% 8%;text-align:left;align-items:stretch"><small>For the grown-up · 10 minutes</small><h3 style="font-size:' + Math.round(pw * .07) + 'px;margin:10px 0 4px">' + esc(st.t) + '</h3><p style="margin:0 0 6px;color:var(--ink2);font-size:' + Math.max(12, Math.round(pw * .036)) + 'px">' + esc(st.d) + (st.code ? ' (' + codeOf(st.code) + ')' : '') + '</p><div style="font-size:' + Math.max(11, Math.round(pw * .032)) + 'px">' + lessonHTML(st).replace(/font-size/g, '') + '</div></div>' });
    cur.sh.forEach(function (id) { P.push({ sheet: id }); });
    if ((P.length + 3) % 2) P.push({ h: '<div class="title-pg"><small>My stars</small><div class="stars" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:18px;color:#e6dcc6">' + new Array(16).join(I.star.replace('<svg', '<svg width="100%"')) + '</div><small style="margin-top:16px">Color a star for each page you finish</small></div>' });
    P.push({ h: '<div class="title-pg done-pg"><small>You did it</small><div class="stars">' + I.star + I.star + I.star + '</div><div class="who" style="border:0">' + esc(n ? 'Great work, ' + n + '!' : 'Great work!') + '</div><small>Next on the path</small><p style="font:600 18px/1.3 var(--font);color:var(--ink);margin:6px 0 0">' + esc(nextOf(k, st).t) + '</p></div>' });
    P.push({ h: '<div class="endpaper"></div>' });
    P.push({ hard: 1, h: '<div class="bk-face cv" style="position:absolute;inset:0;--w:' + pw + 'px;--bc:' + bc[1] + ';--bd:' + bc[1] + '"><div class="cv-art" style="justify-content:flex-end;align-items:center;text-align:center"><div class="cv-brand" style="justify-content:center">' + esc(BRAND) + '</div><div class="cv-foot" style="margin-bottom:6%">Every sheet in this book is free</div></div></div>' });
    return P;
  }
  function build(St) {
    var P = pages();
    flip.innerHTML = P.map(function (x, i) {
      var side = phone ? 'r' : (i % 2 ? 'l' : 'r');
      if (x.hard) return '<div class="page hard ' + side + '" data-density="hard"><div class="pc">' + x.h + '</div></div>';
      var inner = x.sheet ? pic(x.sheet, pw + 'px', SHEET[x.sheet] || '', i < 6).replace('<img ', '<img class="sh" ') : x.h;
      return '<div class="page ' + side + '"><div class="pc">' + inner + '<div class="paper"></div><div class="gut"></div><span class="pn">' + (i > 1 && i < P.length - 2 ? i - 1 : '') + '</span></div></div>';
    }).join('');
    box.style.width = (phone ? pw : pw * 2) + 'px'; box.style.height = ph + 'px';
    pf = new St.PageFlip(flip, { width: pw, height: ph, size: 'fixed', showCover: true, usePortrait: phone, startPage: phone ? 2 : 1, drawShadow: true, maxShadowOpacity: .55, flippingTime: RM ? 1 : 950, mobileScrollSupport: false, showPageCorners: !phone, swipeDistance: 20, autoSize: false });
    pf.loadFromHTML($$('.page', flip));
    pf.on('flip', function () { upd(); warm(); }); upd(); warm();
  }
  // decode the pictures of the next pages while the reader looks at this one, so a turn never waits for a picture
  function warm() {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    idle(function () { if (!pf) return; var i = pf.getCurrentPageIndex(); $$('.page', flip).slice(i + 1, i + 5).forEach(function (pg) { var im = $('img', pg); if (im) { im.loading = 'eager'; im.decode && im.decode().catch(function () {}); } }); });
  }
  function upd() {
    if (!pf) return; var i = pf.getCurrentPageIndex(), N = pf.getPageCount();
    cnt.textContent = phone ? 'Page ' + (i + 1) + ' of ' + N : (i === 0 ? 'Cover' : (i >= N - 1 ? 'Back cover' : 'Pages ' + (i + 1) + ' and ' + Math.min(N, i + 2) + ' of ' + N));
    box.classList.toggle('at-start', i <= 0); box.classList.toggle('at-end', i >= N - 1);
    $('[data-prev]', s).disabled = i <= 0; $('[data-next]', s).disabled = i >= N - 1;
  }
  function open() {
    if (opening) return; opening = true; hint.style.opacity = 0;
    var ready = loadFlip();
    bk.classList.add('open');
    // build the page-flip book while the cover swings (after the first frame, so the tap answers at once)
    var built = new Promise(function (res) { setTimeout(function () { ready.then(function (St) { build(St); res(); }, function () { res(); }); }, 80); });
    var swing = new Promise(function (res) { setTimeout(res, RM ? 0 : 1450); });
    Promise.all([built, swing]).then(function () {
      if (!pf) { toast('The page turner could not load. Showing the pages one by one.'); }
      wrap.classList.add('on'); bk.style.visibility = 'hidden';
      ctl.style.visibility = 'visible'; anim(ctl, [{ transform: 'translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: SPRING });
    });
  }
  function shut() {
    if (!pf) return; pf.turnToPage(0); wrap.classList.remove('on'); bk.style.visibility = ''; ctl.style.visibility = 'hidden';
    requestAnimationFrame(function () { bk.classList.remove('open'); opening = false; hint.style.opacity = 1; pf.destroy && pf.destroy(); pf = null; var nf = document.createElement('div'); nf.className = 'flip'; box.replaceChild(nf, $('.flip', box)); flip = nf; });
  }
  var raf = 0;
  function bindBk() {
    bk.addEventListener('click', open);
    bk.addEventListener('pointerenter', loadFlip, { once: true });
    bk.addEventListener('touchstart', loadFlip, { once: true, passive: true });
    // the light follows the pointer a little (desktop only, only while the pointer moves over it)
    bk.addEventListener('pointermove', function (e) { if (bk.classList.contains('open') || e.pointerType !== 'mouse') return; if (raf) return; raf = requestAnimationFrame(function () { raf = 0; var r = bk.getBoundingClientRect(); bk.style.setProperty('--gx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); }); });
  }
  bindBk();
  // Customize: a panel beside the book; every change shows in the book at once
  var cp = null, rt = 0;
  function refresh() {
    try { localStorage.setItem(ckey, JSON.stringify(cur)); } catch (e) {}
    $('.stage-top h1', s).textContent = (n ? poss(n) + ' ' : '') + st.t;
    clearTimeout(rt); rt = setTimeout(function () {
      if (pf) { var at = pf.getCurrentPageIndex(); pf.destroy && pf.destroy(); pf = null; var nf = document.createElement('div'); nf.className = 'flip'; box.replaceChild(nf, $('.flip', box)); flip = nf;
        loadFlip().then(function (St) { build(St); try { pf.turnToPage(Math.min(at, pf.getPageCount() - 1)); upd(); } catch (e) {} }); }
      else { $('.bkwrap', s).innerHTML = bookHTML(Object.assign({}, p, { name: n }), st, pw, { inner: tI() }); bk = $('.bk', s); if (phone) bk.style.setProperty('--sx', 0); bindBk(); }
    }, 320);
  }
  function custOpen() {
    if (!cp) {
      cp = document.createElement('aside'); cp.className = 'cust'; cp.setAttribute('aria-label', 'Customize this pack');
      cp.innerHTML = '<div class="cust-h"><div><b>Customize this pack</b><small>Every change shows in the book</small></div><button class="iconbtn" data-cx aria-label="Close">' + I.x + '</button></div><div class="cust-b"></div><div class="cust-f"><button class="btn" data-cdone>Done</button></div>';
      s.appendChild(cp);
      cp.addEventListener('click', custClick); cp.addEventListener('input', custInput);
    }
    custPaint(); cp.classList.add('on'); s.classList.add('custing');
  }
  function custClose() { if (cp) cp.classList.remove('on'); s.classList.remove('custing'); }
  function custPaint() {
    var t = role() === 'teacher', all = steps(k), i = all.indexOf(st), prev = all[i - 1], next = all[i + 1], have = {}, N = cur.sh.length;
    cur.sh.forEach(function (id) { have[id] = 1; });
    var pool = all.filter(function (x) { return x.sh && x.sh.some(function (id) { return !have[id]; }); });
    $('.cust-b', cp).innerHTML =
      '<section><h4>' + (t ? 'Class name on the cover' : 'Name on the cover') + '</h4><input class="field" data-cname maxlength="18" placeholder="' + (t ? 'Room 12' : 'Emma') + '" value="' + esc(n || '') + '"></section>' +
      '<section><h4>Pages <span class="cnt">' + N + (N === 1 ? ' page' : ' pages') + '</span></h4><div class="goal"><i style="width:' + Math.min(100, N / 20 * 100) + '%"></i></div><small class="goal-t">' + (N >= 20 ? 'A full book. Add more any time.' : (20 - N) + ' more for a full 20-page book') + '</small>' +
        '<ol class="cpages">' + cur.sh.map(function (id, j) { return '<li><span class="cth">' + pic(id, '56px', '') + '</span><span class="ct">' + esc(SHEET[id] || 'Practice page') + '</span><span class="cbtn"><button data-up="' + j + '" aria-label="Move up"' + (j ? '' : ' disabled') + '>↑</button><button data-dn="' + j + '" aria-label="Move down"' + (j < N - 1 ? '' : ' disabled') + '>↓</button><button data-rm="' + j + '" aria-label="Remove page">×</button></span></li>'; }).join('') + '</ol></section>' +
      '<section><h4>Level</h4><div class="lvl">' +
        (prev && prev.sh && prev.sh.length ? '<button data-lv="-1"><b>Easier</b><small>Add warm-up pages: ' + esc(prev.t) + '</small></button>' : '') +
        '<button class="on" disabled><b>Just right</b><small>' + esc(st.t) + '</small></button>' +
        (next && next.sh && next.sh.length ? '<button data-lv="1"><b>Harder</b><small>Add stretch pages: ' + esc(next.t) + '</small></button>' : '') + '</div></section>' +
      (pool.length ? '<section><h4>Add more pages</h4>' + pool.map(function (x) { return '<div class="padd"><small>' + esc(x.t) + '</small><div class="prow">' + x.sh.filter(function (id) { return !have[id]; }).map(function (id) { return '<button class="pth" data-add="' + id + '" title="' + esc(SHEET[id] || '') + '">' + pic(id, '84px', SHEET[id] || '') + '<span>+</span></button>'; }).join('') + '</div></div>'; }).join('') + '</section>' : '') +
      (t ? '<section><h4>Whole class</h4><small class="goal-t">One name per line. Each student gets their own copy with their name on the cover.</small><textarea class="field" data-cls rows="5" placeholder="Ava&#10;Noah&#10;Mia">' + esc(cur.cls || '') + '</textarea><small class="goal-t cls-n">' + clsN() + '</small></section>' : '');
  }
  function clsN() { var L = (cur.cls || '').split('\n').filter(function (x) { return x.trim(); }).length; return L ? L + ' named ' + (L === 1 ? 'copy' : 'copies') + ' will print, one per student' : ''; }
  function custInput(e) {
    if (e.target.matches('[data-cname]')) { n = e.target.value.trim().slice(0, 18); cur.name = n; refresh(); }
    if (e.target.matches('[data-cls]')) { cur.cls = e.target.value; $('.cls-n', cp).textContent = clsN(); try { localStorage.setItem(ckey, JSON.stringify(cur)); } catch (er) {} }
  }
  function custClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-cx') || b.hasAttribute('data-cdone')) { custClose(); if (b.hasAttribute('data-cdone')) toast('Your pack is ready: ' + cur.sh.length + ' pages.'); return; }
    var a = cur.sh, j;
    if (b.hasAttribute('data-rm')) { if (a.length <= 1) { toast('A pack needs at least one page.'); return; } a.splice(+b.getAttribute('data-rm'), 1); }
    else if (b.hasAttribute('data-up')) { j = +b.getAttribute('data-up'); a.splice(j - 1, 0, a.splice(j, 1)[0]); }
    else if (b.hasAttribute('data-dn')) { j = +b.getAttribute('data-dn'); a.splice(j + 1, 0, a.splice(j, 1)[0]); }
    else if (b.hasAttribute('data-add')) { a.push(b.getAttribute('data-add')); }
    else if (b.hasAttribute('data-lv')) { var all = steps(k), i = all.indexOf(st), o = all[i + (+b.getAttribute('data-lv'))], add = o.sh.filter(function (id) { return a.indexOf(id) < 0; });
      if (!add.length) { toast('Those pages are already in your pack.'); return; }
      cur.sh = +b.getAttribute('data-lv') < 0 ? add.concat(a) : a.concat(add); toast(add.length + (add.length === 1 ? ' page' : ' pages') + ' added.'); }
    else return;
    var y = $('.cust-b', cp).scrollTop; custPaint(); $('.cust-b', cp).scrollTop = y; refresh();
  }
  $('[data-cust]', s).onclick = custOpen;
  $('[data-prev]', s).onclick = function () { pf && pf.flipPrev('top'); };
  $('[data-next]', s).onclick = function () { pf && pf.flipNext('top'); };
  $('[data-shut]', s).onclick = shut;
  addEventListener('keydown', function kd(e) { if (!s.isConnected) { removeEventListener('keydown', kd); return; } if (!pf) return; if (e.key === 'ArrowRight') pf.flipNext('top'); if (e.key === 'ArrowLeft') pf.flipPrev('top'); });
  s.onShow = function () { loadFlip(); };
  s.openBook = open;
  return s;
}
function nextOf(k, st) { var a = steps(k), i = a.indexOf(st); return a[Math.min(a.length - 1, i + 1)]; }

/* ================= personal page (result) ================= */
function meScreen() {
  var p = prof();
  if (!p) return mk('<div class="wrap" style="text-align:center;padding:70px 0">' + fr('owl', 'think', '', true, 'width:140px;margin:0 auto') + '<h1 style="font-size:44px;margin-top:20px">Let\'s make your first pack</h1><p style="color:var(--ink2);font-size:20px">A few quick questions. Everything is free.</p><button class="btn" data-go="start" style="margin-top:20px">Start here: 3 quick questions</button></div>');
  var k = pathKey(p.grade, p.subject), st = findStep(k, p.step), n = p.name, a = steps(k), i = a.indexOf(st), teach = p.who === 'teacher';
  var who = n ? poss(n) : teach ? 'Your class' : 'Your'; teach = teach || role() === 'teacher';
  var cards = st.sh.slice(0, 3).map(function (id) { return '<button class="sheet-card" data-zoom="' + id + '"><span class="pg">' + pic(id, '(max-width:900px) 30vw, 180px', SHEET[id]) + '</span>' + esc(SHEET[id]) + '</button>'; }).join('');
  var mini = ''; a.slice(Math.max(0, i - 2), i + 3).forEach(function (x, j, arr) { var ii = a.indexOf(x), cls = ii < i ? 'done' : ii === i ? 'cur' : ii === i + 1 ? 'nxt' : 'lock'; mini += '<span class="node ' + cls + '">' + (cls === 'done' ? I.check : I.star) + '</span>' + (j < arr.length - 1 ? '<span class="lnk' + (ii < i ? ' d' : '') + '"></span>' : ''); });
  var s = mk('<div class="wrap"><div class="me-head">' + fr('owl', 'point', '', true) + '<div><h1>' + esc(n ? poss(n) + ' page' : teach ? 'Your class page' : 'Your page') + '</h1><div class="chips"><span class="chip c">' + esc(GRADES[p.grade]) + '</span><span class="chip c">' + esc(SUBJ[p.subject]) + '</span><span class="chip c">' + esc(st.t) + '</span><button class="chip" data-go="start">Change</button></div></div></div>' +
    '<div class="me-grid">' + (st.sh.length ? '<div class="panel panel-book"><h2>' + esc(n ? poss(n) + ' book is ready' : 'Your book is ready') + '</h2><p class="sub">' + (st.sh.length + 4) + ' pages: ' + st.sh.length + ' sheets, the lesson and a finish page. Free.</p><div class="stage-mini" data-go="book">' + bookHTML(p, st, PHONE() ? 200 : 236) + '</div><button class="btn" data-go="book">' + I.book + (n ? 'Open ' + esc(poss(n)) + ' book' : 'Open the book') + '</button></div>' +
    '<div class="panel"><h2>Today\'s sheets</h2><p class="sub">Print one a day. Tap a sheet to see it big.</p><div class="row-sheets">' + cards + '</div><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px"><button class="btn sm sky" data-print>' + I.print + (function (n) { return n === 1 ? 'Print the sheet' : n === 2 ? 'Print both sheets' : 'Print all ' + n + ' sheets'; })(Math.min(3, st.sh.length)) + '</button></div></div>' +
    '<div class="panel"><h2>Today\'s 10-minute lesson</h2><p class="sub">' + (st.code ? '<span class="code">' + codeOf(st.code) + '</span> ' : '') + esc(st.d) + '</p>' + lessonHTML(st) + '</div>' : '<div class="panel" style="grid-column:1/-1"><h2>' + esc(st.t) + '</h2><p class="sub">' + (st.code ? '<span class="code">' + codeOf(st.code) + '</span> ' : '') + '</p><p class="stdline"><b>The standard, in plain words:</b> ' + esc(st.std || st.d) + '</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">' + (st.k ? '<button class="btn sm sky" data-toast="Opens the free makers for this step.">' + st.k + ' free ' + (st.k === 1 ? 'maker' : 'makers') + ' for this step</button>' : '<span class="nosheet">No free sheet for this step yet. It is on our list.</span>') + '</div></div>') +
    '<div class="panel" style="grid-column:1/-1"><div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap"><div><h2>' + esc(who) + ' path</h2><p class="sub">You are here: <b>' + esc(st.t) + '</b>. Next: ' + esc(nextOf(k, st).t) + '.</p></div><button class="btn sm navy" data-go="path">See the whole path</button></div><div class="mini-path">' + mini + '</div></div></div></div>');
  s.onShow = function () {
    react($('.me-head .fr', s), 'pop');
    $$('.panel', s).forEach(function (e, j) { anim(e, [{ transform: 'translateY(28px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 80 + j * 70, easing: SPRING, fill: 'backwards' }); });
    var b = $('.stage-mini', s); if (b) { b.addEventListener('pointerenter', loadFlip, { once: true }); b.addEventListener('touchstart', loadFlip, { once: true, passive: true }); }
  };
  return s;
}

/* ================= 2. THE LEARNING PATH ================= */
// steps further along are open too (every step is free): no padlock, just a softer 'coming up' look
function nodeIcon(state, x) { var b = BD[badgeOf(x)]; if (!b) return state === 'done' ? I.check : I.star; return b + (state === 'done' ? '<i class="nb ok">' + I.check + '</i>' : ''); }
function trailHTML(units, curIdx, band, opt) {
  opt = opt || {}; var h = '', idx = 0, pat = [0, 1, 1.6, 1, 0, -1, -1.6, -1];
  units.forEach(function (u, ui) {
    var c = COL[u.c] || COL.green, n0 = idx, n = u.steps.length, here = curIdx >= n0 && curIdx < n0 + n, done = Math.max(0, Math.min(n, curIdx - n0)), fold = opt.fold && !here;
    h += '<div class="unit' + (fold ? ' fold' : '') + '" style="--uc:' + c[0] + ';--ud:' + c[1] + '"' + (fold ? ' data-unfold="' + ui + '" role="button" tabindex="0" aria-expanded="false"' : '') + '><div><small>Unit ' + u.u + (opt.fold ? ' · ' + n + (n === 1 ? ' step' : ' steps') + (done === n ? ' · all done' : done ? ' · ' + done + ' done' : '') : '') + '</small><h2>' + esc(u.t) + '</h2></div>' + (band === 'high' || !u.f ? '' : fr(u.f, 'wave', '')) + (fold ? '<span class="unfold-ic">' + I.next + '</span>' : '') + '</div><div class="trail" style="--uc:' + c[0] + ';--ud:' + c[1] + '"' + (fold ? ' hidden data-ui="' + ui + '"' : '') + '><svg class="road" aria-hidden="true"></svg>';
    u.steps.forEach(function (x, j) {
      var st = idx < curIdx ? 'done' : idx === curIdx ? 'cur' : idx === curIdx + 1 ? 'nxt' : 'lock', off = Math.round(pat[idx % 8] * (band === 'high' ? 44 : 58) * (PHONE() ? .55 : 1));
      h += '<div class="stop" style="--i:' + j + ';transform:translateX(' + off + 'px)">' + (st === 'cur' && u.f && band !== 'high' ? '<span class="buddy ' + (off > 0 ? 'r' : 'l') + '">' + fr(u.f, 'wave', '') + '</span>' : '') + '<button class="node ' + st + '" data-step="' + x.id + '" aria-label="' + esc(x.t) + (st === 'cur' ? ', you are here' : '') + '">' + nodeIcon(st, x) + (st === 'cur' ? '<span class="here">You are here</span>' : '') + '</button><span class="lbl ' + (off > 0 ? 'l' : 'r') + (st === 'cur' ? ' cur' : '') + '">' + esc(x.t) + (opt.codes && x.code ? '<small>' + esc(codeOf(x.code)) + '</small>' : '') + '</span></div>';
      idx++;
    });
    h += '</div>';
  });
  return h;
}
function drawRoads(root) {
  $$('.trail', root).forEach(function (t) {
    var svg = $('svg.road', t), tr = t.getBoundingClientRect(), pts = $$('.node', t).map(function (n) { var r = n.getBoundingClientRect(); return [r.left - tr.left + r.width / 2, r.top - tr.top + r.height / 2]; });
    if (pts.length < 2) return; var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2; d += ' C' + a[0] + ' ' + my + ',' + b[0] + ' ' + my + ',' + b[0] + ' ' + b[1]; }
    var ns = $$('.node', t), ci = -1; ns.forEach(function (n, i) { if (n.classList.contains('cur')) ci = i; else if (n.classList.contains('done')) ci = Math.max(ci, i); });
    var dp = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var j = 1; j <= ci && j < pts.length; j++) { var a2 = pts[j - 1], b2 = pts[j], my2 = (a2[1] + b2[1]) / 2; dp += ' C' + a2[0] + ' ' + my2 + ',' + b2[0] + ' ' + my2 + ',' + b2[0] + ' ' + b2[1]; }
    svg.innerHTML = '<path class="rd-base" d="' + d + '"/><path class="rd-mid" d="' + d + '"/>' + (ci > 0 ? '<path class="rd-prog" d="' + dp + '"/>' : '');
    var pg = $('.rd-prog', svg);
    if (pg && pg.getTotalLength && !RM) { var L = pg.getTotalLength(); pg.style.strokeDasharray = L; pg.style.strokeDashoffset = L; pg.getBoundingClientRect(); pg.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.45,0,.2,1) .25s'; pg.style.strokeDashoffset = 0; }
  });
  // steps pop in as they scroll into view
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.trail .stop', root).forEach(function (x) { if (io && !RM) io.observe(x); else x.classList.add('seen'); });
}
function pathScreen(q) {
  var p = profOrDefault(); if (q.g || q.s) { p = Object.assign({}, p, { grade: q.g || p.grade, subject: q.s || p.subject }); var kk = pathKey(p.grade, p.subject); if (!steps(kk).some(function (x) { return x.id === p.step; })) p.step = steps(kk)[0].id; }
  var k = pathKey(p.grade, p.subject), a = steps(k), st = findStep(k, p.step), ci = a.indexOf(st);
  var who = role() === 'teacher' ? (p.name ? poss(p.name) + ' class' : 'Your class') : p.name ? poss(p.name) : role() === 'parent' ? "Your child's" : 'Your';
  var subj = ['reading', 'writing', 'math'].map(function (x) { return '<button class="chip' + (x === p.subject ? ' c' : '') + '" data-subj="' + x + '">' + SUBJ[x] + '</button>'; }).join('');
  var rl = role(), real = p.grade === 'k', pst = (prof() || {}).state, fwk = real ? (pst && CURR.xw[pst] ? ((stateOf(pst) || {}).n + ' ' + FW[pst]) : 'Common Core') : '';
  var cover = real ? a.length + ' steps: every ' + GRADES[p.grade] + ' ' + SUBJ[p.subject].toLowerCase() + ' standard, ' + (pst && CURR.xw[pst] ? 'with its ' + fwk + ' code' : 'from ' + fwk) + ', in teaching order.' : 'A sample path. The full ' + GRADES[p.grade] + ' path follows the same standards.';
  var year = '';
  if (rl === 'homeschool') { var tot = a.length, months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    year = '<div class="year"><div class="year-h"><strong>Your year</strong><span>' + tot + ' steps, about ' + Math.max(1, Math.ceil(tot / 36)) + ' a week</span></div><div class="year-bar">' + PATHS[k].map(function (u) { var c = COL[u.c] || COL.green; return '<i style="flex:' + u.steps.length + ';background:' + c[0] + '" title="' + esc(u.t) + '"></i>'; }).join('') + '<b style="left:' + (100 * ci / tot).toFixed(1) + '%"></b></div><div class="year-m">' + months.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</div></div>'; }
  function progCard() {
    var pct = a.length ? ci / a.length : 0, C = 2 * Math.PI * 44;
    return '<div class="pcard" style="--uc:' + (COL[st.unit.c] || COL.green)[0] + ';--ud:' + (COL[st.unit.c] || COL.green)[1] + '"><div class="pring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="pr-bg"/><circle cx="50" cy="50" r="44" class="pr-fg" style="stroke-dasharray:' + C.toFixed(1) + ';--off:' + (C * (1 - pct)).toFixed(1) + ';stroke-dashoffset:' + C.toFixed(1) + '"/></svg><b>' + ci + '<small>of ' + a.length + '</small></b></div>' +
      '<div class="pc-t"><small>Unit ' + st.unit.u + ' · ' + esc(st.unit.t) + '</small><strong>Next up: ' + esc(st.t) + '</strong><span>' + (ci ? ci + (ci === 1 ? ' step' : ' steps') + ' done. ' : '') + 'About 10 minutes a day.</span></div>' +
      '<button class="btn" data-step="' + st.id + '">' + (ci ? 'Continue' : 'Start') + I.next + '</button>' + (st.unit.f ? '<span class="pc-fr">' + fr(st.unit.f, 'cheer', '') + '</span>' : '') + '</div>';
  }
  var s = mk('<div class="wrap"><div class="path-top"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap"><div><h1 style="font-size:clamp(32px,4.4vw,52px)">' + esc(who) + ' path</h1><p style="margin:6px 0 0;color:var(--ink2);font-size:18px">' + esc(GRADES[p.grade]) + (rl === 'teacher' ? ' curriculum map' : '') + '. Tap any step. Every step is free.</p><p class="cover-line">' + esc(cover) + '</p></div><div class="subj">' + subj + '</div></div>' + year + progCard() + '</div>' +
    '<div class="trails">' + trailHTML(PATHS[k], ci, '', { fold: true, codes: rl === 'teacher' }) + '</div>' +
    '<button class="grow-link" data-go="grow">' + I.grow + '<span><b style="color:var(--ink)">3rd to 12th grade are coming.</b> See how the path grows up with your child.</span></button></div>');
  s.onShow = function () {
    drawRoads(s);
    var pr = $('.pr-fg', s); if (pr) requestAnimationFrame(function () { pr.style.transition = RM ? 'none' : 'stroke-dashoffset 1.4s cubic-bezier(.45,0,.2,1) .2s'; pr.style.strokeDashoffset = pr.style.getPropertyValue('--off'); });
    var c = $('.node.cur', s);
    if (c) {
      var r = c.getBoundingClientRect(); scrollTo(0, Math.max(0, r.top + scrollY - innerHeight * .45));
      var here = $('.here', c); anim(here, [{ transform: 'translate(-50%,14px) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,0) scale(1)', opacity: 1 }], { duration: 760, delay: 280, easing: SPRING, fill: 'backwards' });
      anim(c, [{ transform: 'scale(.7)' }, { transform: 'scale(1)' }], { duration: 760, delay: 160, easing: SPRING, fill: 'backwards' });
    }
    if (q.open) setTimeout(function () { var x = findStep(k, q.open); openSheet(x, k); }, RM ? 0 : 450);
  };
  s.addEventListener('click', function (e) {
    var uf = e.target.closest('[data-unfold]');
    if (uf) { var t = $('[data-ui="' + uf.getAttribute('data-unfold') + '"]', s), open = t.hidden; t.hidden = !open; uf.classList.toggle('open', open); uf.setAttribute('aria-expanded', open);
      if (open) { drawRoads(s); anim(t, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }], { duration: 560, easing: SNAP }); $$('.node', t).forEach(function (nd, i) { anim(nd, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, delay: 40 + i * 45, easing: SPRING, fill: 'backwards' }); }); }
      return; }
    var n = e.target.closest('[data-step]'); if (n) { openSheet(findStep(k, n.getAttribute('data-step')), k); return; }
    var sb = e.target.closest('[data-subj]'); if (sb) { var np = Object.assign({}, p, { subject: sb.getAttribute('data-subj') }); np.step = steps(pathKey(np.grade, np.subject))[0].id; if (prof()) saveProf(np); else store.set(Object.assign(np, { stepT: findStep(pathKey(np.grade, np.subject), np.step).t })); go('path'); }
  });
  addEventListener('resize', function rz() { if (!s.isConnected) { removeEventListener('resize', rz); return; } drawRoads(s); });
  return s;
}

/* bottom sheet: springs up, drags down to close */
var sheetEl, scrimEl;
function openSheet(st, k, focus) { LASTST = st;
  closeSheet(true);
  var p = profOrDefault(), a = steps(k), i = a.indexOf(st), ci = a.indexOf(findStep(k, p.step)), state = i < ci ? 'done' : i === ci ? 'cur' : i === ci + 1 ? 'nxt' : 'lock', n = p.name;
  scrimEl = document.createElement('div'); scrimEl.className = 'scrim';
  sheetEl = document.createElement('div'); sheetEl.className = 'sheet'; sheetEl.setAttribute('role', 'dialog'); sheetEl.setAttribute('aria-modal', 'true'); sheetEl.setAttribute('aria-label', st.t);
  var cards = st.sh.map(function (id) { return '<button class="sheet-card" data-zoom="' + id + '"><span class="pg">' + pic(id, '150px', SHEET[id]) + '</span>' + esc(SHEET[id]) + '</button>'; }).join('');
  var bc = BOOKC[p.subject] || BOOKC.reading;
  var primary = state === 'cur' ? '<button class="btn wide green" data-finish>' + I.check + 'We finished this step</button>' : state === 'done' ? '<button class="btn wide" data-close>Practice again any time</button>' : '<button class="btn wide" data-startstep>Start this step</button>';
  sheetEl.innerHTML = '<div class="handle" aria-hidden="true"></div><div class="sheet-h"><span class="node ' + state + '">' + nodeIcon(state, st) + '</span><div>' + (st.code ? '<span class="code">' + codeOf(st.code) + '</span>' : '') + '<h3>' + esc(st.t) + '</h3></div></div><p class="desc">' + esc(st.d) + (state === 'lock' ? ' Every step is free, so you can jump ahead any time.' : '') + '</p>' + (st.std && st.std !== st.d ? '<p class="stdline"><b>The standard, in plain words:</b> ' + esc(st.std) + '</p>' : '') +
    (st.sh.length ? '<div class="sec-t">Free sheets <span>' + st.sh.length + '</span></div><div class="hscroll">' + cards + '</div>' : '<div class="sec-t">Free sheets</div>' + (st.k ? '<button class="rowlink" data-toast="Opens the free makers for this step."><span class="node nxt" style="width:54px;height:54px;flex:none;box-shadow:0 4px 0 var(--d)">' + I.star + '</span><span><strong>' + st.k + ' free ' + (st.k === 1 ? 'maker practices' : 'makers practice') + ' this step</strong><small>Make the exact sheet, with your own words</small></span><span class="go">' + I.next + '</span></button>' : '<p class="nosheet">No free sheet for this step yet. It is on our list.</p>')) +
    (st.sh.length ? '<div class="sec-t">The pack</div><button class="rowlink" data-pack><span class="minibook" style="--bc:' + bc[0] + '">' + esc(st.t) + '</span><span><strong>' + esc((n ? poss(n) + ' ' : '') + st.t + ' book') + '</strong><small>' + (st.sh.length === 1 ? 'The sheet' : 'All ' + st.sh.length + ' sheets') + ', the lesson and ' + (n ? esc(n) + '\'s name on the cover' : 'a name on the cover') + '</small></span><span class="go">' + I.next + '</span></button>' : '') +
    (st.les ? '<div class="sec-t">Lesson plan</div><button class="rowlink" data-les><span class="node" style="width:54px;height:54px;flex:none;box-shadow:0 4px 0 var(--d)">' + I.book + '</span><span><strong>10-minute lesson</strong><small>Watch me, We do, You do. The words to say.</small></span><span class="go">' + I.next + '</span></button><div class="les-body" hidden>' + lessonHTML(st) + '</div>' : '') + primary;
  document.body.appendChild(scrimEl); document.body.appendChild(sheetEl);
  requestAnimationFrame(function () { scrimEl.classList.add('on'); });
  anim(sheetEl, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: RM ? 1 : 640, easing: SNAP, fill: 'forwards' });
  $$('.hscroll .sheet-card', sheetEl).forEach(function (c, j) { anim(c, [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650, delay: 140 + j * 60, easing: SPRING, fill: 'backwards' }); });
  scrimEl.onclick = function () { closeSheet(); };
  var les = $('.les-body', sheetEl) || document.createElement('div');
  ($('[data-les]', sheetEl) || {}).onclick = function () { les.hidden = !les.hidden; if (!les.hidden) { anim(les, [{ transform: 'translateY(-10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: SPRING }); les.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } };
  if (focus === 'lesson') { les.hidden = false; }
  ($('[data-pack]', sheetEl) || {}).onclick = function () { setStep(k, st, true); closeSheet(); go('book'); };
  var b;
  if ((b = $('[data-startstep]', sheetEl))) b.onclick = function () { setStep(k, st); closeSheet(); go('path'); toast((n ? poss(n) + ' step' : 'Your step') + ': ' + st.t); };
  if ((b = $('[data-close]', sheetEl))) b.onclick = function () { closeSheet(); };
  if ((b = $('[data-finish]', sheetEl))) b.onclick = function () { var nx = nextOf(k, st); setStep(k, nx); closeSheet(); go('path'); toast('Well done! ' + (n ? poss(n) + ' next step' : 'Next step') + ': ' + nx.t); };
  // drag to close
  var hd = $('.handle', sheetEl), y0 = null, dy = 0, t0 = 0;
  var startDrag = function (e) { if (e.target !== hd && sheetEl.scrollTop > 0) return; if (e.target.closest('button,.hscroll')) return; y0 = e.clientY; dy = 0; t0 = performance.now(); sheetEl.getAnimations().forEach(function (x) { x.commitStyles && x.commitStyles(); x.cancel(); }); sheetEl.setPointerCapture(e.pointerId); };
  sheetEl.addEventListener('pointerdown', startDrag);
  sheetEl.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sheetEl.style.transform = 'translateY(' + dy + 'px)'; });
  sheetEl.addEventListener('pointerup', function () { if (y0 == null) return; var v = dy / Math.max(1, performance.now() - t0); y0 = null; if (dy > 120 || v > .6) closeSheet(); else anim(sheetEl, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'translateY(0)' }], { duration: 500, easing: SPRING, fill: 'forwards' }); });
  addEventListener('keydown', function ek(e) { if (e.key === 'Escape') { closeSheet(); removeEventListener('keydown', ek); } });
}
function closeSheet(now) { LASTST = null;
  var sh = sheetEl, sc = scrimEl; sheetEl = scrimEl = null; if (!sh) return;
  if (now || RM) { sh.remove(); sc.remove(); return; }
  sc.classList.remove('on');
  var cur = getComputedStyle(sh).transform;
  anim(sh, [{ transform: cur === 'none' ? 'translateY(0)' : cur }, { transform: 'translateY(105%)' }], { duration: 300, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.then(function () { sh.remove(); sc.remove(); });
}
function setStep(k, st, quiet) { var p = prof() || profOrDefault(); p.step = st.id; saveProf(p); }

/* ================= the look grows up: three age bands ================= */
var BANDS = {
  early: { lbl: 'Pre-K to 2nd', h: 'Pre-K to 2nd: playful, with the six friends', p: 'Big round buttons, bright colors and a friend who guides every step. This is live today.', live: true, sub: 'Kindergarten · Reading', units: function () { return PATHS['k-reading'].slice(1, 2); }, cur: 1 },
  middle: { lbl: '3rd to 8th', h: '3rd to 8th: the same path, more grown up', p: 'Calmer colors, smaller friends, tighter type. Same steps, same free sheets.', sub: '4th grade · Math · Fractions (sample)', units: function () { return [{ t: 'Fractions', u: 4, c: 'sky', f: 'turtle', steps: [S('m1', 'Equivalent fractions', '4.NF.A.1', 'Show why 1/2 and 2/4 are the same amount.', [], []), S('m2', 'Compare two fractions', '4.NF.A.2', 'Compare fractions with different denominators.', [], []), S('m3', 'Add and subtract fractions', '4.NF.B.3a', 'Join and separate parts of the same whole.', [], []), S('m4', 'Mixed numbers', '4.NF.B.3c', 'Add and subtract mixed numbers.', [], []), S('m5', 'Fraction times a whole number', '4.NF.B.4', 'Multiply a fraction by a whole number.', [], [])] }]; }, cur: 1 },
  high: { lbl: '9th to 12th', h: '9th to 12th: sleek and focused', p: 'A quiet, dark study look. No cartoons. Teacher mode stays plain and professional.', sub: '9th grade · Biology (sample)', units: function () { return [{ t: 'Cells and energy', u: 2, c: 'sky', f: null, steps: [S('h1', 'Cells and their parts', null, 'Organelles and what each one does.', [], []), S('h2', 'DNA and proteins', 'HS-LS1-1', 'How DNA structure sets protein structure.', [], []), S('h3', 'Photosynthesis', 'HS-LS1-5', 'How light energy becomes stored chemical energy.', [], []), S('h4', 'Cellular respiration', 'HS-LS1-7', 'How cells release energy from food.', [], []), S('h5', 'Mitosis', 'HS-LS1-4', 'How cells divide to grow and repair.', [], [])] }]; }, cur: 2 }
};
function growScreen(q) {
  var band = q.band || 'early';
  var s = mk('<div class="wrap"><div style="padding:34px 0 0"><h1 style="font-size:clamp(34px,4.6vw,56px)">One path that grows up</h1><p style="color:var(--ink2);font-size:19px;margin:10px 0 22px;max-width:640px">Today we cover pre-K to 2nd grade. Here is how the same path will look for older students.</p>' +
    '<div class="seg" role="group" aria-label="Age look"><span class="pill"></span>' + Object.keys(BANDS).map(function (b) { return '<button data-b="' + b + '" aria-pressed="' + (b === band) + '">' + BANDS[b].lbl + '</button>'; }).join('') + '</div></div><div class="look"></div></div>');
  var look = $('.look', s), pill = $('.pill', s);
  function movePill() { var b = $('[aria-pressed=true]', s); pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; }
  function paint(b, animate) {
    var B = BANDS[b]; band = b; look.setAttribute('data-band', b); look.className = 'look';
    look.innerHTML = '<div class="look-in"><div class="soonbar">' + (B.live ? I.check.replace('<svg', '<svg width="22" height="22"') + ' Live today' : '<b>Not here yet.</b> A sample of the look. These grades are not live yet.') + '</div><div class="look-copy"><div><h2>' + esc(B.h) + '</h2><p>' + esc(B.p) + '</p></div><span class="chip">' + esc(B.sub) + '</span></div><div class="trails">' + trailHTML(B.units(), B.cur, b) + '</div></div>';
    $$('.seg button', s).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-b') === b); });
    movePill();
    drawRoads(look);
    if (animate) {
      anim(look, [{ opacity: .4, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: SNAP });
      $$('.node', look).forEach(function (n, i) { anim(n, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650, delay: 60 + i * 60, easing: SPRING, fill: 'backwards' }); });
    }
  }
  s.addEventListener('click', function (e) {
    var b = e.target.closest('.seg [data-b]'); if (b) { paint(b.getAttribute('data-b'), true); return; }
    var n = e.target.closest('[data-step]');
    if (n) { var B = BANDS[band]; if (B.live) { openSheet(findStep('k-reading', n.getAttribute('data-step')), 'k-reading'); } else toast('Not here yet: ' + n.getAttribute('aria-label').replace(', you are here', '')); }
  });
  s.onShow = function () { paint(band, false); };
  return s;
}

/* ================= the "I'm a" switch: the site adapts to who is using it ================= */
var roleEl;
function roleMenu(btn) {
  if (roleEl) { closeRole(); return; }
  var r = role(), p = prof(), RD = { parent: ['Parent', "Your child's path, free checks, family packs"], teacher: ['Teacher', 'Your class, curriculum map, lesson plans, class packs'], homeschool: ['Homeschool', 'A full-year plan you follow at home'], student: ['Student (high school)', 'Your own path, in a grown-up look. Not here yet'] };
  roleEl = document.createElement('div'); roleEl.className = 'rolemenu'; roleEl.setAttribute('role', 'menu');
  roleEl.innerHTML = '<p>I\'m a</p>' + Object.keys(RD).map(function (k) { return '<button role="menuitemradio" aria-checked="' + (k === r) + '" data-r="' + k + '"><b>' + RD[k][0] + '</b><span>' + RD[k][1] + '</span>' + (k === r ? '<i>' + I.check + '</i>' : '') + '</button>'; }).join('') +
    '<div class="rm-where"><span>' + I.flag + (p ? esc((p.state ? (stateOf(p.state) || {}).n : 'United States') + ' · ' + GRADES[p.grade]) : 'United States') + '</span><button class="link" data-where>Change</button></div>';
  document.body.appendChild(roleEl);
  var a = btn.getBoundingClientRect(), w = roleEl.offsetWidth; roleEl.style.top = (a.bottom + 10) + 'px'; roleEl.style.left = Math.max(12, Math.min(a.right - w, innerWidth - w - 12)) + 'px';
  anim(roleEl, [{ transform: 'translateY(-10px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: SPRING });
  roleEl.addEventListener('click', function (e) {
    var x = e.target.closest('[data-r]'); if (!x) { if (e.target.closest('[data-where]')) closeRole(); return; }
    var k = x.getAttribute('data-r'); setRole(k); closeRole();
    if (k === 'student') { go('grow', { qs: 'band=high' }); toast('High school paths are not here yet. Here is how yours will look.'); }
    else { toast({ parent: 'Set for parents: your child\'s path and family packs.', teacher: 'Set for teachers: your class, curriculum map and lesson plans.', homeschool: 'Set for homeschool: a full-year plan.' }[k]); var cur = parse().r; if (cur === 'path' || cur === 'me' || cur === 'explore') go(cur); }
  });
  setTimeout(function () { addEventListener('pointerdown', outside, true); }, 0);
}
function outside(e) { if (roleEl && !roleEl.contains(e.target) && !e.target.closest('[data-role-btn]')) closeRole(); }
function closeRole() { var r = roleEl; roleEl = null; removeEventListener('pointerdown', outside, true); if (r) anim(r, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.96)' }], { duration: 160, easing: EASE, fill: 'forwards' }).finished.then(function () { r.remove(); }); }

/* ================= Explore: every grade, subject and kind of free resource ================= */
function exploreScreen(q) {
  var p = profOrDefault(), g = q.g || p.grade || 'k', r = role();
  var gr = ['prek', 'k', '1', '2'].map(function (x) { return '<button class="chip' + (x === g ? ' c' : '') + '" data-g="' + x + '">' + GRADES[x] + '</button>'; }).join('') + '<button class="chip soonchip" data-go="grow">3rd to 12th: not here yet</button>';
  var SUBF = { reading: ['fox', 'read', 'Letters, sounds, words, stories'], writing: ['unicorn', 'pencil', 'Tracing, names, handwriting'], math: ['turtle', 'point', 'Counting, numbers, shapes'] };
  var cards = ['reading', 'writing', 'math'].map(function (sb) { var k = pathKey(g, sb), n = steps(k).length; return '<button class="xcard" data-open-path="' + sb + '">' + fr(SUBF[sb][0], SUBF[sb][1], 'xfr') + '<span><strong>' + SUBJ[sb] + '</strong><small>' + SUBF[sb][2] + '</small><em>' + n + ' steps · ' + esc(GRADES[g]) + '</em></span></button>'; }).join('');
  var sheets = Object.keys(SHEET).slice(0, 8).map(function (id) { return '<button class="sheet-card" data-zoom="' + id + '"><span class="pg">' + pic(id, '(max-width:900px) 45vw, 200px', SHEET[id]) + '</span>' + esc(SHEET[id]) + '</button>'; }).join('');
  var lead = { teacher: 'Your curriculum map, lesson plans and class packs, by grade and subject.', homeschool: 'Every subject for the whole year, step by step.', parent: 'Every free resource, by grade and subject.', student: 'Every free resource, by grade and subject.' }[r];
  var s = mk('<div class="wrap"><div style="padding:34px 0 6px"><h1 style="font-size:clamp(34px,4.6vw,56px)">Explore</h1><p style="color:var(--ink2);font-size:19px;margin:8px 0 18px">' + lead + '</p><div class="chips" style="margin:0 0 22px">' + gr + '</div></div>' +
    '<div class="xgrid">' + cards + '</div>' +
    '<div class="xrow"><button class="rowlink" data-go="start" data-preset-unsure="1"><span class="node" style="width:54px;height:54px;flex:none;box-shadow:0 4px 0 var(--d)">' + I.unsure + '</span><span><strong>Free 2-minute check</strong><small>Not sure where to start? Three cards find the step.</small></span><span class="go">' + I.next + '</span></button>' +
    '<button class="rowlink" data-open-path="reading"><span class="node" style="--c:var(--purple);--d:var(--purpleD);width:54px;height:54px;flex:none;box-shadow:0 4px 0 var(--d)">' + I.book + '</span><span><strong>' + (r === 'teacher' ? 'Curriculum map and lesson plans' : 'Lesson plans') + '</strong><small>Watch me, We do, You do, for every step on the path</small></span><span class="go">' + I.next + '</span></button></div>' +
    '<h2 style="font-size:30px;margin:34px 0 14px">Free sheets</h2><div class="more">' + sheets + '</div>' + siteLinks() + '</div>');
  s.addEventListener('click', function (e) {
    var c = e.target.closest('[data-g]'); if (c) { go('explore', { qs: 'g=' + c.getAttribute('data-g') }); return; }
    var o = e.target.closest('[data-open-path]'); if (o) go('path', { qs: 'g=' + g + '&s=' + o.getAttribute('data-open-path') });
  });
  s.onShow = function () { $$('.xcard', s).forEach(function (x, i) { anim(x, [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 680, delay: 60 + i * 70, easing: SPRING, fill: 'backwards' }); }); };
  return s;
}

/* ================= ask: one big box, answers from our free library ================= */
var askEl;
function openAsk() {
  if (askEl) return;
  sjLoad(); askEl = document.createElement('div'); askEl.className = 'askpane sioh'; askEl.setAttribute('role', 'dialog'); askEl.setAttribute('aria-label', 'What do you need?');
  askEl.innerHTML = '<div class="in"><div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="iconbtn" data-x aria-label="Close">' + I.x + '</button></div><div class="askbox">' + I.search + '<input id="q" placeholder="Short a words, counting to 10..." aria-label="What do you need?" autocomplete="off"></div><div class="sugs">' + ['short a words', 'letter sounds', 'counting to 10', 'name tracing', 'sight words', 'number bonds'].map(function (x) { return '<button class="chip" data-s="' + x + '">' + x + '</button>'; }).join('') + '</div><div class="res"></div></div>';
  document.body.appendChild(askEl);
  anim(askEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE });
  anim($('.askbox', askEl), [{ transform: 'translateY(-20px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 620, easing: SPRING });
  var inp = $('input', askEl), res = $('.res', askEl);
  setTimeout(function () { inp.focus(); }, 30);
  var all = []; Object.keys(PATHS).forEach(function (k) { steps(k).forEach(function (st) { all.push({ k: k, st: st, g: k.split('-')[0], s: k.split('-')[1] }); }); });
  var syn = { count: 'ten numbers number', counting: 'ten numbers number', tracing: 'trace name', cvc: 'short blend' };
  function find(q) {
    q = q.toLowerCase().trim(); if (!q) { res.innerHTML = ''; return; }
    var w = q.split(/\s+/), extra = w.map(function (x) { return syn[x] || ''; }).join(' ').split(/\s+/).filter(Boolean);
    var hits = all.map(function (h) { var t = (h.st.t + ' ' + h.st.d + ' ' + h.st.sh.map(function (i) { return SHEET[i]; }).join(' ')).toLowerCase(), sc = 0; w.concat(extra).forEach(function (x) { if (x.length > 1 && t.indexOf(x) >= 0) sc += t.indexOf(h.st.t.toLowerCase()) === 0 && h.st.t.toLowerCase().indexOf(x) >= 0 ? 3 : 1; }); return { h: h, sc: sc + (h.g === 'k' ? .5 : 0) }; }).filter(function (x) { return x.sc >= 1; }).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 5);
    var out = '<p style="font:600 16px/1 var(--font);color:var(--ink3);margin:6px 0 4px">Found in our free library</p>';
    
    out += hits.map(function (x, i) { var h = x.h; return '<button class="rowlink" data-hit="' + i + '"><span class="thumb" style="width:52px;height:67px;border-radius:6px;overflow:hidden;flex:none;box-shadow:0 0 0 1px var(--line)">' + (h.st.sh[0] ? pic(h.st.sh[0], '52px', '') : '') + '</span><span><strong>' + esc(h.st.t) + '</strong><small>' + esc(GRADES[h.g] + ' · ' + SUBJ[h.s] + ' · ' + h.st.sh.length + ' free ' + (h.st.sh.length === 1 ? 'sheet' : 'sheets')) + '</small></span><span class="go">' + I.next + '</span></button>'; }).join('');
    out += siteHits(q); if (!hits.length && !siteHits.n) out += '<p style="font-size:18px;color:var(--ink2)">Nothing yet for that. Try a skill like "letter sounds" or "ten frames".</p>';
    res.innerHTML = out;
    $$('.rowlink', res).forEach(function (r, i) { anim(r, [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: i * 50, easing: SPRING, fill: 'backwards' }); });
    $$('[data-hit]', res).forEach(function (b) { b.onclick = function () { var h = hits[+b.getAttribute('data-hit')].h; closeAsk(); var p = profOrDefault(); if (!prof()) { p.grade = h.g; p.subject = h.s; p.step = h.st.id; saveProf(p); } else if (p.grade !== h.g || p.subject !== h.s) { p.grade = h.g; p.subject = h.s; p.step = h.st.id; saveProf(p); } go('path', { qs: 'open=' + h.st.id }); }; });
  }
  var tmr; inp.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { find(inp.value); }, 90); });
  $$('[data-s]', askEl).forEach(function (b) { b.onclick = function () { inp.value = b.getAttribute('data-s'); find(inp.value); }; });
  $('[data-x]', askEl).onclick = closeAsk;
  askEl.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAsk(); });
}
function closeAsk() { if (!askEl) return; var a = askEl; askEl = null; anim(a, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE, fill: 'forwards' }).finished.then(function () { a.remove(); }); }

/* ---------------- start ---------------- */
paintWhere();
history.replaceState({ d: 0 }, '', location.href);
var first = parse();
if (first.r && ROUTES[first.r]) { show(first, 0); }
else { navMark(''); if (SIO.base === 'home') { var hf = $('.hero-friend'); if (hf && !RM) hf.addEventListener('pointerenter', function () { react(hf, 'wave'); }); } }
window.__sio = { go: go, openSheet: openSheet, findStep: findStep, steps: steps };
})();
