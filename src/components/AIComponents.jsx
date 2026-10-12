import { useState, useEffect } from 'react';
import { checkOllamaStatus, getRemedialActivities, askStudentBuddy } from '../lib/ai.js';
import { Btn, Card, H2 } from '../ui.jsx';

/**
 * Header AI Status indicator badge and setup drawer
 */
export function AIStatusBadge() {
  const [status, setStatus] = useState({ connected: false, activeModel: 'gemma:2b' });
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    const s = await checkOllamaStatus();
    setStatus(s);
    setChecking(false);
  }

  useEffect(() => {
    check();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xs border"
        style={{
          backgroundColor: status.connected ? '#ECFDF5' : '#F1F5F9',
          borderColor: status.connected ? '#A7F3D0' : '#CBD5E1',
          color: status.connected ? '#065F46' : '#334155',
        }}
        title="Open-Source AI (Ollama / Gemma) Configuration"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          }`}
        />
        <span>{status.connected ? `Ollama (${status.activeModel})` : 'Open AI: Gemma'}</span>
      </button>

      {/* Connection & Setup Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-black text-ink flex items-center gap-2">
                <span>🤖</span> Open-Source AI Integration
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              LevelBridge supports 100% offline open-source foundation models (like Google’s <strong>Gemma 2B</strong> or Meta’s Llama) running locally via <strong>Ollama</strong>.
            </p>

            <div
              className={`rounded-2xl p-4 mb-4 border ${
                status.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm">Status:</span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    status.connected
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {status.connected ? '🟢 Connected to Ollama' : '⚡ Local Fallback Active'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-600">
                Endpoint: http://localhost:11434
              </div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">
                Model: {status.activeModel}
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/70 p-3.5 mb-4 text-xs text-amber-900 border border-amber-200">
              <p className="font-bold mb-1">💡 How to run Gemma locally on this PC:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Download Ollama for Windows from <code>ollama.com</code></li>
                <li>
                  Open terminal and run:
                  <div className="my-1 font-mono font-bold bg-white p-1.5 rounded border border-amber-300 select-all">
                    ollama run gemma:2b
                  </div>
                </li>
                <li>Click "Check Connection" below!</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Btn
                variant="pri"
                className="flex-1 !text-sm !py-2.5"
                disabled={checking}
                onClick={check}
              >
                {checking ? 'Checking...' : '🔄 Check Connection'}
              </Btn>
              <Btn
                variant="soft"
                className="!text-sm !py-2.5"
                onClick={() => setOpen(false)}
              >
                Close
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Remedial Lesson Activity Modal for Teachers
 */
export function RemedialAIModal({ group, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    getRemedialActivities({
      groupName: group.name,
      level: group.level,
      levelName: group.levelName,
      mistakes: group.mistakes || [],
    }).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [group]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky">
              Gemma Open-Source Co-Pilot
            </span>
            <h3 className="text-xl font-black text-ink">
              Remedial Activities for {group.name}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Level {group.level}: {group.levelName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky border-t-transparent mb-3" />
            <p className="text-sm font-bold text-slate-700">
              Generating remedial activities with open-source AI...
            </p>
            <p className="text-xs text-slate-400 mt-1">Gemma 2B Local Engine</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span>Source: <strong>{data.model}</strong></span>
              <span>{data.source === 'ollama' ? '🟢 Live Local Ollama' : '⚡ Local Pedagogical Engine'}</span>
            </div>

            {data.activities ? (
              <div className="space-y-3">
                {data.activities.map((act, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white text-xs font-black">
                        {i + 1}
                      </span>
                      <h4 className="font-black text-ink text-sm sm:text-base">{act.title}</h4>
                    </div>
                    <p className="text-xs font-bold text-amber-800 mb-1.5">
                      📦 Materials: {act.materials}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {act.steps}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {data.text}
              </div>
            )}

            <div className="mt-5 flex gap-2 pt-2 border-t border-slate-200">
              <Btn variant="pri" className="w-full !text-sm !py-2.5" onClick={onClose}>
                Done & Apply to Class
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Child-Friendly AI Buddy Modal for Students
 */
export function StudentBuddyModal({ user, result, onClose }) {
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [question, setQuestion] = useState('Why is this skill important?');

  const level = result.rootGap != null ? result.rootGap : result.level;
  const levelName = result.rootGap != null ? result.rootGapName : result.levelName;

  function ask(customQ) {
    setLoading(true);
    const q = customQ || question;
    askStudentBuddy({
      avatar: user.avatar,
      childName: user.name,
      level,
      levelName,
      question: q,
    }).then((res) => {
      setReply(res.reply);
      setLoading(false);
    });
  }

  useEffect(() => {
    ask('Why is this skill important?');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl" aria-hidden="true">{user.avatar}</span>
            <div>
              <h3 className="text-lg font-black text-ink">{user.name}’s Buddy</h3>
              <p className="text-xs text-slate-500 font-bold">Local Open AI Helper</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Level focus */}
        <div className="mb-3 rounded-2xl bg-amber-50 p-3 text-xs border border-amber-200">
          <span className="font-extrabold text-amber-900">Talking about:</span>{' '}
          <span className="font-bold text-slate-700">Level {level} ({levelName})</span>
        </div>

        {/* AI Buddy response */}
        <div className="min-h-[120px] rounded-2xl bg-slate-50 p-4 border border-slate-200 flex flex-col justify-center">
          {loading ? (
            <div className="text-center py-4">
              <span className="inline-block text-2xl animate-bounce">💬</span>
              <p className="text-xs font-bold text-slate-500 mt-2">
                Your buddy is thinking...
              </p>
            </div>
          ) : (
            <div className="pop">
              <p className="text-sm sm:text-base font-bold text-ink leading-relaxed">
                {reply}
              </p>
            </div>
          )}
        </div>

        {/* Quick prompt buttons for kids */}
        <div className="mt-4">
          <p className="text-xs font-extrabold text-slate-600 mb-2">Ask another question:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Give me a fun tip! 🌟',
              'Tell a story with mangoes! 🥭',
              'Why do we do this step? 🤔',
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => {
                  setQuestion(promptText);
                  ask(promptText);
                }}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-ink transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Btn variant="go" className="w-full !text-sm !py-2.5" onClick={onClose}>
            Back to my result ➔
          </Btn>
        </div>
      </div>
    </div>
  );
}
