// Run: node test/run.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createSession, nextQuestion, runSession } from '../src/lib/diagnostic.js';
import { groupStudents, buildTeacherPlan, classSummary } from '../src/lib/grouping.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const maths = JSON.parse(readFileSync(join(root, 'src/data/maths.json'), 'utf8'));
const english = JSON.parse(readFileSync(join(root, 'src/data/english.json'), 'utf8'));
const science = JSON.parse(readFileSync(join(root, 'src/data/science.json'), 'utf8'));
const seed = JSON.parse(readFileSync(join(root, 'src/data/students.seed.json'), 'utf8'));

const allSubjects = { maths, english, science };

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok  ${name}`);
}

const firstWrong = (q) => q.options.find((o) => o !== q.answer);

// A student who answers correctly at or below their ability level and wrongly above it
const perfectChild = (subjectData, ability) => {
  const byId = Object.fromEntries(subjectData.questions.map((q) => [q.id, q]));
  return (question) => {
    const full = byId[question.id];
    return question.level <= ability ? full.answer : firstWrong(full);
  };
};

// Check acyclic directed graph of prerequisites
function checkAcyclic(levels) {
  const levelById = Object.fromEntries(levels.map((l) => [l.id, l]));
  function visit(id, path = []) {
    if (path.includes(id)) {
      throw new Error(`Cycle detected in prerequisites: ${[...path, id].join(' -> ')}`);
    }
    const lvl = levelById[id];
    for (const p of lvl.prerequisites) {
      assert.ok(levelById[p], `Prerequisite ${p} of level ${id} must exist`);
      assert.ok(p < id, `Prerequisite ${p} must precede level ${id}`);
      visit(p, [...path, id]);
    }
  }
  for (const l of levels) visit(l.id);
}

// ---- 1. Data Integrity across all 3 subjects ----
for (const [subjKey, subjData] of Object.entries(allSubjects)) {
  test(`data integrity for ${subjKey}: 10 levels, 50 questions, acyclic prerequisites`, () => {
    assert.equal(subjData.levels.length, 10, `${subjKey} must have 10 levels`);
    assert.equal(subjData.questions.length, 50, `${subjKey} must have 50 questions`);
    checkAcyclic(subjData.levels);

    const promptSet = new Set();
    const idSet = new Set();
    const answerSlots = new Set();

    for (let id = 1; id <= 10; id++) {
      const lvl = subjData.levels.find((l) => l.id === id);
      assert.ok(lvl, `${subjKey} level ${id} must exist`);
      assert.ok(lvl.name, `${subjKey} level ${id} must have a name`);
      assert.ok(lvl.classLabel, `${subjKey} level ${id} must have a classLabel`);
      assert.ok(Array.isArray(lvl.prerequisites), `${subjKey} level ${id} prerequisites must be array`);
      assert.ok(lvl.teacherActivity && lvl.teacherActivity.steps?.length === 3, `${subjKey} level ${id} teacherActivity must have 3 steps`);
      assert.ok(lvl.selfPractice, `${subjKey} level ${id} must have selfPractice`);

      const lvlQuestions = subjData.questions.filter((q) => q.level === id);
      assert.equal(lvlQuestions.length, 5, `${subjKey} level ${id} must have exactly 5 questions`);
    }

    for (const q of subjData.questions) {
      assert.ok(!idSet.has(q.id), `${subjKey} question id ${q.id} must be unique`);
      idSet.add(q.id);

      assert.ok(!promptSet.has(q.prompt), `${subjKey} question prompt "${q.prompt}" must be unique`);
      promptSet.add(q.prompt);

      assert.equal(q.options.length, 4, `${subjKey} question ${q.id} must have 4 options`);
      assert.equal(new Set(q.options).size, 4, `${subjKey} question ${q.id} options must be unique`);
      assert.ok(q.options.includes(q.answer), `${subjKey} question ${q.id} answer must be in options`);

      const ansIdx = q.options.indexOf(q.answer);
      answerSlots.add(ansIdx);

      const wrong = q.options.filter((o) => o !== q.answer);
      assert.equal(wrong.length, 3);
      for (const w of wrong) {
        const tag = q.wrongTags[w];
        assert.ok(tag, `${subjKey} question ${q.id} must have tag for wrong option '${w}'`);
        assert.ok(subjData.mistakeTags[tag], `${subjKey} tag '${tag}' must exist in mistakeTags`);
        assert.ok(subjData.mistakeTags[tag].label, `${subjKey} tag '${tag}' must have a label`);
        assert.ok(subjData.mistakeTags[tag].explanation, `${subjKey} tag '${tag}' must have an explanation`);
      }

      if (q.passage) {
        const wordCount = q.passage.trim().split(/\s+/).length;
        assert.ok(wordCount <= 60, `${subjKey} question ${q.id} passage must be <= 60 words, got ${wordCount}`);
      }
    }

    // Verify correct answers are distributed across different slot positions (not always 0 or 1)
    assert.ok(answerSlots.size >= 4, `${subjKey} questions must place answer in multiple distinct slots (found ${answerSlots.size})`);
  });
}

// ---- 2. Maths Computable Arithmetic Verification ----
test('maths arithmetic verified by computation', () => {
  const mById = Object.fromEntries(maths.questions.map((q) => [q.id, q]));
  assert.equal(mById['M1Q5'].answer, String(30 + 7)); // 37
  assert.equal(mById['M2Q1'].answer, String(52 - 17)); // 35
  assert.equal(mById['M2Q2'].answer, String(28 + 15)); // 43
  assert.equal(mById['M2Q3'].answer, String(5 * 6)); // 30
  assert.equal(mById['M3Q1'].answer, String(7 * 8)); // 56
  assert.equal(mById['M3Q3'].answer, String(9 * 6)); // 54
  assert.equal(mById['M3Q4'].answer, String(6 * 7)); // 42
  assert.equal(mById['M4Q1'].answer, String(48 / 6)); // 8
  assert.equal(mById['M4Q2'].answer, String(72 / 8)); // 9
  assert.equal(mById['M4Q4'].answer, String(84 / 4)); // 21
  assert.equal(mById['M6Q1'].answer, '6');
  assert.equal(mById['M6Q2'].answer, String(5 - (-3))); // 8
  assert.equal(mById['M7Q1'].answer, String(0.2 * 80)); // 16
  assert.equal(mById['M7Q2'].answer, String(19 - 7)); // 12
  assert.equal(mById['M7Q3'].answer, String(21 / 3)); // 7
  assert.equal(mById['M7Q5'].answer, String(15 + 9)); // 24
  assert.equal(mById['M8Q2'].answer, String(2 * 4 + 3)); // 11
  assert.equal(mById['M8Q3'].answer, String(Math.sqrt(49))); // 7
  assert.equal(mById['M8Q4'].answer, String((17 - 5) / 2)); // 6
  assert.equal(mById['M8Q5'].answer, String(3 ** 2 + 4 ** 2)); // 25
  assert.equal(mById['M9Q1'].answer, String((14 + 4) / 3)); // 6
  assert.equal(mById['M9Q2'].answer, String((8 - 2) / (5 - 2))); // 2
  assert.equal(mById['M9Q3'].answer, String((19 - 7) / (4 - 2))); // 6
  assert.equal(mById['M9Q5'].answer, String((12 - 2 * 3) / 3)); // 2
  assert.equal(mById['M10Q2'].answer, `${Math.hypot(3, 4)} cm`); // 5 cm
  assert.equal(mById['M10Q4'].answer, `${Math.sqrt(10 ** 2 - 6 ** 2)} cm`); // 8 cm
});

// ---- 3. Diagnostic placement for ability 0 to 10 in all subjects ----
for (const [subjKey, subjData] of Object.entries(allSubjects)) {
  for (let ability = 0; ability <= 10; ability++) {
    test(`diagnostic places an ability-${ability} student at level ${ability} in ${subjKey}`, () => {
      const startLevel = ability >= 6 ? 7 : 3;
      const { result } = runSession(subjData, perfectChild(subjData, ability), { startLevel });
      assert.equal(result.level, ability);
      assert.equal(result.rootGap, ability < 10 ? ability + 1 : null);
      assert.ok(result.questionsAsked <= 12, `asked ${result.questionsAsked} questions`);
    });
  }
}

// ---- 4. Prerequisite Tracing & Start Level ----
test('a Class 9 student who fails Level 8 and was never tested on Level 2 gets a prerequisitesToCheck flag for Level 2', () => {
  // Maths Level 8 has prerequisites [7, 2].
  // A student starting at Class 9 (startLevel = 9) who fails Level 8 without testing Level 2
  const mById = Object.fromEntries(maths.questions.map((q) => [q.id, q]));
  const child = (question) => {
    // Child understands up to Level 7, so they fail Level 9 and Level 8
    return question.level <= 7 ? mById[question.id].answer : firstWrong(mById[question.id]);
  };
  const { result } = runSession(maths, child, { startLevel: 9 });
  assert.equal(result.rootGap, 8);
  assert.ok(
    result.prerequisitesToCheck.includes(2),
    `Level 2 must be flagged as untested prerequisite, got: ${JSON.stringify(result.prerequisitesToCheck)}`
  );
});

test('diagnostic start level equals the student class level', () => {
  for (let grade = 3; grade <= 10; grade++) {
    const session = createSession(maths, { startLevel: grade });
    assert.equal(session.currentLevel, grade, `Session currentLevel must start at grade ${grade}`);
    const q = nextQuestion(session);
    assert.equal(q.level, grade, `First question level must match grade ${grade}`);
  }
});

test('the diagnostic never reveals answers in the question it returns', () => {
  const state = createSession(english);
  const question = nextQuestion(state);
  assert.ok(!('answer' in question));
  assert.ok(!('wrongTags' in question));
  assert.ok(Array.isArray(question.options));
});

// ---- 5. Grouping across mixed classes ----
test('grouping across mixed classes never pushes a child above their own level and respects maxGroups', () => {
  // 48 synthetic students from Class 3 to 10
  const mixedCohort = seed.students.map((s) => ({
    id: s.id,
    grade: s.grade,
    level: s.subjects.maths[2].level,
  }));
  const groups = groupStudents(mixedCohort, maths, { maxGroups: 4, mixed: true });
  assert.ok(groups.length <= 4, `groups length ${groups.length} must be <= 4`);

  const allAssignedIds = groups.flatMap((g) => g.studentIds);
  assert.equal(allAssignedIds.length, 48, 'Every student must be in a group');
  assert.equal(new Set(allAssignedIds).size, 48, 'No duplicate assignments');

  // Verify no child is taught above their own level
  for (const g of groups) {
    for (const student of g.students) {
      assert.ok(
        g.level <= student.level,
        `Student ${student.id} (level ${student.level}) must never be placed in group above their level (group level ${g.level})`
      );
    }
  }
});

// ---- 6. Synthetic Seed Integrity ----
test('the seed has 48 students with grades 3-10 and three subjects each and is deterministic', () => {
  assert.equal(seed.meta.synthetic, true);
  assert.equal(seed.students.length, 48);

  const gradeCounts = {};
  for (const s of seed.students) {
    assert.ok(s.grade >= 3 && s.grade <= 10, `Grade ${s.grade} out of range for ${s.id}`);
    gradeCounts[s.grade] = (gradeCounts[s.grade] ?? 0) + 1;

    assert.ok(s.subjects.maths, `${s.id} missing maths history`);
    assert.ok(s.subjects.english, `${s.id} missing english history`);
    assert.ok(s.subjects.science, `${s.id} missing science history`);
    assert.equal(s.subjects.maths.length, 3);
    assert.equal(s.subjects.english.length, 3);
    assert.equal(s.subjects.science.length, 3);
  }

  for (let g = 3; g <= 10; g++) {
    assert.equal(gradeCounts[g], 6, `Grade ${g} must have exactly 6 students`);
  }
});

// ---- 7. Simulation of 600 children across ability 0 to 10 for each subject ----
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

for (const [subjKey, subjData] of Object.entries(allSubjects)) {
  const rng = mulberry32(42);
  let within1 = 0;
  let exact = 0;
  let asked = 0;
  const runs = 600;
  const byId = Object.fromEntries(subjData.questions.map((q) => [q.id, q]));

  for (let i = 0; i < runs; i++) {
    const ability = Math.floor(rng() * 11); // 0 to 10
    const grade = Math.max(3, Math.min(10, ability));
    const startLevel = grade;

    const noisyChild = (q) => {
      const full = byId[q.id];
      const knows = q.level <= ability;
      const right = knows ? rng() > 0.1 : rng() < 0.25; // 10% slips, 25% guesses
      return right ? full.answer : firstWrong(full);
    };

    const { result } = runSession(subjData, noisyChild, { startLevel, rng });
    if (result.level === ability) exact += 1;
    if (Math.abs(result.level - ability) <= 1) within1 += 1;
    asked += result.questionsAsked;
  }

  const exactPct = (exact / runs) * 100;
  const within1Pct = (within1 / runs) * 100;
  console.log(
    `info: [${subjKey}] 600 children: exact ${exactPct.toFixed(0)}%, within one level ${within1Pct.toFixed(0)}%, average ${(asked / runs).toFixed(1)} questions`
  );
  assert.ok(exactPct >= 55, `${subjKey} exact accuracy must be >= 55%, got ${exactPct.toFixed(1)}%`);
}

// Teacher plan and class summary tests
test('teacher plan fits the period and schedules every group once', () => {
  const week2 = seed.students.map((s) => ({
    id: s.id,
    level: s.subjects.maths[2].level,
  }));
  const groups = groupStudents(week2, maths, { maxGroups: 4 });
  const plan = buildTeacherPlan(groups, maths, { periodMinutes: 45 });
  assert.equal(plan.rows.length, groups.length);
  assert.ok(plan.rows.at(-1).endMinute <= 45);
  const names = plan.rows.map((r) => r.withTeacher.group);
  assert.equal(new Set(names).size, groups.length);
  assert.deepEqual(plan.warnings, []);
});

test('class summary counts every child and lists top mistakes', () => {
  const summary = classSummary(seed.students, 2, maths);
  assert.equal(summary.students, 48);
  assert.ok(summary.topMistakes.length > 0);
  const total = Object.values(summary.levelDistribution).reduce((a, b) => a + b, 0);
  assert.equal(total, 48);
  for (let l = 0; l <= 10; l++) {
    assert.ok(l in summary.levelDistribution, `Level ${l} must exist in levelDistribution`);
  }
});

console.log(`\n${passed} tests passed`);
