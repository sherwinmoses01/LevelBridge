// LevelBridge grouping, teacher plan and class summary
// Plain JavaScript, no dependencies.

// Split a class into level groups.
//   results: [{ id, level, grade }]  (level 0 = below Level 1)
// In mixed mode or standard mode, groups are organized by skill level regardless of class,
// never pushing a child above their own assessed level.
// Children below Level 1 work with the Level 1 group. If there are more than maxGroups
// groups, the smallest group is merged into its lower neighbour and is taught at the EASIER level.
export function groupStudents(results, data, { maxGroups = 4, mixed = false } = {}) {
  const levelById = Object.fromEntries(data.levels.map((l) => [l.id, l]));
  const lowest = Math.min(...data.levels.map((l) => l.id));

  const byLevel = new Map();
  for (const r of results) {
    const level = Math.max(r.level, lowest);
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level).push(r);
  }

  let groups = [...byLevel.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, items]) => ({
      level,
      studentIds: items.map((it) => (typeof it === 'object' ? it.id : it)),
      students: items,
      mergedFromLevels: [level],
    }));

  while (groups.length > maxGroups) {
    let smallest = 0;
    groups.forEach((g, i) => {
      if (g.studentIds.length < groups[smallest].studentIds.length) smallest = i;
    });
    const neighbour = smallest > 0 ? smallest - 1 : smallest + 1;
    const lo = Math.min(smallest, neighbour);
    const hi = Math.max(smallest, neighbour);
    const merged = {
      level: groups[lo].level,
      studentIds: [...groups[lo].studentIds, ...groups[hi].studentIds],
      students: [...(groups[lo].students || []), ...(groups[hi].students || [])],
      mergedFromLevels: [...groups[lo].mergedFromLevels, ...groups[hi].mergedFromLevels],
    };
    groups.splice(lo, 2, merged);
  }

  return groups.map((g, i) => ({
    ...g,
    name: `Group ${String.fromCharCode(65 + i)}`,
    levelName: levelById[g.level]?.name ?? `Level ${g.level}`,
    isMixed: mixed,
  }));
}

// Build a one-period plan: the teacher works with one group at a time (lowest level first)
// while the other groups do their offline practice task.
export function buildTeacherPlan(groups, data, { periodMinutes = 45, minBlock = 8 } = {}) {
  const levelById = Object.fromEntries(data.levels.map((l) => [l.id, l]));
  const ordered = [...groups].sort((a, b) => a.level - b.level);

  let block = Math.floor(periodMinutes / ordered.length);
  let scheduled = ordered;
  const warnings = [];
  if (block < minBlock) {
    block = minBlock;
    const fit = Math.max(1, Math.floor(periodMinutes / minBlock));
    scheduled = ordered.slice(0, fit);
    warnings.push(
      `Only ${fit} of ${ordered.length} groups fit in one period; continue with the other groups in the next period.`
    );
  }

  const rows = scheduled.map((g, i) => {
    const level = levelById[g.level];
    return {
      startMinute: i * block,
      endMinute: (i + 1) * block,
      withTeacher: {
        group: g.name,
        level: g.level,
        levelName: level.name,
        title: level.teacherActivity.title,
        steps: level.teacherActivity.steps,
      },
      meanwhile: ordered
        .filter((o) => o.name !== g.name)
        .map((o) => ({ group: o.name, level: o.level, task: levelById[o.level].selfPractice })),
    };
  });

  return {
    periodMinutes,
    blockMinutes: block,
    rows,
    warnings,
    notScheduled: ordered.filter((g) => !scheduled.includes(g)).map((g) => g.name),
  };
}

// Class-level view: how many children at each level and the most common mistakes.
//   students: [{ id, history: [{ week, level, mistakes: { tag: count } }] }]
export function classSummary(students, week, data, topN = 5) {
  const maxL = Math.max(...data.levels.map((l) => l.id));
  const levelDistribution = {};
  for (let l = 0; l <= maxL; l++) levelDistribution[l] = 0;
  const totals = {};
  let count = 0;
  for (const s of students) {
    const entry = s.history.find((h) => h.week === week);
    if (!entry) continue;
    count += 1;
    levelDistribution[entry.level] = (levelDistribution[entry.level] ?? 0) + 1;
    for (const [tag, c] of Object.entries(entry.mistakes ?? {})) {
      totals[tag] = (totals[tag] ?? 0) + c;
    }
  }
  const topMistakes = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([tag, c]) => ({
      tag,
      count: c,
      label: data.mistakeTags[tag]?.label ?? tag,
      explanation: data.mistakeTags[tag]?.explanation ?? '',
    }));
  return { students: count, levelDistribution, topMistakes };
}
