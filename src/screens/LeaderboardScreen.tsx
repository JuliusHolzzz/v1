import { useGameState } from '../hooks/useGameState';
import { useGetLeaderboard, getGetLeaderboardQueryKey } from '@workspace/api-client-react';
import { Loader2, Trophy } from 'lucide-react';

export const LeaderboardScreen = () => {
  const { setScreen, player } = useGameState();
  const { data: leaderboard, isLoading } = useGetLeaderboard(undefined, {
    query: {
      queryKey: getGetLeaderboardQueryKey(),
      refetchInterval: 30000,
    },
  });

  const rankColor = (i: number) =>
    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/70';

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 animate-in slide-in-from-bottom-8 overflow-y-auto">
      <div className="flex items-center gap-3 mt-8 mb-12">
        <Trophy className="text-yellow-400" size={20} />
        <h2 className="text-2xl font-pixel text-yellow-400">LEADERBOARD</h2>
      </div>

      <div className="w-full max-w-2xl border border-white/20 bg-white/5">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/20 text-[9px] text-white/50 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">PLAYER</div>
          <div className="col-span-2 text-center">GAMES</div>
          <div className="col-span-2 text-right">BEST</div>
          <div className="col-span-2 text-right">WIN%</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-white/40" size={24} />
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="flex flex-col">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.playerId}
                className={`grid grid-cols-12 gap-2 px-4 py-4 text-xs border-b border-white/10 last:border-0 transition-colors
                  ${player?.id === entry.playerId ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className={`col-span-1 text-center font-pixel text-sm ${rankColor(i)}`}>
                  {i === 0 ? '👑' : `${entry.rank}`}
                </div>
                <div className={`col-span-5 truncate font-medium ${i === 0 ? 'text-yellow-400' : ''}`}>
                  {entry.username}
                  {player?.id === entry.playerId && (
                    <span className="ml-2 text-[9px] text-white/40 border border-white/20 px-1">YOU</span>
                  )}
                </div>
                <div className="col-span-2 text-center text-white/60">{entry.totalGames}</div>
                <div className={`col-span-2 text-right font-pixel text-[10px] ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : ''}`}>
                  {entry.bestScore}
                </div>
                <div className="col-span-2 text-right text-white/60">
                  {Math.round((entry.winRate ?? 0) * 100)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 gap-4">
            <Trophy className="text-white/20" size={40} />
            <p className="text-[10px] text-white/40 text-center">
              NO SCORES YET.<br />BE THE FIRST TO PLAY!
            </p>
          </div>
        )}
      </div>

      <button onClick={() => setScreen('menu')} className="mt-12 pixel-btn">BACK</button>
    </div>
  );
};
