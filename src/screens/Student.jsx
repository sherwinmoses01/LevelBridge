import { useState } from 'react';
import { createSession, nextQuestion, submitAnswer, summarize } from '../lib/diagnostic.js';
import { Btn, Card, QuizProgress, CelebrationBanner, UserAvatar } from '../ui.jsx';

// Vibrant colors for primary answer buttons
const PRIMARY_OPTION_THEMES = [
  { bg: 'bg-[#0284C7]', ring: 'hover:ring-[#0284C7]', label: 'A' }, // Sky
  { bg: 'bg-[#D97706]', ring: 'hover:ring-[#D97706]', label: 'B' }, // Amber
  { bg: 'bg-[#7C3AED]', ring: 'hover:ring-[#7C3AED]', label: 'C' }, // Purple
  { bg: 'bg-[#16A34A]', ring: 'hover:ring-[#16A34A]', label: 'D' }, // Mint
];

// Teen style border colors for left edge
const TEEN_BORDER_COLORS = [
  'border-l-[#0284C7]',
  'border-l-[#D97706]',
  'border-l-[#7C3AED]',
  'border-l-[#16A34A]',
];

export default function Student({ data, subjectKey = 'maths', user, onDone, onBack }) {
  const [session, setSession] = useState(null);
  const [fb, setFb] = useState(null); // feedback on the selected answer
  const [stars, setStars] = useState(0); // stars/points collected by the student
  const [showCelebration, setShowCelebration] = useState(false);

  const isTeen = user?.band === '6-10';
  // Student starts check directly at their enrolled class level (Class 3 to 10)
  const startLevel = user?.grade || (isTeen ? 7 : 3);

  // Pre-quiz welcome screen
  if (!session) {
    return (
      <Card className="text-center py-8">
        {isTeen ? (
          <div className="flex justify-center mb-4">
            <UserAvatar user={user} className="!h-20 !w-20 !text-3xl shadow-sm" />
          </div>
        ) : (
          <div className="text-7xl sm:text-8xl mb-3 pop" aria-hidden="true">
            {user.avatar || '🦊'}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          {isTeen ? `Ready, ${user.name}?` : `Hi, ${user.name}! 👋`}
        </h1>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
          Subject: <span className="font-extrabold capitalize text-ink">{subjectKey}</span> • Starting at Class {startLevel}
        </div>

        <p className="mx-auto my-4 max-w-md text-base sm:text-lg text-slate-600">
          {isTeen
            ? 'A quick diagnostic check (~10–12 questions). Every question adapts to your reasoning to find your real mastery level.'
            : 'Ready for a quick adventure? Mistakes are completely fine—they help your teacher know exactly how to guide you!'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onBack && (
            <Btn variant="soft" onClick={onBack} className="!px-6 !py-4 text-base">
              ← Change Subject
            </Btn>
          )}
          <Btn
            variant={isTeen ? 'pri' : 'go'}
            onClick={() => {
              setSession(createSession(data, { startLevel, maxQuestions: 12 }));
              setStars(0);
              setFb(null);
              setShowCelebration(false);
            }}
            className="!px-8 !py-4 !text-xl shadow-md pop"
          >
            {isTeen ? 'Start Check ➔' : 'Start Check 🚀'}
          </Btn>
        </div>
      </Card>
    );
  }

  // The adaptive diagnostic engine selects the next question (answers are NEVER revealed in q)
  const q = nextQuestion(session);
  const answeredCount = session.answers.length;

  function handleAnswer(choice) {
    if (fb) return; // Prevent double taps
    // Evaluate answer with deterministic rule-based diagnostic engine
    const r = submitAnswer(session, q.id, choice);
    if (r.correct) {
      setStars((s) => s + 1);
    }
    setFb(r);
    setSession({ ...session }); // Trigger state update
  }

  function handleNext() {
    if (fb && fb.done) {
      setShowCelebration(true);
    } else {
      setFb(null);
    }
  }

  function finishQuiz() {
    // Generate final diagnostic summary and pass to parent
    const summary = summarize(session);
    onDone(summary, subjectKey);
  }

  // Check complete celebration screen
  if (showCelebration) {
    return (
      <CelebrationBanner
        stars={stars}
        isTeen={isTeen}
        onContinue={finishQuiz}
      />
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      {/* Quiz Progress Bar & Counter */}
      <QuizProgress
        current={Math.min(12, answeredCount + (q ? 1 : 0))}
        total={12}
        stars={stars}
        isTeen={isTeen}
      />

      {/* Reading Passage (e.g. for English Comprehension from Level 3 up) */}
      {q && q.passage && (
        <div className="mb-5 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 text-left text-slate-800 text-sm sm:text-base leading-relaxed shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5">
            <span>📖</span> Reading Passage:
          </div>
          <p className="italic font-medium">{q.passage}</p>
        </div>
      )}

      {/* Question Prompt Area */}
      <div className="my-5 text-center">
        <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-1">
          {isTeen ? 'Select your answer' : 'Think carefully & tap your answer'}
        </p>
        <div className="min-h-[80px] flex items-center justify-center">
          <h2
            className={`font-black tracking-tight text-ink ${
              isTeen ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {q ? q.prompt : 'All questions answered!'}
          </h2>
        </div>
      </div>

      {/* Answer Buttons (shown only before answering - never reveal answer beforehand) */}
      {!fb && q && (
        isTeen ? (
          /* Teen Style: White cards with colored left edge and letter chip A-D */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {q.options.map((option, idx) => (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswer(option)}
                className={`flex items-center justify-between rounded-xl p-3.5 sm:p-4 text-left bg-white border border-slate-200 border-l-4 ${
                  TEEN_BORDER_COLORS[idx % TEEN_BORDER_COLORS.length]
                } shadow-xs hover:bg-slate-50/90 hover:border-slate-300 transition-all active:scale-[0.99]`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-black text-sm">
                  {['A', 'B', 'C', 'D'][idx % 4]}
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-normal text-right flex-1 pr-2">
                  {option}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Primary Style: Big solid color blocks with A-D pill */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {q.options.map((option, idx) => {
              const theme = PRIMARY_OPTION_THEMES[idx % PRIMARY_OPTION_THEMES.length];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  className={`flex items-center justify-between rounded-2xl p-4 sm:p-5 text-left text-white shadow-md transition-all active:scale-[0.98] ${theme.bg} hover:brightness-105`}
                >
                  <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 text-lg sm:text-xl font-black">
                    {theme.label}
                  </span>
                  <span className="text-xl sm:text-2xl font-black tracking-wide text-right flex-1 pr-2">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* Immediate Feedback after answering */}
      {fb && (
        <div
          role="status"
          className={`pop mt-4 rounded-3xl p-5 border-2 ${
            fb.correct
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-orange-50 border-orange-300 text-orange-950'
          }`}
        >
          {fb.correct ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl" aria-hidden="true">
                {isTeen ? '✓' : '⭐'}
              </span>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-700">
                  {isTeen ? 'Correct. Well reasoned.' : "Awesome job! That's correct!"}
                </p>
                <p className="text-sm font-semibold text-emerald-800">
                  {isTeen ? 'Great step forward. Ready for the next?' : 'You earned a star! Keep up the momentum.'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">
                  {isTeen ? '📌' : '💡'}
                </span>
                <p className="text-lg sm:text-xl font-black text-orange-800">
                  {isTeen ? 'Good attempt. Check this concept:' : "Good try! Let's learn from this"}
                </p>
              </div>
              {fb.explanation && (
                <div className="mt-2 rounded-2xl bg-white/80 p-3.5 text-sm sm:text-base border border-orange-200">
                  <span className="font-extrabold text-orange-900 block mb-0.5">
                    {fb.explanation.label}
                  </span>
                  <span className="text-slate-700">
                    {fb.explanation.explanation}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <Btn
              variant={fb.done ? 'sun' : 'pri'}
              className="w-full !text-lg !py-3.5 shadow-sm"
              onClick={handleNext}
            >
              {fb.done
                ? (isTeen ? 'Complete Check ➔' : 'Complete Check 🏆')
                : 'Next Question ➔'}
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
