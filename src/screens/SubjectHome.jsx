import { Card, Btn, LevelBadge, UserAvatar } from '../ui.jsx';
import { SUBJECTS } from '../data/index.js';

export default function SubjectHome({ user, latestResults, onSelectSubject }) {
  const isTeen = user?.band === '6-10';

  return (
    <div className="space-y-4">
      {/* Welcome Hero */}
      <Card className="text-center py-6 sm:py-8 bg-gradient-to-b from-white to-slate-50 border border-slate-200">
        <div className="flex justify-center mb-3">
          <UserAvatar user={user} className="!h-16 !w-16 !text-2xl shadow-sm" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink">
          {isTeen ? `Welcome, ${user.name}` : `Hi, ${user.name}! 👋`}
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
          <span>🎓</span> Enrolled: <span className="font-black text-ink">Class {user.grade}</span> ({isTeen ? 'Secondary' : 'Primary'})
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-slate-600">
          Pick a subject below. Your check starts directly at <span className="font-black text-ink">Class {user.grade}</span> and adapts to find your exact skill level and root prerequisites.
        </p>
      </Card>

      {/* Subject Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(SUBJECTS).map(([key, subj]) => {
          const res = latestResults[key];
          const hasResult = res != null;

          return (
            <div
              key={key}
              className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:scale-[1.01]"
              style={{ borderTop: `6px solid ${subj.color}` }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl" aria-hidden="true">{subj.icon}</span>
                  {hasResult && (
                    <LevelBadge level={res.level} subject={key} />
                  )}
                </div>

                <h2 className="text-xl font-black text-ink">{subj.name}</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{subj.tagline}</p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
                  <div className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                    Current Standing
                  </div>
                  {hasResult ? (
                    <div>
                      <div className="text-sm font-black text-ink">
                        Level {res.level} ({res.levelName || `Class ${res.level}`})
                      </div>
                      {res.rootGap && (
                        <div className="text-2xs font-bold text-amber-800 mt-1">
                          Priority focus: Class {res.rootGap}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-500">
                      Not assessed yet
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <Btn
                  variant="pri"
                  className="w-full !py-2.5 !text-sm sm:!text-base shadow-xs"
                  style={{ backgroundColor: subj.color }}
                  onClick={() => onSelectSubject(key)}
                >
                  {hasResult ? 'Retake Check ➔' : 'Start Check 🚀'}
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
