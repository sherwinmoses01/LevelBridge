import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { groupStudents, buildTeacherPlan, classSummary } from '../lib/grouping.js';
import { Btn, Card, H2, LevelBadge, Stat, getSubjectPalette } from '../ui.jsx';
import { RemedialAIModal } from '../components/AIComponents.jsx';
import { SUBJECTS } from '../data/index.js';

const WEEK = 2; // latest of the 3 synthetic weekly checks (0-based)

export default function Teacher({ seed, results = [], overrides = {}, onOverride }) {
  const [subject, setSubject] = useState('maths');
  const [classFilter, setClassFilter] = useState('all'); // 'all' | 3..10
  const [search, setSearch] = useState('');
  const [aiGroup, setAiGroup] = useState(null); // Selected group for open-source AI remedial planning

  const subjectConfig = SUBJECTS[subject] || SUBJECTS.maths;
  const data = subjectConfig.data;
  const palette = getSubjectPalette(subject);

  // 1. Combine synthetic baseline + live local checks for the selected subject
  const syntheticList = seed.students.map((s) => ({
    id: s.id,
    grade: s.grade,
    level: s.subjects ? s.subjects[subject][WEEK].level : s.history[WEEK].level,
    src: 'synthetic',
  }));

  const localList = results
    .filter((r) => (r.subject || 'maths') === subject)
    .map((r, i) => ({
      id: r.name || `Student ${i + 1}`,
      grade: r.grade ?? 4,
      level: r.level,
      src: 'this device',
    }));

  const combined = [...syntheticList, ...localList];

  // 2. Filter cohort by class (or 'all' for mixed rooms)
  const isMixed = classFilter === 'all';
  const activeStudents = combined
    .filter((s) => isMixed || s.grade === Number(classFilter))
    .map((s) => {
      // Check compound override `${id}_${subject}` first, then fallback to `${id}`
      const overrideVal = overrides[`${s.id}_${subject}`] ?? overrides[s.id];
      return {
        ...s,
        edited: overrideVal != null,
        level: overrideVal ?? s.level,
      };
    });

  // Filter seed baseline for class analytics
  const filteredSeedStudents = seed.students
    .filter((s) => isMixed || s.grade === Number(classFilter))
    .map((s) => ({
      ...s,
      history: s.subjects ? s.subjects[subject] : s.history,
    }));

  // 3. Recompute ability grouping (respects maxGroups, never pushes child above their level)
  const groups = groupStudents(
    activeStudents.map(({ id, level, grade }) => ({ id, level, grade })),
    data,
    { maxGroups: 4, mixed: isMixed }
  );

  // 4. Recompute 45-minute instructional schedule
  const plan = buildTeacherPlan(groups, data, { periodMinutes: 45 });

  // 5. Class analytics for active subject and cohort
  const sum = classSummary(filteredSeedStudents, WEEK, data);
  const dist = Object.entries(sum.levelDistribution).map(([lvl, n]) => ({
    level: `Lvl ${lvl}`,
    fullLevel: `Class ${lvl}`,
    n,
    c: palette[+lvl],
  }));

  const avgLevel = (
    activeStudents.reduce((acc, curr) => acc + curr.level, 0) / (activeStudents.length || 1)
  ).toFixed(1);

  const levelOf = (name) => groups.find((g) => g.name === name)?.level ?? 0;

  // Search filter
  const filteredRoster = activeStudents.filter((s) =>
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Subject & Class Filter Bar */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Subject:
          </span>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            {Object.entries(SUBJECTS).map(([k, s]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSubject(k)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black transition-all ${
                  subject === k
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-slate-600 hover:text-ink hover:bg-slate-200/60'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Class Filter Chips (including All Classes for mixed-grade rooms) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Class Cohort:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setClassFilter('all')}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                classFilter === 'all'
                  ? 'bg-slate-800 text-white font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              All Classes (Mixed Room)
            </button>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassFilter(String(c))}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  classFilter === String(c)
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                Class {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:hidden">
        <Stat value={activeStudents.length} label="Students" icon="👥" sublabel={isMixed ? 'Mixed Room' : `Class ${classFilter}`} />
        <Stat value={groups.length} label="Ability Groups" icon="🎯" sublabel="Max 4 groups" />
        <Stat value={`Level ${avgLevel}`} label="Cohort Average" icon="📊" sublabel={`${subjectConfig.name} status`} />
        <Stat
          value={sum.topMistakes[0]?.count ?? 0}
          label="Top Gap Frequency"
          icon="⚠️"
          sublabel={sum.topMistakes[0]?.label ?? 'None'}
        />
      </div>

      {/* 2. Color-Coded Ability Groups */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <H2 className="!mb-0">Grouped by Real Skill Level ({subjectConfig.name})</H2>
          <span className="text-xs font-bold text-slate-600 print:hidden">
            {groups.length} active groups {isMixed && '• Mixed Class Mode'}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4 print:hidden">
          Deterministic clustering groups students with compatible learning needs regardless of nominal class, never pushing any student above their assessed level.
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {groups.map((g) => (
            <div
              key={g.name}
              className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 transition-all hover:shadow-sm flex flex-col justify-between"
              style={{ borderLeft: `8px solid ${palette[g.level]}` }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LevelBadge level={g.level} subject={subject} />
                  <div>
                    <h3 className="font-black text-ink text-lg leading-tight">{g.name}</h3>
                    <div className="text-xs font-bold text-slate-500">{g.levelName}</div>
                  </div>
                  <span className="ml-auto rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-black text-slate-700">
                    {g.studentIds.length} {g.studentIds.length === 1 ? 'student' : 'students'}
                  </span>
                </div>

                {g.mergedFromLevels.length > 1 && (
                  <div className="my-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200/70">
                    ℹ️ Merged Levels {g.mergedFromLevels.join(' & ')}: instructed at foundational Class {g.level} level.
                  </div>
                )}

                <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                  <p className="text-xs font-bold text-slate-500 mb-1">Roster:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.studentIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Open-Source AI Remedial Ideas Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 print:hidden flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setAiGroup({
                      name: g.name,
                      level: g.level,
                      levelName: g.levelName,
                      mistakes: sum.topMistakes,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky/10 hover:bg-sky/20 px-3 py-1.5 text-xs font-black text-sky border border-sky/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>✨</span> Ask Gemma: Remedial Ideas
                </button>
                <span className="text-2xs text-slate-400 font-bold uppercase">Gemma 2B</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. 45-Minute Lesson Plan as a Visual Timeline */}
      <Card id="lesson-plan">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <H2 className="!mb-0">45-Minute Multi-Level Plan</H2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Structured instructional blocks allowing 1 teacher to reach all levels in a single class period.
            </p>
          </div>
          <Btn
            variant="soft"
            className="!px-4 !py-2 !text-sm print:hidden flex items-center gap-1.5"
            onClick={() => window.print()}
          >
            🖨️ Print Plan
          </Btn>
        </div>

        {/* Timeline Flow */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
          {plan.rows.map((r, idx) => (
            <div key={r.startMinute} className="relative group">
              {/* Timeline Pin Indicator */}
              <div
                className="absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white font-black text-xs shadow-xs ring-4 ring-white"
                style={{ backgroundColor: palette[r.withTeacher.level] }}
              >
                {idx + 1}
              </div>

              {/* Time Block Content */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                {/* Time Badge and Direct Teacher Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-black text-white shadow-xs"
                    style={{ backgroundColor: palette[r.withTeacher.level] }}
                  >
                    ⏱️ {r.startMinute} – {r.endMinute} min ({r.endMinute - r.startMinute} mins)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAiGroup({
                          name: r.withTeacher.group,
                          level: r.withTeacher.level,
                          levelName: r.withTeacher.title,
                          mistakes: sum.topMistakes,
                        })
                      }
                      className="print:hidden inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 transition-colors"
                    >
                      <span>✨</span> Gemma Tips
                    </button>
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Direct Instruction
                    </span>
                  </div>
                </div>

                <div className="mb-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <div className="font-extrabold text-ink text-base">
                    👨‍🏫 Direct Teacher Focus: <span className="underline decoration-2 decoration-sky">{r.withTeacher.group}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    Topic: {r.withTeacher.title}
                  </div>
                  <ol className="mt-2 space-y-1 pl-4 list-decimal text-xs sm:text-sm text-slate-600">
                    {r.withTeacher.steps.map((step, sIdx) => (
                      <li key={sIdx} className="font-medium">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Simultaneous Independent / Peer Work */}
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                    <span>⚡</span> Concurrent Independent & Peer Activities:
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {r.meanwhile.map((m) => (
                      <div
                        key={m.group}
                        className="rounded-xl bg-white p-2.5 text-xs border border-slate-200/70"
                        style={{ borderLeft: `4px solid ${palette[levelOf(m.group)]}` }}
                      >
                        <span className="font-extrabold" style={{ color: palette[levelOf(m.group)] }}>
                          {m.group}:
                        </span>{' '}
                        <span className="text-slate-600 font-medium">{m.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Any pacing warnings */}
        {(plan.warnings || []).map((w, wIdx) => (
          <div
            key={wIdx}
            className="mt-4 rounded-xl bg-coral/10 p-3 text-xs sm:text-sm font-bold text-coral border border-coral/30"
          >
            ⚠️ {w}
          </div>
        ))}
      </Card>

      {/* 4. Class Distribution (11 bars: Levels 0-10) & Mistake Frequency */}
      <Card className="print:hidden">
        <div className="flex items-center justify-between mb-2">
          <H2 className="!mb-0">{subjectConfig.name} Mastery Distribution</H2>
          <span className="text-xs font-bold text-slate-500">
            {isMixed ? 'All classes' : `Class ${classFilter}`}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Distribution across levels 0–10 for {subjectConfig.name} and the top recurring misconceptions.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="level" tick={{ fontSize: 11, fontWeight: 'bold' }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val) => [`${val} students`, 'Count']}
                labelFormatter={(lbl) => `Level: ${lbl}`}
              />
              <Bar dataKey="n" name="Students" radius={[6, 6, 0, 0]}>
                {dist.map((d) => (
                  <Cell key={d.level} fill={d.c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <h3 className="text-sm font-extrabold text-ink mb-2">
            Top Misconceptions ({subjectConfig.name}):
          </h3>
          <div className="space-y-2">
            {sum.topMistakes.length > 0 ? (
              sum.topMistakes.map((m) => (
                <div
                  key={m.tag}
                  className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 text-xs sm:text-sm border border-slate-200"
                >
                  <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-xs font-black text-white shrink-0">
                    {m.count}×
                  </span>
                  <div>
                    <span className="font-extrabold text-ink">{m.label}:</span>{' '}
                    <span className="text-slate-600">{m.explanation}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No common misconceptions recorded in this selection.</p>
            )}
          </div>
        </div>
      </Card>

      {/* 5. Teacher Level-Override Table (Levels 0 to 10 per subject) */}
      <Card className="print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <H2 className="!mb-0">Teacher Level Override ({subjectConfig.name})</H2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              The check is a rapid estimate. Adjust any student's level below (0–10) in {subjectConfig.name} to update groupings and the lesson plan.
            </p>
          </div>
          <input
            type="search"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium focus:border-sky focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold">
                <th className="py-2.5 px-2">Student</th>
                <th className="py-2.5 px-2">Enrolled Class</th>
                <th className="py-2.5 px-2">{subjectConfig.name} Level</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.map((s) => (
                <tr key={s.id + s.src} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-2 font-black text-ink">{s.id}</td>
                  <td className="py-2.5 px-2">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-extrabold text-slate-700">
                      Class {s.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <select
                      aria-label={`Override ${subject} level for ${s.id}`}
                      className="rounded-xl border-2 border-slate-300 bg-white px-3 py-1 font-bold text-ink focus:border-sky focus:outline-none"
                      value={s.level}
                      onChange={(e) => onOverride(s.id, subject, +e.target.value)}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Class {lvl} (Level {lvl})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-2">
                    {s.edited ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                        ✏️ Override
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Default</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-xs font-semibold text-slate-500">
                    {s.src === 'this device' ? (
                      <span className="text-emerald-700 font-bold">● Local check</span>
                    ) : (
                      '○ Synthetic'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Remedial AI Modal */}
      {aiGroup && (
        <RemedialAIModal group={aiGroup} onClose={() => setAiGroup(null)} />
      )}
    </div>
  );
}
