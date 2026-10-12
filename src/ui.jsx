// Shared building blocks so every screen looks and behaves consistently.
// Supports three subject palettes (Maths blue, English rose, Science green)
// and two cohesive styles: Primary (Class 3-5, tactile & playful) and Teen (Class 6-10, focused & clear).

export const SUBJECT_PALETTES = {
  maths: [
    '#64748B', // L0
    '#7DD3FC', // L1 - Sky 300
    '#38BDF8', // L2 - Sky 400
    '#0EA5E9', // L3 - Sky 500
    '#0284C7', // L4 - Sky 600
    '#0369A1', // L5 - Sky 700
    '#2563EB', // L6 - Blue 600
    '#1D4ED8', // L7 - Blue 700
    '#1E40AF', // L8 - Blue 800
    '#1E3A8A', // L9 - Blue 900
    '#0F172A', // L10 - Slate 900
  ],
  english: [
    '#64748B', // L0
    '#FDA4AF', // L1 - Rose 300
    '#FB7185', // L2 - Rose 400
    '#F43F5E', // L3 - Rose 500
    '#E11D48', // L4 - Rose 600
    '#BE123C', // L5 - Rose 700
    '#9F1239', // L6 - Rose 800
    '#881337', // L7 - Rose 900
    '#701A75', // L8 - Fuchsia 900
    '#581C87', // L9 - Purple 900
    '#3B0764', // L10 - Purple 950
  ],
  science: [
    '#64748B', // L0
    '#6EE7B7', // L1 - Emerald 300
    '#34D399', // L2 - Emerald 400
    '#10B981', // L3 - Emerald 500
    '#059669', // L4 - Emerald 600
    '#047857', // L5 - Emerald 700
    '#065F46', // L6 - Emerald 800
    '#064E3B', // L7 - Emerald 900
    '#022C22', // L8 - Emerald 950
    '#14532D', // L9 - Green 900
    '#052E16', // L10 - Green 950
  ],
};

export const getSubjectPalette = (subject = 'maths') =>
  SUBJECT_PALETTES[subject] || SUBJECT_PALETTES.maths;

// Backward-compatible default palette
export const LV = SUBJECT_PALETTES.maths;

export const AVATARS = ['🦊', '🐯', '🐼', '🦁', '🐧', '🐢'];

/**
 * Avatar rendering: Animal emoji for Class 3-5, initial in coloured circle for Class 6-10
 */
export const UserAvatar = ({ user, className = '' }) => {
  if (user?.band === '6-10') {
    const initial = (user.name || 'S').trim()[0].toUpperCase();
    return (
      <span
        aria-label={`Student initial ${initial}`}
        className={`inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-600 font-black text-white text-sm shadow-xs ${className}`}
      >
        {initial}
      </span>
    );
  }
  return (
    <span className={`text-xl sm:text-2xl ${className}`} aria-hidden="true">
      {user?.avatar || '🦊'}
    </span>
  );
};

export const Card = ({ children, className = '', id }) => (
  <section
    id={id}
    className={`mb-4 rounded-3xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200 transition-all ${className}`}
  >
    {children}
  </section>
);

export const H2 = ({ children, className = '' }) => (
  <h2 className={`mb-3 text-xl font-extrabold tracking-tight text-ink flex items-center gap-2 ${className}`}>
    {children}
  </h2>
);

const VARIANTS = {
  pri: 'bg-ink text-white hover:bg-slate-800 active:scale-[0.98] shadow-sm',
  soft: 'bg-white text-ink ring-2 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 active:scale-[0.98]',
  go: 'bg-mint text-white hover:brightness-95 active:scale-[0.98] shadow-sm',
  sun: 'bg-sun text-ink hover:brightness-95 active:scale-[0.98] shadow-sm',
  coral: 'bg-coral text-white hover:brightness-95 active:scale-[0.98] shadow-sm',
};

export const Btn = ({ variant = 'pri', className = '', type = 'button', children, ...p }) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center min-h-[48px] rounded-2xl px-5 py-3 text-base sm:text-lg font-bold transition-all focus-visible:ring-4 focus-visible:ring-sky/40 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
    {...p}
  >
    {children}
  </button>
);

export const LevelBadge = ({ level, subject = 'maths', big }) => {
  const palette = getSubjectPalette(subject);
  return (
    <span
      aria-label={`Level ${level}`}
      className={`inline-flex items-center justify-center font-black text-white shadow-sm transition-transform ${
        big ? 'h-20 w-20 text-4xl rounded-3xl pop' : 'h-8 w-8 text-base rounded-full'
      }`}
      style={{ backgroundColor: palette[level] ?? '#64748B' }}
    >
      {level}
    </span>
  );
};

/**
 * Skill ladder showing 10 rungs labelled "Class N" in four groups:
 * - High school (Class 9-10)
 * - Middle school (Class 6-8)
 * - Primary school (Class 3-5)
 * - Foundations (Class 1-2)
 * Supports full mode and compact mode (for "My Progress" tab).
 */
