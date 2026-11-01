// node tools/check.js — fails if a quiz/cards block is invalid JSON, a quiz answer is out of range,
// or a lesson file exists that the syllabus does not list. Lists lessons not written yet.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
require(path.join(root, 'js', 'course.js'));
const COURSE = window.COURSE;

let errors = 0, missing = [];
const listed = new Set();
for (const ch of COURSE) for (const [slug] of ch.lessons) {
  const rel = `${ch.slug}/${slug}.md`;
  listed.add(rel);
  const file = path.join(root, 'content', rel);
  if (!fs.existsSync(file)) { missing.push(rel); continue; }
  const md = fs.readFileSync(file, 'utf8');
  for (const [, lang, body] of md.matchAll(/```(quiz|cards)\n([\s\S]*?)```/g)) {
    try {
      const data = JSON.parse(body);
      if (lang === 'quiz') data.forEach((q, i) => {
        if (!(q.answer >= 0 && q.answer < q.options.length)) { console.error(`${rel}: quiz #${i + 1} answer out of range`); errors++; }
      });
      if (lang === 'cards') data.forEach((c, i) => { if (c.length !== 2) { console.error(`${rel}: card #${i + 1} needs [front, back]`); errors++; } });
    } catch (e) { console.error(`${rel}: invalid ${lang} JSON: ${e.message}`); errors++; }
  }
  const opens = (md.match(/<details>/g) || []).length, closes = (md.match(/<\/details>/g) || []).length;
  if (opens !== closes) { console.error(`${rel}: ${opens} <details> but ${closes} </details>`); errors++; }
}
for (const dir of fs.readdirSync(path.join(root, 'content'))) {
  for (const f of fs.readdirSync(path.join(root, 'content', dir))) {
    if (!listed.has(`${dir}/${f}`)) { console.error(`content/${dir}/${f} is not in js/course.js`); errors++; }
  }
}
const total = listed.size;
console.log(`${total - missing.length}/${total} lessons written${missing.length ? `; ${missing.length} still to write` : ''}.`);
if (process.argv.includes('--missing')) missing.forEach((m) => console.log('  missing ' + m));
process.exit(errors ? 1 : 0);
