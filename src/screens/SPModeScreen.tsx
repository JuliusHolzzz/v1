import { useGameState } from '../hooks/useGameState';

export const SPModeScreen = () => {
  const { setScreen, setDifficulty } = useGameState();

  const selectMode = (diff: string) => {
    setDifficulty(diff);
    setScreen('briefing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-4 animate-in slide-in-from-right-8">
      <h2 className="text-2xl font-pixel mb-12">DIFFICULTY</h2>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button onClick={() => selectMode('EASY')} className="pixel-btn py-6 flex flex-col items-center gap-2 border-green-400/40 hover:border-green-400">
          <span className="text-lg text-green-400">EASY</span>
          <span className="text-[10px] text-white/60">Popular topics — 1 to 3 clicks</span>
        </button>

        <button onClick={() => selectMode('MEDIUM')} className="pixel-btn py-6 flex flex-col items-center gap-2 border-yellow-400/40 hover:border-yellow-400">
          <span className="text-lg text-yellow-400">MEDIUM</span>
          <span className="text-[10px] text-white/60">Requires exploration — 3 to 5 clicks</span>
        </button>

        <button onClick={() => selectMode('HARD')} className="pixel-btn py-6 flex flex-col items-center gap-2 border-red-400/40 hover:border-red-400">
          <span className="text-lg text-red-400">HARD</span>
          <span className="text-[10px] text-white/60">Obscure paths — 6 or more clicks</span>
        </button>
      </div>

      <button onClick={() => setScreen('mode_select')} className="fixed bottom-8 pixel-btn">BACK</button>
    </div>
  );
};
