import { useState } from 'react';
import { AVATARS, Btn, Card, LV } from '../ui.jsx';

// DEMO ONLY: Hardcoded PIN for offline hackathon demonstration.
// Stored locally on device; this is a role switcher, not a secure authentication system.
const TEACHER_PIN = '1234';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [grade, setGrade] = useState(4); // Class 3 to 10
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const band = grade <= 5 ? '3-5' : '6-10';

  function handleSubmit(e) {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      return setErr(
        role === 'student'
          ? 'Please enter your name or student ID to start!'
          : 'Please enter your name to open the teacher dashboard.'
      );
    }
    if (role === 'teacher' && pin !== TEACHER_PIN) {
      return setErr('Incorrect PIN. The demo PIN is 1234.');
    }
    setErr('');

    // For Class 6-10, teen style uses the initial letter in a coloured circle rather than animal emojis
    const finalAvatar =
      role === 'teacher'
        ? '👩‍🏫'
        : band === '6-10'
        ? cleanName[0].toUpperCase()
        : avatar;

    onLogin({
      role,
      name: cleanName,
      grade: role === 'student' ? grade : null,
      band: role === 'student' ? band : null,
      avatar: finalAvatar,
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        {/* Colourful level indicator line representing the 10 maths levels */}
        <div
          className="mb-4 flex justify-center gap-1 sm:gap-1.5 flex-wrap"
          aria-label="Skill progression indicator (Class 1-10)"
        >
          {LV.slice(1).map((color, idx) => (
            <span
              key={idx + 1}
              className="h-2 w-6 sm:w-7 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title={`Class ${idx + 1}`}
            />
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
          Level<span className="text-sky">Bridge</span>
        </h1>
        <p className="mt-1 text-base sm:text-lg font-medium text-slate-600">
          Find your real level. Strengthen foundations.
        </p>
      </div>

      <Card className="shadow-md border border-slate-200">
        {/* Role Toggle */}
        <div
          role="tablist"
          aria-label="Choose your role"
          className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5"
        >
          <button
            role="tab"
            aria-selected={role === 'student'}
            type="button"
            onClick={() => {
              setRole('student');
              setErr('');
            }}
            className={`rounded-xl py-3 text-base font-extrabold transition-all ${
              role === 'student'
                ? 'bg-white text-ink shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🎒 I'm a student
          </button>
          <button
            role="tab"
            aria-selected={role === 'teacher'}
            type="button"
            onClick={() => {
              setRole('teacher');
              setErr('');
            }}
            className={`rounded-xl py-3 text-base font-extrabold transition-all ${
              role === 'teacher'
                ? 'bg-white text-ink shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👩‍🏫 I'm a teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {role === 'student' && (
            /* Class Picker: Class 3 to Class 10 */
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-black text-ink">
                  Select your class
                </label>
                <span className="text-xs font-bold text-slate-500">
                  {grade <= 5 ? 'Primary (3–5)' : 'Secondary (6–10)'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((cls) => {
                  const isSelected = grade === cls;
                  const isTeenClass = cls >= 6;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setGrade(cls)}
                      className={`rounded-xl py-2.5 text-center transition-all ${
                        isSelected
                          ? isTeenClass
                            ? 'bg-indigo-600 text-white font-black shadow-sm ring-2 ring-indigo-400'
                            : 'bg-sky text-white font-black shadow-sm ring-2 ring-sky-300'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold border border-slate-200'
                      }`}
                    >
                      <div className="text-sm sm:text-base leading-none">Class {cls}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name / ID Input */}
          <div className="mb-4">
            <label htmlFor="user-name" className="block text-sm font-black text-ink mb-1.5">
              {role === 'student' ? 'Your name or Student ID' : 'Teacher name'}
            </label>
            <input
              id="user-name"
              type="text"
              className="w-full rounded-2xl border-2 border-slate-300 p-3.5 text-base sm:text-lg font-bold text-ink placeholder:font-normal placeholder:text-slate-400 focus:border-sky focus:outline-none"
              placeholder={role === 'student' ? 'e.g. Maya or Student #12' : 'e.g. Ms. Sharma'}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (err) setErr('');
              }}
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* Student Avatar Selector for Class 3-5 or Initial Badge preview for Class 6-10 */}
          {role === 'student' ? (
            band === '3-5' ? (
              <div className="mb-4">
                <label className="block text-sm font-black text-ink mb-1.5">
                  Pick your buddy
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      aria-label={`Select buddy ${a}`}
                      className={`flex h-12 sm:h-14 w-full items-center justify-center rounded-2xl text-2xl sm:text-3xl transition-transform active:scale-95 ${
                        avatar === a
                          ? 'bg-sun ring-4 ring-ink shadow-sm scale-105'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  Tip: You can use a roll number or nickname instead of your full name.
                </p>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-black text-white text-lg">
                  {(name.trim()[0] || 'S').toUpperCase()}
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-ink">Secondary Diagnostic Mode:</span> Check starts at Class {grade}.
                </div>
              </div>
            )
          ) : (
            /* Teacher PIN Input */
            <div className="mb-4">
              <label htmlFor="teacher-pin" className="block text-sm font-black text-ink mb-1.5">
                Teacher PIN
              </label>
              <input
                id="teacher-pin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                className="w-full rounded-2xl border-2 border-slate-300 p-3.5 text-base sm:text-lg font-bold text-ink placeholder:font-normal placeholder:text-slate-400 focus:border-sky focus:outline-none"
                placeholder="Enter demo PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (err) setErr('');
                }}
              />
              <p className="mt-1.5 text-xs font-semibold text-slate-500">
                Demo PIN: <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-ink font-mono font-bold">1234</code>
              </p>
            </div>
          )}

          {/* Error Message */}
          {err && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral border border-coral/30"
            >
              ⚠️ {err}
            </div>
          )}

          {/* Submit Button */}
          <Btn
            type="submit"
            variant={role === 'student' ? 'go' : 'pri'}
            className="w-full !text-base sm:!text-lg !py-3.5 shadow-md"
          >
            {role === 'student' ? 'Choose Subject ➔' : 'Open My Class ➔'}
          </Btn>
        </form>

        {/* Reassurance Disclaimer */}
        <p className="mt-4 text-center text-xs text-slate-400 font-medium">
          Demo login stored on this device only. Starter content to be reviewed by a teacher.
        </p>
      </Card>
    </main>
  );
}
