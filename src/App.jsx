import { useEffect, useState } from 'react';
import seed from './data/students.seed.json';
import { SUBJECTS } from './data/index.js';
import { loadAll, saveResult, saveOverride } from './db.js';
import Login from './screens/Login.jsx';
import SubjectHome from './screens/SubjectHome.jsx';
import Student from './screens/Student.jsx';
import Result from './screens/Result.jsx';
import StudentProgress from './screens/StudentProgress.jsx';
import Teacher from './screens/Teacher.jsx';
import Progress from './screens/Progress.jsx';
import { Btn, UserAvatar } from './ui.jsx';
import { AIStatusBadge } from './components/AIComponents.jsx';

// Role-based navigation tabs
const NAV = {
  student: [
    ['home', 'Subjects'],
    ['check', 'Check'],
    ['result', 'My Result'],
    ['progress', 'My Progress'],
  ],
  teacher: [
    ['class', 'My Class'],
    ['progress', 'Progress'],
  ],
};

// Safe retrieval from localStorage for offline session state
const saved = () => {
  try {
    return JSON.parse(localStorage.getItem('lb_user'));
  } catch {
    return null;
  }
};

export default function App() {
  const [user, setUser] = useState(saved); // logged-in profile (stored on device only)
  const [view, setView] = useState(null);
  const [activeSubject, setActiveSubject] = useState('maths');
  const [results, setResults] = useState([]); // checks saved to IndexedDB on this device
  const [overrides, setOverrides] = useState({}); // teacher overrides (persisted to IndexedDB)

  // Load offline data on initial mount
  useEffect(() => {
    loadAll().then((s) => {
      setResults(s.results);
      setOverrides(s.overrides);
    });
  }, []);

  function login(u) {
    localStorage.setItem('lb_user', JSON.stringify(u));
    setUser(u);
    setView(NAV[u.role][0][0]);
  }

  function logout() {
    localStorage.removeItem('lb_user');
    setUser(null);
    setView(null);
  }

  async function onDone(summary, subjectKey = activeSubject) {
    const rec = {
      name: user.name,
      grade: user.grade,
      band: user.band,
      subject: subjectKey,
      date: new Date().toISOString().slice(0, 10),
      level: summary.level,
      summary,
    };
    await saveResult(rec);
    setResults((r) => [...r, rec]);
    setActiveSubject(subjectKey);
    setView('result');
  }

  function onOverride(id, subject, level) {
    setOverrides((o) => ({ ...o, [`${id}_${subject}`]: level, [id]: level }));
    saveOverride(id, subject, level);
  }

  if (!user) return <Login onLogin={login} />;

  const tab = view || NAV[user.role][0][0];
  const currentSubjectConfig = SUBJECTS[activeSubject] || SUBJECTS.maths;
  const currentSubjectData = currentSubjectConfig.data;

  // Most recent diagnostic results for active student per subject
  const myResultsBySubject = {
    maths: [...results].reverse().find((r) => r.name === user.name && (r.subject || 'maths') === 'maths')?.summary || null,
    english: [...results].reverse().find((r) => r.name === user.name && r.subject === 'english')?.summary || null,
    science: [...results].reverse().find((r) => r.name === user.name && r.subject === 'science')?.summary || null,
  };

  const activeResult = myResultsBySubject[activeSubject];

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:p-6 min-h-screen flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              Level<span className="text-sky">Bridge</span>
            </span>
            <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              Offline
            </span>
            <AIStatusBadge />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 ring-1 ring-slate-200 shadow-xs">
              <UserAvatar user={user} />
              <div className="flex flex-col text-left">
                <span className="max-w-[7rem] sm:max-w-[10rem] truncate text-xs sm:text-sm font-extrabold text-ink leading-tight">
                  {user.name}
                </span>
                {user.grade && (
                  <span className="text-2xs font-bold text-slate-500">
                    Class {user.grade}
                  </span>
                )}
              </div>
            </span>
            <Btn
              variant="soft"
              className="!min-h-[38px] !px-3 !py-1.5 !text-sm"
              onClick={logout}
              aria-label="Log out of session"
            >
              Log out
            </Btn>
          </div>
        </header>

        {/* Role-based navigation buttons */}
        <nav className="mb-5 flex gap-2 print:hidden" aria-label="Main Navigation">
          {NAV[user.role].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              aria-current={tab === k ? 'page' : undefined}
              className={`flex-1 rounded-2xl py-3 px-2 text-center text-sm sm:text-base font-black transition-all ${
                tab === k
                  ? 'bg-ink text-white shadow-md'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Screen content */}
        <main>
          {user.role === 'student' && tab === 'home' && (
            <SubjectHome
              user={user}
              latestResults={myResultsBySubject}
              onSelectSubject={(subj) => {
                setActiveSubject(subj);
                setView('check');
              }}
            />
          )}

          {user.role === 'student' && tab === 'check' && (
            <Student
              data={currentSubjectData}
              subjectKey={activeSubject}
              user={user}
              onDone={onDone}
              onBack={() => setView('home')}
            />
          )}

          {user.role === 'student' && tab === 'result' && (
            <Result
              data={currentSubjectData}
              subjectKey={activeSubject}
              user={user}
              result={activeResult}
              goCheck={() => setView('check')}
            />
          )}

          {user.role === 'student' && tab === 'progress' && (
            <StudentProgress
              user={user}
              latestResults={myResultsBySubject}
              onSelectSubject={(subj) => {
                setActiveSubject(subj);
                setView('check');
              }}
            />
          )}

          {user.role === 'teacher' && tab === 'class' && (
            <Teacher
              seed={seed}
              results={results}
              overrides={overrides}
              onOverride={onOverride}
            />
          )}

          {user.role === 'teacher' && tab === 'progress' && (
            <Progress seed={seed} />
          )}
        </main>
      </div>

      {/* Footer reassurance */}
      <footer className="mt-8 text-center text-xs text-slate-500 print:hidden py-2 border-t border-slate-200/60">
        LevelBridge • 100% Offline • Open Source • Rule-Based Adaptive Diagnostic • Maths, English & Science
      </footer>
    </div>
  );
}
