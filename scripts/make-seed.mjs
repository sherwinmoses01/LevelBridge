// Generates deterministic SYNTHETIC demo data for 48 students (Class 3 to 10, 6 per class)
// across three subjects: Maths, English, and Science with 3 weekly assessments.
// Run: node scripts/make-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const maths = JSON.parse(readFileSync(join(root, 'src/data/maths.json'), 'utf8'));
const english = JSON.parse(readFileSync(join(root, 'src/data/english.json'), 'utf8'));
const science = JSON.parse(readFileSync(join(root, 'src/data/science.json'), 'utf8'));

const subjectData = { maths, english, science };

// Seeded mulberry32 PRNG for deterministic reproducible data
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(2026);

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dateFor(week) {
  const d = new Date(Date.UTC(2026, 8, 28)); // 28 Sep 2026
  d.setUTCDate(d.getUTCDate() + 7 * week);
  return d.toISOString().slice(0, 10);
}

// Extract valid mistake tags for a level from subject questions
function tagsForLevel(subjectKey, level) {
  const data = subjectData[subjectKey];
  const qTags = data.questions
    .filter((q) => q.level === level)
    .flatMap((q) => Object.values(q.wrongTags));
  if (qTags.length > 0) return [...new Set(qTags)];
  return Object.keys(data.mistakeTags).slice(0, 3);
}

// Select 2-3 mistake tags with counts 1-3
function pickMistakes(subjectKey, level) {
  const tags = tagsForLevel(subjectKey, level);
  if (!tags.length) return {};
  const unique = shuffle(tags);
  const howMany = Math.min(unique.length, 2 + Math.floor(rng() * 2));
  const mistakes = {};
  for (const tag of unique.slice(0, howMany)) {
    mistakes[tag] = 1 + Math.floor(rng() * 3);
  }
  return mistakes;
}

const students = [];
let studentCount = 0;

// 8 grades (Class 3 to 10), 6 students per grade = 48 students
for (let grade = 3; grade <= 10; grade++) {
  for (let i = 0; i < 6; i++) {
    studentCount++;
    const id = `S${String(studentCount).padStart(2, '0')}`;
    const band = grade <= 5 ? '3-5' : '6-10';

    const subjectsHistory = {};

    for (const subjKey of ['maths', 'english', 'science']) {
      // Starting level clusters around grade:
      // ~50% at grade, ~30% at grade - 1, ~10% at grade - 2, ~10% at grade + 1
      const roll = rng();
      let startOffset = 0;
      if (roll < 0.30) startOffset = -1;
      else if (roll < 0.40) startOffset = -2;
      else if (roll < 0.50 && grade < 10) startOffset = 1;

      let level = Math.max(0, Math.min(10, grade + startOffset));

      // A few students have a hidden foundation gap sitting at Class 1-2
      const hasFoundationGap = (studentCount % 7 === 0 || (grade >= 7 && studentCount % 5 === 0));
      const foundationGapLevel = (studentCount % 2 === 0) ? 2 : 1;

      const history = [];
      let didMoveUp = false;

      for (let week = 0; week <= 2; week++) {
        // About a third move up a level over three weeks
        if (week > 0 && !didMoveUp) {
          if (level < 10 && rng() < 0.35) {
            level += 1;
            didMoveUp = true;
          }
        }

        const isHidden = hasFoundationGap && level >= 3;
        const rootGap = isHidden
          ? foundationGapLevel
          : (level < 10 ? level + 1 : null);

        history.push({
          week,
          date: dateFor(week),
          level,
          rootGap,
          hiddenGap: isHidden,
          mistakes: rootGap ? pickMistakes(subjKey, rootGap) : {},
        });
      }

      subjectsHistory[subjKey] = history;
    }

    students.push({
      id,
      grade,
      band,
      history: subjectsHistory.maths, // backwards compatibility for default views
      subjects: subjectsHistory,
    });
  }
}

const out = {
  meta: {
    synthetic: true,
    note: 'SYNTHETIC DEMO DATA. These are not real students. Starter content for hackathon demonstration.',
    students: students.length,
    assessments: [0, 1, 2].map((week) => ({ week, date: dateFor(week) })),
    levelScale: '0 = below Class 1, 1-10 = Class 1 to Class 10 curriculum ladders across Maths, English, and Science',
  },
  students,
};

writeFileSync(join(root, 'src/data/students.seed.json'), JSON.stringify(out, null, 2));
console.log(`Wrote ${students.length} synthetic students to src/data/students.seed.json`);
