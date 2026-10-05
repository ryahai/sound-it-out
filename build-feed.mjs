// Builds one RSS feed per Pinterest board from pins.json, showing only pins whose release date has arrived.
// Pinterest reads each feed about once a day and publishes any new item as a pin, so releasing one item a day
// here posts one pin a day there, with nobody at a keyboard. Run daily by .github/workflows/feed.yml.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const BASE = 'https://sounditoutreading.com';
const today = new Date().toISOString().slice(0, 10);
const pins = JSON.parse(readFileSync('pins.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
mkdirSync('feeds', { recursive: true });
const boards = [...new Set(pins.map((p) => p.board))];
for (const board of boards) {
  const live = pins.filter((p) => p.board === board && p.release <= today).sort((a, b) => (a.release < b.release ? 1 : -1));
  const items = live.map((p) => `<item><title>${esc(p.title)}</title><link>${esc(p.link)}</link><guid isPermaLink="false">${esc(p.file)}</guid>
<pubDate>${new Date(p.release + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(p.description)}</description>
<enclosure url="${BASE}/pins/${esc(p.file)}" type="image/png" length="0"/><media:content url="${BASE}/pins/${esc(p.file)}" medium="image" type="image/png"/></item>`).join('\n');
  writeFileSync(`feeds/${slug(board)}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>${esc(board)}</title><link>${BASE}/</link>
<description>${esc(board)} from Sound It Out Phonics Printables</description>
${items}
</channel></rss>
`);
  console.log(`${board}: ${live.length} released of ${pins.filter((p) => p.board === board).length}`);
}
