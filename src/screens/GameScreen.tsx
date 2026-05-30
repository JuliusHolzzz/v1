import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { parseArticleContent } from '../lib/articleParser';
import { calculateScore } from '../lib/scoreCalculator';
import { useSaveGame } from '@workspace/api-client-react';
import { Loader2, RotateCcw, X, Target } from 'lucide-react';

function normalizeTitle(t: string) {
  return decodeURIComponent(t).replace(/_/g, ' ').trim().toLowerCase();
}

export const GameScreen = () => {
  const { setScreen, fromArticle, toArticle, settings, difficulty, player } = useGameState();
  const [currentArticle, setCurrentArticle] = useState(fromArticle);
  const [history, setHistory] = useState<string[]>([fromArticle]);
  const [clicks, setClicks] = useState(0);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; letterRank: string } | null>(null);

  const saveGame = useSaveGame();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lang = settings.language === 'EN' ? 'en' : 'de';

  // ── Fetch Wikipedia article ────────────────────────────────────────────────
  const fetchArticle = useCallback(async (title: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error.info);
      const processedHtml = parseArticleContent(data.parse.text['*']);
      setHtml(processedHtml);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load article';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetchArticle(currentArticle); }, [currentArticle, fetchArticle]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (won || loading) return;
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [won, loading]);

  // ── Win check ─────────────────────────────────────────────────────────────
  const checkWin = useCallback((title: string) => {
    return normalizeTitle(title) === normalizeTitle(toArticle);
  }, [toArticle]);

  // ── Handle navigation ─────────────────────────────────────────────────────
  const navigateTo = useCallback((title: string) => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    setHistory(h => [...h, title]);
    setCurrentArticle(title);

    if (checkWin(title)) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalScore = calculateScore(newClicks, time);
      setResult(finalScore);
      setWon(true);

      if (player && !player.id.startsWith('guest_')) {
        saveGame.mutate({
          data: {
            playerId: player.id,
            fromArticle,
            toArticle,
            clicks: newClicks,
            timeSeconds: time,
            score: finalScore.score,
            letterRank: finalScore.letterRank,
            difficulty,
            won: true,
          },
        });
      }
    }
  }, [clicks, time, checkWin, player, fromArticle, toArticle, difficulty, saveGame]);

  // ── Delegate all link clicks inside article ────────────────────────────────
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-wiki-link]') as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      const target = el.getAttribute('data-target');
      if (target) navigateTo(decodeURIComponent(target).replace(/_/g, ' '));
    };
    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [html, navigateTo]);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setCurrentArticle(newHistory[newHistory.length - 1]!);
    setClicks(c => c + 1); // undo costs a click
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const rankColor = (r: string) => ({
    S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-orange-400',
  }[r] ?? 'text-white');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full">

      {/* ── Fixed Top HUD ─────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-white/20 flex items-center justify-between px-3 sm:px-6 z-50 gap-2">
        {/* Left: quit */}
        <button
          onClick={() => setScreen('menu')}
          className="pixel-btn !p-2 border-red-500/40 text-red-400 hover:border-red-400 shrink-0"
          title="Quit game"
        >
          <X size={14} />
        </button>

        {/* Center: target */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <Target size={12} className="text-green-400 shrink-0" />
          <span className="text-[9px] text-white/40 shrink-0">TARGET:</span>
          <span className="text-[10px] sm:text-xs font-pixel text-green-400 truncate">{toArticle}</span>
        </div>

        {/* Right: stats + undo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center hidden sm:block">
            <div className="text-[8px] text-white/40">TIME</div>
            <div className="text-[10px] font-pixel">{formatTime(time)}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-white/40">CLICKS</div>
            <div className="text-[10px] font-pixel text-center">{clicks}</div>
          </div>
          <button
            onClick={undo}
            disabled={history.length <= 1 || won}
            className="pixel-btn !p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (costs 1 click)"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Article Area ───────────────────────────────────────── */}
      <div className="pt-14 min-h-screen overflow-y-auto">
        {/* Article title bar */}
        <div className="bg-black border-b border-white/10 px-4 sm:px-8 py-3 sticky top-0 z-10">
          <h1 className="text-sm sm:text-base font-semibold text-white/90 font-sans">
            {currentArticle.replace(/_/g, ' ')}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-white/60" size={32} />
            <span className="text-[10px] text-white/40 animate-pulse font-pixel">LOADING ARTICLE...</span>
          </div>
        ) : fetchError ? (
          <div className="max-w-2xl mx-auto mt-16 p-6 border border-red-400/30 bg-red-400/10">
            <p className="text-red-400 font-pixel text-sm mb-2">LOAD ERROR</p>
            <p className="text-xs text-white/60 mb-4">{fetchError}</p>
            <div className="flex gap-3">
              <button onClick={() => fetchArticle(currentArticle)} className="pixel-btn text-xs">RETRY</button>
              <button onClick={() => setScreen('menu')} className="pixel-btn text-xs border-red-500/40 text-red-400">QUIT</button>
            </div>
          </div>
        ) : (
          /* ── Real Wikipedia content — NO pixel font override ── */
          <div
            ref={contentRef}
            className="wiki-article-content max-w-4xl mx-auto px-4 sm:px-8 py-6 pb-24"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      {/* ── Win Overlay ───────────────────────────────────────────────────── */}
      {won && result && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] animate-in zoom-in-95 p-4 overflow-y-auto">
          <h2 className="text-3xl sm:text-4xl font-pixel text-green-400 mb-8 animate-pulse">VICTORY!</h2>

          <div className="border border-white/30 p-8 w-full max-w-sm flex flex-col gap-5 bg-black mb-8">
            {/* Rank */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-xs text-white/50 font-pixel">RANK</span>
              <span className={`text-5xl font-pixel ${rankColor(result.letterRank)}`}>
                {result.letterRank}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">SCORE</span>
              <span className="text-xl font-pixel">{result.score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">TIME</span>
              <span className="text-xl font-pixel">{formatTime(time)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">CLICKS</span>
              <span className="text-xl font-pixel">{clicks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">PATH</span>
              <span className="text-xs text-white/60 text-right">{fromArticle} → {toArticle}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setScreen('menu')} className="pixel-btn text-sm">MAIN MENU</button>
            <button onClick={() => setScreen('briefing')} className="pixel-btn text-sm bg-white text-black hover:bg-white/90">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
