import { useGameState } from '../hooks/useGameState';
import { useGetPlayer, getGetPlayerQueryKey } from '@workspace/api-client-react';
import { Loader2, LogOut, Trophy, Flame, Target, Award } from 'lucide-react';

export const ProfileScreen = () => {
  const { setScreen, player, logoutPlayer } = useGameState();

  const { data: profile, isLoading } = useGetPlayer(player?.id ?? '', {
    query: {
      enabled: !!player && !player.id.startsWith('guest_'),
      queryKey: getGetPlayerQueryKey(player?.id ?? ''),
    },
  });

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-4 animate-in zoom-in-95">
        <h2 className="text-2xl font-pixel mb-8">NOT LOGGED IN</h2>
        <p className="text-sm text-white/60 mb-8 text-center max-w-xs">
          Create an account to track your scores and appear on the leaderboard.
        </p>
        <div className="flex gap-4">
          <button onClick={() => setScreen('menu')} className="pixel-btn">BACK</button>
          <button onClick={() => setScreen('login')} className="pixel-btn bg-white text-black">LOGIN / REGISTER</button>
        </div>
      </div>
    );
  }

  const isGuest = player.id.startsWith('guest_');

  const rankColor = (rank: string) => {
    if (rank === 'S') return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    if (rank === 'A') return 'text-green-400 border-green-400 bg-green-400/10';
    if (rank === 'B') return 'text-blue-400 border-blue-400 bg-blue-400/10';
    return 'text-orange-400 border-orange-400 bg-orange-400/10';
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-32 animate-in slide-in-from-right-8 overflow-y-auto">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mt-12 mb-4 bg-white/5">
        <span className="text-3xl font-pixel uppercase">{player.username.substring(0, 2)}</span>
      </div>

      <h2 className="text-2xl font-pixel mb-2">{player.username.toUpperCase()}</h2>
      <div className={`text-[10px] border px-2 py-1 mb-8 ${isGuest ? 'text-orange-400 border-orange-400/40' : 'text-green-400 border-green-400/40'}`}>
        {isGuest ? 'GUEST ACCOUNT' : 'REGISTERED'}
      </div>

      {isGuest ? (
        <div className="text-center max-w-sm border border-white/20 p-8 bg-white/5 flex flex-col gap-4">
          <p className="text-sm text-white/60 leading-relaxed">
            Guest accounts don't save stats or appear on the leaderboard. Register for free to track your progress!
          </p>
          <button onClick={() => setScreen('login')} className="pixel-btn bg-white text-black text-xs py-3">
            CREATE FREE ACCOUNT
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-12"><Loader2 className="animate-spin" /></div>
      ) : profile ? (
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Rank badge */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 border-2 flex items-center justify-center ${rankColor(profile.rank ?? 'C')}`}>
              <span className="text-4xl font-pixel">{profile.rank}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/20 p-4 bg-white/5 flex flex-col items-center gap-2">
              <Target size={16} className="text-white/40" />
              <span className="text-[10px] text-white/60">TOTAL GAMES</span>
              <span className="text-2xl font-pixel">{profile.totalGames}</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/5 flex flex-col items-center gap-2">
              <Trophy size={16} className="text-yellow-400/60" />
              <span className="text-[10px] text-white/60">WINS</span>
              <span className="text-2xl font-pixel text-yellow-400">{profile.totalWins}</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/5 flex flex-col items-center gap-2">
              <Award size={16} className="text-blue-400/60" />
              <span className="text-[10px] text-white/60">BEST SCORE</span>
              <span className="text-2xl font-pixel text-blue-400">{profile.bestScore}</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/5 flex flex-col items-center gap-2">
              <Flame size={16} className="text-orange-400/60" />
              <span className="text-[10px] text-white/60">STREAK</span>
              <span className="text-2xl font-pixel text-orange-400">{profile.streak}d</span>
            </div>
          </div>

          {/* Win rate bar */}
          <div className="border border-white/20 p-4 bg-white/5 flex flex-col gap-3">
            <div className="flex justify-between text-[10px] text-white/60">
              <span>WIN RATE</span>
              <span>{profile.totalGames > 0 ? Math.round((profile.totalWins / profile.totalGames) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-black border border-white/20 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-green-400 transition-all duration-700"
                style={{ width: `${profile.totalGames > 0 ? Math.round((profile.totalWins / profile.totalGames) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-red-400 text-sm border border-red-400/20 p-4">FAILED TO LOAD PROFILE</div>
      )}

      <div className="flex gap-4 mt-12">
        <button onClick={() => setScreen('menu')} className="pixel-btn">BACK</button>
        <button
          onClick={() => { logoutPlayer(); setScreen('intro'); }}
          className="pixel-btn border-red-500/50 text-red-400 hover:border-red-400 flex items-center gap-2"
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </div>
    </div>
  );
};
