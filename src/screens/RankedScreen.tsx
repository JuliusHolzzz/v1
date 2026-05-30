import { useGameState } from '../hooks/useGameState';

export const RankedScreen = () => {
  const { setScreen, player } = useGameState();

  const ranks = [
    { rank: 'S', label: 'SPEEDRUNNER', minScore: 900, color: 'yellow' },
    { rank: 'A', label: 'NAVIGATOR', minScore: 700, color: 'green' },
    { rank: 'B', label: 'EXPLORER', minScore: 400, color: 'blue' },
    { rank: 'C', label: 'BEGINNER', minScore: 0, color: 'orange' },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in zoom-in-95">
      <h2 className="text-2xl font-pixel mt-8 mb-12 text-blue-400">RANK SYSTEM</h2>

      <div className="w-full max-w-md flex flex-col gap-4">
        {ranks.map(({ rank, label, minScore, color }) => (
          <div
            key={rank}
            className={`border border-${color}-400/30 p-5 flex items-center gap-6 bg-${color}-400/5`}
          >
            <div className={`w-16 h-16 border border-${color}-400 flex items-center justify-center shrink-0`}>
              <span className={`text-3xl font-pixel text-${color}-400`}>{rank}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-pixel text-${color}-400`}>{label}</span>
              <span className="text-[10px] text-white/50">
                {minScore > 0 ? `≥ ${minScore} points per race` : `Any score`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-md border border-white/20 p-6 bg-white/5 text-center">
        <p className="text-xs text-white/60 leading-relaxed">
          Your rank is determined by your <span className="text-white">best single-game score</span>.
          Score is based on speed and number of clicks.
          {player ? '' : ' Create an account to track your rank permanently.'}
        </p>
      </div>

      <button onClick={() => setScreen('menu')} className="mt-12 pixel-btn">BACK</button>
    </div>
  );
};
