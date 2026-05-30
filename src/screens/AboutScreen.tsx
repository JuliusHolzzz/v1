import { useGameState } from '../hooks/useGameState';
import { Globe, Zap, Users, Coffee } from 'lucide-react';

export const AboutScreen = () => {
  const { setScreen } = useGameState();

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in fade-in">
      <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mt-8 mb-6 bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        <span className="text-2xl font-pixel">W</span>
      </div>

      <h2 className="text-2xl font-pixel mb-8">ABOUT WIKI RACE</h2>

      <div className="w-full max-w-2xl flex flex-col gap-8">
        <p className="text-sm text-white/80 leading-relaxed border border-white/20 p-6 bg-white/5 text-center">
          Wiki Race is a competitive Wikipedia navigation game. Start at one article,
          reach the target by clicking only internal links. Race against the clock,
          beat your high score, and challenge friends in multiplayer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-blue-400/30 p-5 flex flex-col gap-3">
            <Globe className="text-blue-400" size={22} />
            <h4 className="text-[10px] text-blue-400 font-pixel">REAL WIKIPEDIA</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Every article is loaded live from Wikipedia's API. 75+ curated start/end pairs, all navigable by clicking blue links.
            </p>
          </div>
          <div className="border border-red-400/30 p-5 flex flex-col gap-3">
            <Zap className="text-red-400" size={22} />
            <h4 className="text-[10px] text-red-400 font-pixel">REAL-TIME</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Multiplayer lobbies with live Socket.io connections. See your opponent's progress update in real time.
            </p>
          </div>
          <div className="border border-green-400/30 p-5 flex flex-col gap-3">
            <Users className="text-green-400" size={22} />
            <h4 className="text-[10px] text-green-400 font-pixel">LEADERBOARD</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Real player stats saved to a PostgreSQL database. Compete globally for the top rank.
            </p>
          </div>
          <div className="border border-yellow-400/30 p-5 flex flex-col gap-3">
            <Coffee className="text-yellow-400" size={22} />
            <h4 className="text-[10px] text-yellow-400 font-pixel">SUPPORT</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Enjoying Wiki Race? Support the developer at{' '}
              <a
                href="https://buymeacoffee.com/crazypeatodev"
                target="_blank"
                rel="noreferrer"
                className="text-yellow-400 underline"
              >
                buymeacoffee.com/crazypeatodev
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center flex flex-col gap-2">
          <span className="text-[10px] text-white/40">CREATOR & DEVELOPER</span>
          <span className="text-lg font-pixel text-white">JULIUS SCHOLZ</span>
          <span className="text-xs italic text-white/50 mt-2">
            "It's just six degrees of separation, but for encyclopedias."
          </span>
        </div>
      </div>

      <button onClick={() => setScreen('menu')} className="mt-12 pixel-btn bg-black">BACK</button>
    </div>
  );
};
