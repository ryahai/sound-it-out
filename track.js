/* Sound It Out visit counter: no cookies, nothing typed is read, nothing personal. */
(function () {
try {
var W = window, D = document, N = navigator, L = location, i;
var sc = D.currentScript || D.querySelector('script[data-to]');
if (!sc || L.protocol === 'file:') return;
var TO = sc.getAttribute('data-to'), TEST = sc.getAttribute('data-test') === '1';
if (!TO) return;
if (!TEST && (N.webdriver || L.hostname !== 'sounditoutreading.com')) return;
if (N.doNotTrack === '1' || W.doNotTrack === '1' || N.msDoNotTrack === '1' || N.globalPrivacyControl) return;
var dec = function (x) { try { return decodeURIComponent(x.replace(/\+/g, ' ')); } catch (e) { return ''; } };
var enc = encodeURIComponent;
var q = {}, rest = [], parts = L.search.replace(/^\?/, '').split('&'), kv, key;
for (i = 0; i < parts.length; i++) {
if (!parts[i]) continue;
kv = parts[i].split('='); key = dec(kv[0]);
if (/^(src|c|m|k|p|utm_(source|medium|campaign|content))$/.test(key)) q[key] = dec(kv.slice(1).join('=')); else rest.push(parts[i]);
}
var src = q.src || q.utm_source || (q.p ? 'pinterest' : '');
if (!src) { q = {}; rest = null; }
var st = null;
try { st = JSON.parse(sessionStorage.getItem('sio_t')); } catch (e) {}
if (!st || !st.v) {
st = { v: '', l: L.pathname };
try { var a8 = crypto.getRandomValues(new Uint8Array(12)); for (i = 0; i < 12; i++) st.v += (a8[i] % 36).toString(36); }
catch (e) { st.v = ''; while (st.v.length < 12) st.v += Math.floor(Math.random() * 36).toString(36); }
if (src) {
st.s = src; st.m = q.m || q.utm_medium || (q.src || q.utm_source ? 'tag' : 'pin');
st.c = q.c || q.utm_content || q.p || ''; st.k = q.k || q.utm_campaign || '';
} else {
var h = (D.referrer || '').replace(/^[a-z-]+:\/\//i, '').split(/[\/?#:]/)[0].toLowerCase().replace(/^www\./, '');
if (!h) { st.s = 'direct'; st.m = 'none'; }
else if (h === L.hostname) { st.s = 'site'; st.m = 'internal'; }
else {
var MAP = [[/youtu/, 'youtube', 'social'], [/gemini|bard/, 'gemini', 'assistant'], [/chatgpt|openai/, 'chatgpt', 'assistant'],
[/perplexity/, 'perplexity', 'assistant'], [/claude\.ai/, 'claude', 'assistant'], [/copilot/, 'copilot', 'assistant'],
[/google/, 'google', 'search'], [/bing\./, 'bing', 'search'], [/duckduckgo/, 'duckduckgo', 'search'], [/yahoo/, 'yahoo', 'search'],
[/pinterest|pin\.it/, 'pinterest', 'social'], [/tiktok/, 'tiktok', 'social'], [/facebook|^fb\.|messenger/, 'facebook', 'social'],
[/instagram/, 'instagram', 'social'], [/^(x\.com|t\.co)$|twitter/, 'x', 'social'], [/reddit/, 'reddit', 'social'],
[/teacherspayteachers/, 'teacherspayteachers', 'store'], [/etsy\./, 'etsy', 'store'], [/polar\.sh/, 'polar', 'store']];
st.r = h; st.s = h; st.m = 'referral';
for (i = 0; i < MAP.length; i++) if (MAP[i][0].test(h)) { st.s = MAP[i][1]; st.m = MAP[i][2]; break; }
}
}
try { sessionStorage.setItem('sio_t', JSON.stringify(st)); } catch (e) {}
}
try { if (rest && history.replaceState) history.replaceState(history.state, '', L.pathname + (rest.length ? '?' + rest.join('&') : '') + L.hash); } catch (e) {}
var w = W.innerWidth || 0, scr = w < 600 ? 'phone' : w < 1024 ? 'tablet' : 'desktop';
var send = function (e, d) {
try {
var o = { e: e, p: L.pathname, v: st.v, w: scr, l: st.l, s: st.s, m: st.m };
if (st.c) o.c = st.c; if (st.k) o.k = st.k; if (st.r) o.r = st.r; if (d) o.d = String(d).slice(0, 80);
var j = JSON.stringify(o);
if (!(N.sendBeacon && N.sendBeacon(TO + '/h', j))) new Image().src = TO + '/h?d=' + enc(j);
} catch (x) {}
};
var deco = function (a) {
try {
if (a.hostname.indexOf('polar.sh') < 0 || a.search.indexOf('utm_source=') >= 0) return;
var add = 'utm_source=' + enc(st.s) + '&utm_medium=' + enc(st.m);
if (st.c) add += '&utm_content=' + enc(st.c); if (st.k) add += '&utm_campaign=' + enc(st.k);
a.search = (a.search ? a.search + '&' : '?') + add;
} catch (x) {}
};
var has = function (el, c) { return (' ' + ((el.getAttribute && el.getAttribute('class')) || '') + ' ').indexOf(' ' + c + ' ') >= 0; };
var up = function (el, f) { while (el && el.nodeType === 1) { if (f(el)) return el; el = el.parentNode; } return null; };
var CHECK = /^\/(why-(cant|does)-my-child-|my-child-(is-behind|can-read)|how-to-help-my-child-with-handwriting\/|what-next\/)/;
var click = function (ev) {
try {
if (ev.type === 'auxclick' && ev.button !== 1) return;
var t = ev.target, b = up(t, function (x) { return x.id === 'mk-print' || x.id === 'mk-print2' || x.id === 'mk-again' || has(x, 'sioh-btn'); });
if (b) return send(has(b, 'sioh-btn') ? 'helper_open' : b.id === 'mk-again' ? 'maker_new' : 'maker_print');
var a = up(t, function (x) { return x.tagName === 'A' && x.href; });
if (!a || !/^https?:$/.test(a.protocol)) return;
var h = a.hostname, p = a.pathname;
if (h.indexOf('polar.sh') >= 0) { deco(a); return send('checkout', h); }
if (h !== L.hostname) return send('outbound', h.replace(/^www\./, ''));
if (up(a, function (x) { return has(x, 'sioh'); })) return send('helper_pick', (a.textContent || '').replace(/\s+/g, ' '));
if (p === L.pathname) return;
var k = /-plan\/$/.test(p) ? 'plan_click' : /-bundle\/$/.test(p) ? 'bundle_click' : CHECK.test(p) ? 'check_start'
: has(a, 'card') || /(-(level|set|to)-\d+|-starter-pack)\/$/.test(p) ? 'pack_click' : '';
if (k) send(k, p);
} catch (x) {}
};
D.addEventListener('click', click, true);
D.addEventListener('auxclick', click, true);
D.addEventListener('play', function (ev) {
try { var t = ev.target; if (t && t.tagName === 'VIDEO' && !t._sio) { t._sio = 1; send('video_play', (t.currentSrc || t.poster || '').split(/[?#]/)[0].split('/').slice(-2).join('/')); } } catch (x) {}
}, true);
var did = {};
D.addEventListener('input', function (ev) {
try { var id = ev.target && ev.target.id, n = { q: 'site', pkq: 'printables', mkq: 'makers' }[id]; if (n && !did[id]) { did[id] = 1; send('search', n); } } catch (x) {}
}, true);
send('view');
for (i = 0; i < D.links.length; i++) deco(D.links[i]);
} catch (e) {}
})();
