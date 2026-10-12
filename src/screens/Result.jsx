import { useState } from 'react';
import { Btn, Card, H2, Ladder, LevelBadge } from '../ui.jsx';
import { StudentBuddyModal } from '../components/AIComponents.jsx';

export default function Result({ data, subjectKey = 'maths', user, result: r, goCheck }) {
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const isTeen = user?.band === '6-10';

  if (!r) {
    return (
      <Card className="text-center py-10">
        <div className="text-6xl mb-3">📋</div>
        <h2 className="text-2xl font-black text-ink mb-2">No check completed yet for {subjectKey}</h2>
        <p className="text-slate-600 max-w-sm mx-auto mb-6">
          Take a short adaptive check starting at Class {user.grade} to find your current level.
        </p>
        <Btn variant="go" onClick={goCheck}>
          Start your check now ➔
        </Btn>
      </Card>
    );
  }

  // Lookup helper for level names from curriculum dataset
  const lv = (id) => data.levels.find((l) => l.id === id)?.name ?? `Class ${id}`;
  const pre = (r.prerequisitesToCheck || []).map((p) =>
    typeof p === 'object' ? p.level ?? p.id : p
  );

  // A respectful foundation card is shown whenever the root gap is below the student's enrolled class
  const isBelowClassGap = r.rootGap != null && user?.grade && r.rootGap < user.grade;

  return (
    <div className="space-y-4">
      {/* Primary Result Hero Card */}
      <Card className="text-center py-6 sm:py-8 bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200">
        <div className="flex justify-center mb-3">
          <LevelBadge level={r.level} subject={subjectKey} big />
        </div>
        <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {subjectKey} Diagnostic Result
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink">
          {user.name}, you are at <span className="underline decoration-sky decoration-4">Class {r.level}</span>
        </h1>
        <p className="text-lg font-bold text-slate-700 mt-1">{r.levelName}</p>

        {/* Next Target Goal Highlight */}
        {r.nextTarget && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 ring-2 ring-amber-300 text-amber-950">
            <span className="text-xl" aria-hidden="true">🎯</span>
            <span className="text-sm sm:text-base font-extrabold">
              Next target: Class {r.nextTarget} • {lv(r.nextTarget)}
            </span>
          </div>
        )}

        {/* Interactive Open-Source AI Buddy Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowBuddyModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky/10 hover:bg-sky/20 px-4 py-2.5 text-sm sm:text-base font-black text-sky border border-sky/30 transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <span>✨</span>
            <span>Ask Gemma AI: Step-by-Step Explanation</span>
          </button>
        </div>
      </Card>

      {/* Respectful Foundation Card when gap sits below student's enrolled class */}
      {isBelowClassGap && (
        <Card className="border-l-8 border-indigo-600 bg-indigo-50/50">
          <H2 className="text-indigo-950">A foundation to strengthen first</H2>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-indigo-200">
            <p className="text-base font-black text-indigo-950">
              {lv(r.rootGap)} (Class {r.rootGap})
            </p>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">
              Many students in Class {user.grade} benefit from revisiting this key step. Solidifying this foundation makes subsequent topics much easier to master.
            </p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBuddyModal(true)}
                className="shrink-0 rounded-xl bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-900 transition-colors"
              >
                Explore with Gemma ✨
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Clear Skill Ladder */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <H2 className="!mb-0">Skill Ladder ({subjectKey})</H2>
          <span className="text-xs font-bold text-slate-500 capitalize">
            Enrolled: Class {user.grade}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Four developmental stages across Classes 1 to 10. Check where you are and what comes next!
        </p>
        <Ladder
          levels={data.levels}
          here={r.level}
          goal={r.nextTarget}
          subject={subjectKey}
        />
      </Card>

      {/* Earliest Gap and Prerequisite Alerts (when not already shown above) */}
      {!isBelowClassGap && (r.rootGap || pre.length > 0) && (
        <Card className="border-l-8 border-sun bg-amber-50/30">
          <H2 className="text-amber-900">What to practise first</H2>
          {r.rootGap && (
            <div className="mb-3 rounded-2xl bg-white p-4 ring-1 ring-amber-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-ink">
                    Priority: <span className="text-amber-800">Class {r.rootGap} ({r.rootGapName})</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    This is the earliest missing foundation. Master this step first so harder skills become much easier!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBuddyModal(true)}
                  className="shrink-0 rounded-xl bg-amber-100 hover:bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors"
                >
                  Ask Buddy ✨
                </button>
              </div>
            </div>
          )}

          {pre.length > 0 && (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-200">
              <p className="text-sm font-bold text-ink">
                Prerequisite note for teacher:
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Confirm understanding of {pre.map((p) => `Class ${p} (${lv(p)})`).join(', ')}.
                These foundational skills were not directly tested in this short diagnostic.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Plain-Language Mistake Explanations */}
      <Card>
        <H2>Mistakes explained</H2>
        <p className="text-sm text-slate-600 mb-3">
          Understanding why mistakes happen helps turn them into stepping stones.
        </p>
        {r.mistakes && r.mistakes.length > 0 ? (
          <div className="space-y-3">
            {r.mistakes.map((m) => (
              <div
                key={m.tag}
                className="rounded-2xl bg-slate-50 p-4 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-ink">{m.label}</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-700">
                    {m.count}× seen
                  </span>
                </div>
                <p className="text-sm text-slate-600">{m.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-center">
            <span className="text-2xl mb-1 block" aria-hidden="true">🎉</span>
            <p className="font-extrabold text-emerald-800">
              Great accuracy! No repeated mistakes noted in this check.
            </p>
          </div>
        )}
      </Card>

      {/* Transparent Algorithm Explainer for Hackathon Judges & Teachers */}
      <Card>
        <details className="group cursor-pointer">
          <summary className="font-black text-ink flex items-center justify-between list-none py-1">
            <span className="flex items-center gap-2">
              <span>⚙️</span> How does LevelBridge calculate this level?
            </span>
            <span className="text-slate-600 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2 border-t border-slate-200 pt-3">
            <p>
              <strong>100% Rule-Based & Offline:</strong> The diagnostic uses a deterministic decision tree starting at Class {user.grade}. Two consecutive correct answers move up a level, while two incorrect answers drop down to check prerequisites.
            </p>
            <p>
              <strong>Open-Source AI Role:</strong> Open-weights AI (Gemma 2B via Ollama) provides contextual story explanations and remedial classroom activities, without altering the transparent, rule-based diagnostic assessment.
            </p>
            <p>
              <strong>Teacher Override:</strong> This check provides a rapid classroom snapshot (~10–12 questions). Teachers can adjust levels anytime in the Teacher tab.
            </p>
          </div>
        </details>
      </Card>

      {/* Retake Action */}
      <div className="text-center pt-2">
        <Btn variant="soft" onClick={goCheck} className="!text-base">
          🔄 Retake {subjectKey} Check
        </Btn>
      </div>

      {/* Student Buddy Modal */}
      {showBuddyModal && (
        <StudentBuddyModal
          user={user}
          result={r}
          onClose={() => setShowBuddyModal(false)}
        />
      )}
    </div>
  );
}
