import { useGameState } from '../hooks/useGameState';
import { User, Info, Coffee } from 'lucide-react';

export const MenuScreen = () => {
  const { setScreen, player } = useGameState();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full animate-in fade-in p-4">
      {/* Top Left: Profile */}
      <button
        onClick={() => setScreen('profile')}
        className="fixed top-4 left-4 flex items-center gap-2 pixel-btn !p-2 z-10"
      >
        <User size={16} />
        <span className="text-[10px] hidden sm:inline">{player?.username ?? 'GUEST'}</span>
      </button>

      {/* Top Right: Info & Coffee */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button onClick={() => setScreen('about')} className="pixel-btn !p-2">
          <Info size={16} />
        </button>
        <a
          href="https://buymeacoffee.com/crazypeatodev"
          target="_blank"
          rel="noreferrer"
          className="pixel-btn !p-2 flex items-center gap-1"
          title="Buy me a coffee"
        >
          <Coffee size={16} />
        </a>
      </div>

      {/* Logo */}
      <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        <span className="text-5xl">W</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-pixel mb-2">WIKI RACE</h1>
      <p className="text-[10px] text-white/40 mb-12 text-center">THE WIKIPEDIA SPEEDRUN GAME</p>

      {/* Menu Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => setScreen('mode_select')} className="pixel-btn text-sm py-4">PLAY</button>
        <button onClick={() => setScreen('mp_lobby')} className="pixel-btn text-sm py-4">MULTIPLAYER</button>
        <button onClick={() => setScreen('leaderboard')} className="pixel-btn text-sm py-3">LEADERBOARD</button>
        <button onClick={() => setScreen('profile')} className="pixel-btn text-sm py-3">PROFILE</button>
        <div className="flex gap-4 w-full">
          <button onClick={() => setScreen('how_to_play')} className="pixel-btn text-[10px] py-3 flex-1">HOW TO PLAY</button>
          <button onClick={() => setScreen('settings')} className="pixel-btn text-[10px] py-3 flex-1">SETTINGS</button>
        </div>
      </div>

      {/* Bottom Left: Live status */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-[10px] text-white/40">LIVE</span>
      </div>
    </div>
  );
};c
