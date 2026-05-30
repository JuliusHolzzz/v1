import { useEffect, useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { getRandomPair } from '../lib/articlePairs';
import { Loader2, RefreshCw, ArrowRight, Globe } from 'lucide-react';

export const BriefingScreen = () => {
  const { setScreen, difficulty, setFromArticle, setToArticle, settings } = useGameState();
  const [loading, setLoading] = useState(false);
  const [pair, setPair] = useState<{ from: string; to: string } | null>(null);

  const loadPair = useCallback(() => {
    setLoading(true);
    // Pick a curated pair — guaranteed to be navigable
    const chosen = getRandomPair(difficulty);
    setPair(chosen);
    setFromArticle(chosen.from);
    setToArticle(chosen.to);
    setLoading(false);
  }, [difficulty, setFromArticle, setToArticle]);

  useEffect(() => {
    loadPair();
  }, [loadPair]);

  const diffBadge = {
    EASY:   { label: 'EASY',   cls: 'text-green-400 border-green-400/40 bg-green-400/5' },
    MEDIUM: { label: 'MEDIUM', cls: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/5' },
    HARD:   { label: 'HARD',   cls: 'text-red-400 border-red-400/40 bg-red-400/5' },
  }[difficulty] ?? { label: difficulty, cls: 'text-white border-white/20' };

  const lang = settings.language === 'EN' ? 'EN' : 'DE';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-4 animate-in zoom-in-95 overflow-y-auto pb-24">
      {/* Top badges */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="flex items-center gap-1 text-[9px] text-white/40 border border-white/20 px-2 py-1">
          <Globe size={10} />
          {lang} WIKIPEDIA
        </span>
        <span className={`text-[9px] border px-2 py-1 ${diffBadge.cls}`}>
          {diffBadge.label}
        </span>
      </div>

      <h2 className="text-2xl font-pixel mb-2">MISSION BRIEFING</h2>
      <p className="text-[10px] text-white/40 mb-10">Your race. Your path. Click only the blue links.</p>

      <div className="w-full max-w-xl border border-white/20 bg-white/5 p-8 flex flex-col items-center gap-6 relative">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-[10px] animate-pulse">SELECTING TARGETS...</span>
          </div>
        ) : pair ? (
          <>
            <div className="text-center w-full">
              <div className="text-[9px] text-white/40 mb-2 uppercase tracking-widest">Start</div>
              <div className="text-xl sm:text-2xl font-pixel text-blue-400 break-words leading-relaxed">
                {pair.from}
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/30">
              <div className="h-px w-16 bg-white/20" />
              <ArrowRight size={18} className="text-white/50" />
              <div className="h-px w-16 bg-white/20" />
            </div>

            <div className="text-center w-full">
              <div className="text-[9px] text-white/40 mb-2 uppercase tracking-widest">Target</div>
              <div className="text-xl sm:text-2xl font-pixel text-green-400 break-words leading-relaxed">
                {pair.to}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-10 flex gap-4 items-center">
        <button onClick={() => setScreen('sp_mode')} className="pixel-btn text-sm">BACK</button>
        <button
          onClick={loadPair}
          disabled={loading}
          className="pixel-btn !p-3 text-white/60 hover:text-white disabled:opacity-30"
          title="Get new pair"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => setScreen('game')}
          disabled={loading || !pair}
          className="pixel-btn text-sm bg-white text-black hover:bg-white/90 disabled:opacity-50 px-8 py-4"
        >
          START RACE
        </button>
      </div>
    </div>
  );
};
