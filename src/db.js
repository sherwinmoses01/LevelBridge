// Offline storage: Dexie wraps the browser's IndexedDB, so results survive reloads with no internet.
import Dexie from 'dexie';

export const db = new Dexie('levelbridge');

// Version 1: Original single-subject schema
db.version(1).stores({
  results: '++id,name',
  overrides: 'id',
});

// Version 2: Multi-subject support with grade, subject, and compound overrides key
db.version(2)
  .stores({
    results: '++id,name,subject,grade',
    overrides: 'id,studentId,subject',
  })
  .upgrade((tx) => {
    return tx
      .table('results')
      .toCollection()
      .modify((r) => {
        if (!r.subject) r.subject = 'maths';
        if (!r.grade) r.grade = r.band === '6-10' ? 7 : 4;
      });
  });

export async function loadAll() {
  try {
    const results = await db.results.toArray();
    const rawOverrides = await db.overrides.toArray();
    const overrides = {};
    for (const o of rawOverrides) {
      if (o.studentId && o.subject) {
        overrides[`${o.studentId}_${o.subject}`] = o.level;
      }
      overrides[o.id] = o.level;
    }
    return { results, overrides };
  } catch {
    return { results: [], overrides: {} };
  } // e.g. private mode: keep working in memory
}

export const saveResult = (rec) =>
  db.results
    .add({
      ...rec,
      subject: rec.subject || 'maths',
      grade: rec.grade ?? (rec.band === '6-10' ? 7 : 4),
    })
    .catch(() => null);

export const saveOverride = (studentId, subjectOrLevel, maybeLevel) => {
  if (maybeLevel === undefined) {
    // Legacy 2-argument signature: (id, level)
    const id = studentId;
    const level = subjectOrLevel;
    return db.overrides.put({ id, level }).catch(() => null);
  }
  // New 3-argument signature: (studentId, subject, level)
  const subject = subjectOrLevel;
  const level = maybeLevel;
  const id = `${studentId}_${subject}`;
  return db.overrides.put({ id, studentId, subject, level }).catch(() => null);
};
