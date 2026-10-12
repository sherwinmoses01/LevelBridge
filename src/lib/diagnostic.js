// LevelBridge diagnostic engine
// Plain JavaScript, no dependencies, no AI: every decision can be explained to a judge.
//
// How it works (a "staircase"):
//   - Start the child at a middle level.
//   - 2 correct answers in a row  -> move up one level.
//   - 2 wrong answers in a row    -> move down one level.
//   - A level is "passed" if the child got at least 2 right and at least 60% right there.
//     A level is "failed" if the child got at least 2 wrong and under 60% right there.
//   - Stop as soon as we find the boundary (a passed level right below a failed level),
//     or when the top level is passed, or the bottom level is failed, or after maxQuestions.
//
// The session object is changed in place. In React, copy it after each call
// (setSession({ ...session })) so the screen re-renders.

const UP_AFTER = 2;
const DOWN_AFTER = 2;
const PASS_RATIO = 0.6;

export function levelStatus(stats) {
  const asked = stats?.asked ?? 0;
  const correct = stats?.correct ?? 0;
  const wrong = asked - correct;
  if (asked >= 2 && correct >= 2 && correct / asked >= PASS_RATIO) return 'passed';
  if (asked >= 2 && wrong >= 2 && correct / asked < PASS_RATIO) return 'failed';
  return 'unknown';
}

