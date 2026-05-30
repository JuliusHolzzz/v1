import { useGameState } from '../hooks/useGameState';
import { MousePointer, Shield, Star, Zap } from 'lucide-react';

export const HowToPlayScreen = () => {
  const { setScreen } = useGameState();

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in slide-in-from-bottom-8">
      <h2 className="text-2xl font-pixel mt-8 mb-12">HOW TO PLAY</h2>

      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 shrink-0 bg-blue-600 flex items-center justify-center mt-1">
            <MousePointer size={18} />
          </div>
          <div>
            <h3 className="text-base text-blue-400 mb-2 font-pixel">THE GOAL</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              You start on a Wikipedia article and must reach the target article
              by clicking blue hyperlinks inside the article text only. No search,
              no browser back — only the links on the page.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 shrink-0 bg-purple-600 flex items-center justify-center mt-1">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-base text-purple-400 mb-2 font-pixel">THE RULES</h3>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2">
              <li>1. Only click links within the article body.</li>
              <li>2. No search bar, no external navigation.</li>
              <li>3. Use the <span className="text-white font-semibold">UNDO</span> button to go back — it costs +1 click.</li>
              <li>4. Fewer clicks and faster time = higher score.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 shrink-0 bg-yellow-500 flex items-center justify-center mt-1">
            <Star size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-base text-yellow-400 mb-3 font-pixel">SCORING</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Base score: 1,000 pts. −50 pts per click beyond 5.
              Speed bonus: +200 pts if under 60s, +100 pts if under 2 min.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { rank: 'S', label: '≥ 900 PTS', color: 'yellow' },
                { rank: 'A', label: '≥ 700 PTS', color: 'green' },
                { rank: 'B', label: '≥ 400 PTS', color: 'blue' },
                { rank: 'C', label: '< 400 PTS', color: 'orange' },
              ].map(({ rank, label, color }) => (
                <div key={rank} className={`border border-${color}-400/40 p-3 flex justify-between items-center bg-${color}-400/5`}>
                  <span className={`font-pixel text-${color}-400 text-2xl`}>{rank}</span>
                  <span className="text-xs text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 shrink-0 bg-red-600 flex items-center justify-center mt-1">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-base text-red-400 mb-2 font-pixel">MULTIPLAYER</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Create or join a lobby. Everyone starts at the same article at the same time.
              The player who reaches the target first with the fewest clicks wins.
              Real-time updates via Socket.io keep you connected to the race.
            </p>
          </div>
        </div>
      </div>

      <button onClick={() => setScreen('menu')} className="mt-12 pixel-btn bg-black">BACK</button>
    </div>
  );
};
