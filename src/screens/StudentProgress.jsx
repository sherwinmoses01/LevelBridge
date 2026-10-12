import { Card, H2, Ladder, LevelBadge, Btn } from '../ui.jsx';
import { SUBJECTS } from '../data/index.js';

export default function StudentProgress({ user, latestResults, onSelectSubject }) {
  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <Card className="text-center py-6 bg-gradient-to-b from-white to-slate-50 border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-ink">
          My Learning Ladder
        </h1>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          <span>🎒</span> {user.name} • <span className="font-black text-ink">Class {user.grade}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Track your real mastery across all three subjects. Each ladder spans foundational Class 1 up to Class 10.
        </p>
      </Card>

      {/* 3 Small Ladders Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(SUBJECTS).map(([key, subj]) => {
          const res = latestResults[key];
          const hasResult = res != null;
          const currentLevel = hasResult ? res.level : 0;

          return (
            <Card key={key} className="p-4" style={{ borderTop: `6px solid ${subj.color}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{subj.icon}</span>
                  <div>
                    <h2 className="text-lg font-black text-ink leading-tight">{subj.name}</h2>
                    <span className="text-2xs text-slate-500 font-bold uppercase tracking-wider">
                      {hasResult ? `Level ${currentLevel}` : 'Not tested'}
                    </span>
                  </div>
                </div>
                {hasResult && <LevelBadge level={currentLevel} subject={key} />}
              </div>

              {/* Compact Ladder for Subject */}
              <div className="my-3 border-t border-b border-slate-100 py-2">
                <Ladder
                  levels={subj.data.levels}
                  here={currentLevel}
                  subject={key}
                  compact={true}
                />
              </div>

              <div className="mt-2 text-center">
                <Btn
                  variant="soft"
                  className="w-full !min-h-[36px] !py-1.5 !text-xs font-black"
                  onClick={() => onSelectSubject(key)}
                >
                  {hasResult ? 'Retake Check' : 'Start Check'}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
