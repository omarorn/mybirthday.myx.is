/**
 * Quiz Game Component (React + TypeScript)
 * Multi-mode quiz with leaderboards, streaks, and gamification.
 * Extracted from: rusl.myx.is (production)
 *
 * Game Modes:
 * - Timed: {{TIMER_SECONDS}}s per question
 * - Survival: 3 lives, timed
 * - Learning: no timer, learn at your pace
 *
 * Required API endpoints:
 * - GET  {{API_BASE}}/api/quiz/question  → QuizQuestion
 * - POST {{API_BASE}}/api/quiz/answer    → QuizAnswer
 * - POST {{API_BASE}}/api/quiz/score     → void
 * - GET  {{API_BASE}}/api/quiz/leaderboard?mode=X → QuizScore[]
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────
interface QuizProps {
  onClose: () => void;
  apiBase?: string;
  timerSeconds?: number;
}

type GameMode = 'menu' | 'timed' | 'survival' | 'learning';
type GameState = 'playing' | 'feedback' | 'gameover';

interface QuizQuestion {
  id: string;
  item: string;
  imageUrl: string;
  options: Array<{ id: string; label: string; icon: string; color: string }>;
}

interface QuizAnswer {
  correct: boolean;
  correctAnswer: string;
  correctLabel: string;
  correctIcon: string;
  correctColor: string;
  item: string;
  reason: string;
  points: number;
}

interface QuizScore {
  user_hash: string;
  score: number;
  questions: number;
  mode: string;
}

// ─── Component ──────────────────────────────────────────
export function Quiz({ onClose, apiBase = '', timerSeconds = 15 }: QuizProps) {
  const [mode, setMode] = useState<GameMode>('menu');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answer, setAnswer] = useState<QuizAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<QuizScore[]>([]);
  const [streak, setStreak] = useState(0);

  const loadQuestion = useCallback(async () => {
    setIsLoading(true); setError(null); setTimeLeft(timerSeconds);
    try {
      const res = await fetch(`${apiBase}/api/quiz/question`);
      const q = await res.json();
      if (q.error) { setError(q.error); return; }
      setQuestion(q); setAnswer(null); setGameState('playing');
    } catch { setError('Could not load question'); }
    finally { setIsLoading(false); }
  }, [apiBase, timerSeconds]);

  const startGame = useCallback((selectedMode: GameMode) => {
    setMode(selectedMode); setScore(0); setTotalQuestions(0); setLives(3); setStreak(0);
    setGameState('playing'); loadQuestion();
  }, [loadQuestion]);

  const handleAnswer = async (selectedId: string) => {
    if (!question || gameState !== 'playing') return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/quiz/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, answer: selectedId }),
      });
      const result: QuizAnswer = await res.json();
      setAnswer(result); setTotalQuestions(prev => prev + 1);
      if (result.correct) { setScore(prev => prev + result.points + streak * 2); setStreak(prev => prev + 1); }
      else { setStreak(0); if (mode === 'survival') setLives(prev => prev - 1); }
      setGameState('feedback');
    } catch { setError('Error submitting answer'); }
    finally { setIsLoading(false); }
  };

  const handleContinue = () => {
    if (mode === 'survival' && lives <= 0) endGame();
    else loadQuestion();
  };

  const endGame = async () => {
    setGameState('gameover');
    try {
      await fetch(`${apiBase}/api/quiz/score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, questions: totalQuestions, mode }),
      });
      const lb = await fetch(`${apiBase}/api/quiz/leaderboard?mode=${mode}`);
      const data = await lb.json();
      setLeaderboard(data.scores || []);
    } catch { /* ignore */ }
  };

  // Timer
  useEffect(() => {
    if (mode === 'learning' || gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleContinue(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, gameState, timeLeft]);

  // Check game over
  useEffect(() => {
    if (mode === 'survival' && lives <= 0 && gameState === 'feedback') {
      setTimeout(endGame, 2000);
    }
  }, [lives, mode, gameState]);

  // ─── Menu ─────────────────────────────────────────────
  if (mode === 'menu') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-purple-100">
        <header className="bg-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
          <button onClick={onClose} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">Quiz Game</h1>
          <div className="w-8" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">Choose a mode</h2>
          {[
            { mode: 'timed' as GameMode, icon: '⏱️', label: 'Timed', desc: `${timerSeconds}s per question`, colors: 'from-orange-500 to-red-500' },
            { mode: 'survival' as GameMode, icon: '❤️❤️❤️', label: 'Survival', desc: '3 lives', colors: 'from-red-500 to-pink-500' },
            { mode: 'learning' as GameMode, icon: '📚', label: 'Learning', desc: 'No time limit', colors: 'from-green-500 to-teal-500' },
          ].map(m => (
            <button key={m.mode} onClick={() => startGame(m.mode)}
              className={`w-full max-w-xs bg-gradient-to-r ${m.colors} text-white p-6 rounded-2xl shadow-lg active:scale-95 transition-transform`}>
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className="text-xl font-bold">{m.label}</div>
              <div className="text-sm opacity-80">{m.desc}</div>
            </button>
          ))}
        </main>
      </div>
    );
  }

  // ─── Game Over ────────────────────────────────────────
  if (gameState === 'gameover') {
    const accuracy = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-purple-100">
        <header className="bg-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
          <button onClick={() => setMode('menu')} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">Results</h1>
          <div className="w-8" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{accuracy >= 80 ? '🌟' : accuracy >= 50 ? '👍' : '💪'}</div>
            <div className="text-4xl font-bold text-purple-800 mb-2">{score} points</div>
            <div className="text-purple-600">{totalQuestions} questions · {accuracy}% correct</div>
          </div>
          {leaderboard.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
              <h3 className="font-bold text-purple-800 mb-3">Leaderboard</h3>
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                  <span className="font-bold text-purple-600">#{i + 1}</span>
                  <span className="font-bold">{entry.score} pts</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={() => startGame(mode)} className="flex-1 bg-purple-600 text-white p-4 rounded-xl font-bold active:scale-95 transition-transform">Play again</button>
            <button onClick={() => setMode('menu')} className="flex-1 bg-gray-200 text-gray-800 p-4 rounded-xl font-bold active:scale-95 transition-transform">Menu</button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-purple-100">
        <header className="bg-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
          <button onClick={() => setMode('menu')} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">Quiz</h1>
          <div className="w-8" />
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={onClose} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold">Go back</button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Game Screen ──────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-purple-100">
      <header className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setMode('menu')} className="text-xl">✕</button>
          <div className="text-xl font-bold">{score} pts</div>
          {mode !== 'learning' && <div className={`text-xl font-mono ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : ''}`}>{timeLeft}s</div>}
          {mode === 'survival' && <div className="text-xl">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>}
        </div>
        {streak > 1 && <div className="text-center text-yellow-300 text-sm animate-pulse">🔥 {streak} streak!</div>}
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative bg-gray-900 min-h-0">
          {question && (
            <img src={`${apiBase}${question.imageUrl}`} alt="Question" className="absolute inset-0 w-full h-full object-contain" />
          )}
          {gameState === 'feedback' && answer && (
            <div className={`absolute inset-0 flex items-center justify-center ${answer.correct ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
              <div className="text-center text-white p-6">
                <div className="text-6xl mb-4">{answer.correct ? '✅' : '❌'}</div>
                <div className="text-2xl font-bold mb-2">{answer.item}</div>
                <div className="text-lg">{answer.correctIcon} {answer.correctLabel}</div>
                <div className="text-sm opacity-80 max-w-xs">{answer.reason}</div>
                {answer.correct && <div className="mt-4 text-xl font-bold">+{answer.points} pts</div>}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-4 shadow-lg">
          {gameState === 'playing' && question && (
            <>
              <p className="text-center text-gray-600 mb-3 font-medium">
                Where does <span className="text-purple-700 font-bold">{question.item}</span> go?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {question.options.map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)} disabled={isLoading}
                    className="p-3 rounded-xl font-medium text-white active:scale-95 transition-transform disabled:opacity-50"
                    style={{ backgroundColor: opt.color }}>
                    <span className="text-2xl block">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {gameState === 'feedback' && (
            <button onClick={handleContinue}
              className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold active:scale-95 transition-transform">
              {mode === 'survival' && lives <= 0 ? 'See results' : 'Next →'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