function shuffle(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Plain-language reason for a mistake tag (used for the "why was this wrong" screen).
export function explain(data, tag) {
  return (
    data.mistakeTags[tag] ?? {
      label: 'Unclassified mistake',
      explanation: 'Ask the child to explain how they got this answer.',
    }
  );
}

export function createSession(data, { startLevel = 3, maxQuestions = 12, rng = null } = {}) {
  const levelIds = data.levels.map((l) => l.id).sort((a, b) => a - b);
  const minLevel = levelIds[0];
  const maxLevel = levelIds[levelIds.length - 1];

  const byLevel = {};
  for (const id of levelIds) {
    const questions = data.questions.filter((q) => q.level === id);
    byLevel[id] = rng ? shuffle(questions, rng) : questions;
  }

  return {
    data,
    minLevel,
    maxLevel,
    maxQuestions,
    byLevel,
    currentLevel: Math.min(Math.max(startLevel, minLevel), maxLevel),
    streak: { correct: 0, wrong: 0 },
    stats: Object.fromEntries(levelIds.map((id) => [id, { asked: 0, correct: 0 }])),
    answers: [],
    done: false,
    finishReason: null,
  };
}

function finish(state, reason) {
  state.done = true;
  state.finishReason = reason;
}

// When every question at the current level is used up, move to a neighbouring level.
function moveWhenExhausted(state) {
  const asked = new Set(state.answers.map((a) => a.questionId));
  const hasFresh = (id) =>
    id >= state.minLevel && id <= state.maxLevel && state.byLevel[id].some((q) => !asked.has(q.id));
  const status = levelStatus(state.stats[state.currentLevel]);
  const order = status === 'passed' ? [1, -1] : [-1, 1];
  for (const step of order) {
    const target = state.currentLevel + step;
    if (hasFresh(target)) {
      state.currentLevel = target;
      state.streak = { correct: 0, wrong: 0 };
      return true;
    }
  }
  return false;
}

// Returns the next question to show ({ id, level, prompt, options }) or null when finished.
// The correct answer and the mistake tags are NOT included, so the screen cannot leak them.
export function nextQuestion(state) {
  if (state.done) return null;
  const asked = new Set(state.answers.map((a) => a.questionId));
  const question = state.byLevel[state.currentLevel].find((q) => !asked.has(q.id));
  if (!question) {
    if (!moveWhenExhausted(state)) {
      finish(state, 'no-more-questions');
      return null;
    }
    return nextQuestion(state);
  }
  return {
    id: question.id,
    level: question.level,
    prompt: question.prompt,
    options: question.options,
    ...(question.passage ? { passage: question.passage } : {}),
  };
}

function checkStop(state) {
  const status = (id) => levelStatus(state.stats[id]);
  if (state.answers.length >= state.maxQuestions) return finish(state, 'question-limit');
  if (status(state.maxLevel) === 'passed') return finish(state, 'top-level-passed');
  if (status(state.minLevel) === 'failed') return finish(state, 'bottom-level-failed');
  for (let id = state.minLevel; id < state.maxLevel; id++) {
    if (status(id) === 'passed' && status(id + 1) === 'failed') {
      return finish(state, 'boundary-found');
    }
  }
  return undefined;
}

// Record one answer. Returns { correct, tag, explanation, done }.
export function submitAnswer(state, questionId, chosen) {
  if (state.done) throw new Error('Session is already finished');
  const question = state.data.questions.find((q) => q.id === questionId);
  if (!question) throw new Error(`Unknown question: ${questionId}`);
  if (state.answers.some((a) => a.questionId === questionId)) {
    throw new Error(`Question already answered: ${questionId}`);
  }

  const correct = chosen === question.answer;
  const tag = correct ? null : question.wrongTags[chosen] ?? 'unclassified';
  const level = question.level;

  state.stats[level].asked += 1;
  if (correct) state.stats[level].correct += 1;
  state.answers.push({ questionId, level, chosen, correct, tag });

  if (correct) {
    state.streak.correct += 1;
    state.streak.wrong = 0;
  } else {
    state.streak.wrong += 1;
    state.streak.correct = 0;
  }

  if (state.streak.correct >= UP_AFTER && level < state.maxLevel) {
    state.currentLevel = level + 1;
    state.streak = { correct: 0, wrong: 0 };
  } else if (state.streak.wrong >= DOWN_AFTER && level > state.minLevel) {
    state.currentLevel = level - 1;
    state.streak = { correct: 0, wrong: 0 };
  } else {
    state.currentLevel = level;
  }

  checkStop(state);
  return {
    correct,
    tag,
    explanation: correct ? null : explain(state.data, tag),
    done: state.done,
  };
}

// Every level that must be understood before this one (directly or indirectly).
function allPrerequisites(levelById, id, seen = new Set()) {
  for (const p of levelById[id].prerequisites) {
    if (!seen.has(p)) {
      seen.add(p);
      allPrerequisites(levelById, p, seen);
    }
  }
  return seen;
}

// Turn a finished session into the result shown to the teacher.
//   level                  highest level passed (0 = below Level 1)
//   rootGap                lowest level the child failed (null if none)
//   prerequisitesToCheck   prerequisites of the gap that were never covered by a passed level
//   hiddenGap              true if the child passed a higher level but failed a lower one
export function summarize(state) {
  const { data, stats } = state;
  const levelById = Object.fromEntries(data.levels.map((l) => [l.id, l]));
  const ids = data.levels.map((l) => l.id).sort((a, b) => a - b);
  const status = Object.fromEntries(ids.map((id) => [id, levelStatus(stats[id])]));

  const passed = ids.filter((id) => status[id] === 'passed');
  const failed = ids.filter((id) => status[id] === 'failed');
  const level = passed.length ? Math.max(...passed) : 0;
  const rootGap = failed.length ? Math.min(...failed) : null;
  const top = ids[ids.length - 1];
  const nextTarget = level < top ? level + 1 : null;
  const focus = rootGap ?? nextTarget;

  const covered = new Set(passed);
  for (const id of passed) for (const p of levelById[id].prerequisites) covered.add(p);
  const prerequisitesToCheck = focus
    ? levelById[focus].prerequisites.filter((p) => !covered.has(p))
    : [];

  const counts = {};
  for (const a of state.answers) {
    if (!a.correct) counts[a.tag] = (counts[a.tag] ?? 0) + 1;
  }
  const mistakes = Object.entries(counts)
    .sort((x, y) => y[1] - x[1])
    .map(([tag, count]) => ({ tag, count, ...explain(data, tag) }));

  return {
    level,
    levelName: level ? levelById[level].name : 'Below Level 1 (number sense)',
    status,
    rootGap,
    rootGapName: rootGap ? levelById[rootGap].name : null,
    nextTarget,
    prerequisitesToCheck,
    hiddenGap: rootGap !== null && rootGap < level,
    mistakes,
    questionsAsked: state.answers.length,
    finishReason: state.finishReason,
  };
}

// Run a whole session with a function that picks the answer. Handy for tests and demos.
//   answerFn(question, state) -> the option text to answer with
export function runSession(data, answerFn, options) {
  const state = createSession(data, options);
  let question = nextQuestion(state);
  while (question) {
    submitAnswer(state, question.id, answerFn(question, state));
    question = nextQuestion(state);
  }
  return { state, result: summarize(state) };
}