export function Ladder({ levels, here, goal, subject = 'maths', compact = false }) {
  const palette = getSubjectPalette(subject);
  const sorted = [...levels].sort((a, b) => b.id - a.id); // Level 10 down to 1

  const groups = [
    { title: 'High school (Class 9–10)', icon: '🏛️', rungs: sorted.filter((l) => l.id >= 9) },
    { title: 'Middle school (Class 6–8)', icon: '📘', rungs: sorted.filter((l) => l.id >= 6 && l.id <= 8) },
    { title: 'Primary school (Class 3–5)', icon: '🎒', rungs: sorted.filter((l) => l.id >= 3 && l.id <= 5) },
    { title: 'Foundations (Class 1–2)', icon: '🌱', rungs: sorted.filter((l) => l.id <= 2) },
  ];

  if (compact) {
    return (
      <div className="space-y-1.5 py-1">
        {sorted.map((l) => {
          const isHere = l.id === here;
          const isMastered = l.id < here;
          return (
            <div
              key={l.id}
              className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all ${
                isHere
                  ? 'bg-ink text-white font-black shadow-xs'
                  : isMastered
                  ? 'bg-slate-100 text-slate-700 font-bold'
                  : 'bg-white text-slate-500 font-medium border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: palette[l.id] }}
                />
                <span className="font-bold shrink-0">{l.classLabel || `Class ${l.id}`}</span>
                <span className="truncate text-2xs opacity-80">{l.name}</span>
              </div>
              <div>
                {isHere && (
                  <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-2xs uppercase tracking-wider">
                    Current
                  </span>
                )}
                {isMastered && <span className="text-emerald-700 font-black">✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const renderRung = (l) => {
    const isHere = l.id === here;
    const isGoal = l.id === goal;
    const isMastered = l.id < here;

    return (
      <li
        key={l.id}
        className={`relative flex items-center gap-3 sm:gap-4 rounded-2xl p-3 sm:p-3.5 transition-all ${
          isHere
            ? 'bg-slate-50 ring-2 ring-ink shadow-md scale-[1.01]'
            : isGoal
            ? 'bg-amber-50/70 ring-2 ring-amber-400'
            : 'bg-white hover:bg-slate-50/60 ring-1 ring-slate-200/80'
        }`}
      >
        <div className="relative z-10 flex-shrink-0">
          <LevelBadge level={l.id} subject={subject} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-base sm:text-lg font-bold truncate ${
                isHere || isMastered ? 'text-ink' : 'text-slate-600'
              }`}
            >
              {l.name}
            </span>
            {isMastered && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800"
                aria-label="Mastered"
              >
                ✓ Mastered
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {l.classLabel || `Class ${l.id}`} (Level {l.id})
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {isHere && (
            <span className="pop inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs sm:text-sm font-black text-white shadow-sm">
              📍 You are here
            </span>
          )}
          {isGoal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sun px-3 py-1.5 text-xs sm:text-sm font-black text-ink shadow-sm">
              ⭐ Next goal
            </span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="relative py-2">
      {/* Visual ladder guide */}
      <div className="absolute left-6 sm:left-7 top-4 bottom-4 w-1 bg-slate-200 rounded-full" aria-hidden="true" />

      {groups.map((grp, idx) => (
        <div key={grp.title} className={idx > 0 ? 'mt-4' : ''}>
          <div className="mb-2 pl-2 text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <span>{grp.icon}</span> {grp.title}
          </div>
          <ol className="relative space-y-2" aria-label={grp.title}>
            {grp.rungs.map(renderRung)}
          </ol>
        </div>
      ))}
    </div>
  );
}

export const Stat = ({ value, label, sublabel, icon }) => (
  <div className="flex-1 rounded-2xl bg-white p-3 sm:p-4 text-center shadow-sm ring-1 ring-slate-200">
    {icon && <div className="text-xl sm:text-2xl mb-1">{icon}</div>}
    <div className="text-2xl sm:text-3xl font-black text-ink">{value}</div>
    <div className="text-xs sm:text-sm font-bold text-slate-600">{label}</div>
    {sublabel && <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>}
  </div>
);

// Quiz Progress Bar with visual steps and animated fill
export const QuizProgress = ({ current, total = 12, stars, isTeen = false }) => {
  const percent = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="mb-5 rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-ink">
          Question <span className="text-sky font-extrabold">{current}</span> of ~{total}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-900 shadow-xs">
          <span className="text-base">{isTeen ? '🎯' : '⭐'}</span> {stars} {isTeen ? 'points' : stars === 1 ? 'star' : 'stars'}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="h-full rounded-full bg-sky transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Celebration component for when the student completes the check
export const CelebrationBanner = ({ stars, isTeen = false, onContinue }) => (
  <div className="pop my-4 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 p-6 text-center ring-2 ring-sun/70 shadow-lg">
    <div className="text-5xl sm:text-6xl mb-2 bounce-slow" aria-hidden="true">
      {isTeen ? '🎓 🎯 ✨' : '🎉 🌟 🏆'}
    </div>
    <h2 className="text-2xl sm:text-3xl font-black text-ink">
      Check Complete!
    </h2>
    <p className="mt-1 text-base text-slate-700 font-medium">
      {isTeen
        ? `Great focus! You completed your diagnostic check with ${stars} correct steps.`
        : `Super effort! You collected ${stars} ${stars === 1 ? 'star' : 'stars'} today.`}
    </p>
    <div className="mt-5">
      <Btn variant="go" onClick={onContinue} className="w-full sm:w-auto px-8 !text-lg shadow-md">
        See my result ➔
      </Btn>
    </div>
  </div>
);
