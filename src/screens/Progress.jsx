import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, H2, Stat, getSubjectPalette } from '../ui.jsx';
import { SUBJECTS } from '../data/index.js';

export default function Progress({ seed }) {
  const [subject, setSubject] = useState('maths');
  const S = seed.students;
  const subjectConfig = SUBJECTS[subject] || SUBJECTS.maths;
  const palette = getSubjectPalette(subject);

  // Helper to extract level for selected subject and week
  const getLevel = (student, weekIdx) =>
    student.subjects ? student.subjects[subject][weekIdx].level : student.history[weekIdx].level;

  // Average mastery level computed across the 3 simulated weekly check points
  const avg = [0, 1, 2].map((w) => ({
    week: `Week ${w + 1}`,
    avg: +(S.reduce((a, s) => a + getLevel(s, w), 0) / S.length).toFixed(2),
  }));

  // Count of students who advanced to a higher level between weekly assessments
  const up = [1, 2].map((w) => ({
    interval: `Wk ${w} ➔ Wk ${w + 1}`,
    moved: S.filter((s) => getLevel(s, w) > getLevel(s, w - 1)).length,
  }));

  const totalMoves = up.reduce((a, u) => a + u.moved, 0);
  const netGrowth = (avg[2].avg - avg[0].avg).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Mandatory Demo Label */}
      <Card className="border-l-8 border-sun bg-amber-50/50">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl" aria-hidden="true">💡</span>
          <div>
            <p className="font-black text-amber-950">
              Demo uses synthetic data
            </p>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
              These are simulated student records generated for the hackathon demonstration across 48 students (Class 3 to 10), not real-world clinical or testing data. Starter content to be reviewed by a teacher.
            </p>
          </div>
        </div>
      </Card>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Select Subject:
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat
          value={avg[2].avg}
          label={`${subjectConfig.name} Class Average`}
          icon="📈"
          sublabel="Out of 10.0 (Week 3)"
        />
        <Stat
          value={`+${netGrowth}`}
          label="Growth Since Week 1"
          icon="🚀"
          sublabel="Average level gain"
        />
        <Stat
          value={totalMoves}
          label="Total Level Advancements"
          icon="⭐"
          sublabel={`Across ${S.length} simulated students`}
        />
      </div>

      {/* Class Level Trajectory Chart */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <H2 className="!mb-0">{subjectConfig.name} Progression (Class 0–10)</H2>
          <span className="text-xs font-bold text-slate-500">Weekly checks</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Tracking how grouping and targeted foundational practice elevate class-wide mastery in {subjectConfig.name}.
        </p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avg} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val) => [`Class ${val} level`, 'Average Level']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1' }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Average Level"
                stroke={subjectConfig.color}
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#FFC531', stroke: subjectConfig.color, strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Students Advancing Chart */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <H2 className="!mb-0">Students Advancing in {subjectConfig.name}</H2>
          <span className="text-xs font-bold text-slate-500">Total cohort: {S.length}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Number of children who climbed at least one rung on the {subjectConfig.name} skill ladder each week.
        </p>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={up} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="interval" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val) => [`${val} students`, 'Advanced Level']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1' }}
              />
              <Bar
                dataKey="moved"
                name="Students Advanced"
                fill={palette[5]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
