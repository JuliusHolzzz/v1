import { useGameState } from '../hooks/useGameState';

export const ModeSelectScreen = () => {
  const { setScreen } = useGameState();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-4 animate-in slide-in-from-right-8">
      <h2 className="text-2xl font-pixel mb-12">CHOOSE MODE</h2>

      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button onClick={() => setScreen('sp_mode')} className="pixel-btn py-6 flex flex-col items-center gap-2">
          <span className="text-xl">SOLO</span>
          <span className="text-[10px] text-white/40">PRACTICE OR COMPETE</span>
        </button>

        <button onClick={() => setScreen('mp_lobby')} className="pixel-btn py-6 flex flex-col items-center gap-2 border-red-400/40 hover:border-red-400">
          <span className="text-xl text-red-400">MULTIPLAYER</span>
          <span className="text-[10px] text-white/40">RACE AGAINST OTHERS</span>
        </button>
      </div>

      <button onClick={() => setScreen('menu')} className="fixed bottom-8 pixel-btn">BACK</button>
    </div>
  );
};
