import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useListLobbies, getListLobbiesQueryKey, useCreateLobby, useJoinLobby, useGetLobby, getGetLobbyQueryKey } from '@workspace/api-client-react';
import { useSocket } from '../hooks/useSocket';
import { Loader2, Users, RefreshCw, Plus } from 'lucide-react';

export const MPLobbyScreen = () => {
  const { setScreen, player, lobbyId, setLobbyId } = useGameState();
  const [view, setView] = useState<'list' | 'create' | 'room'>('list');

  // Create Lobby State
  const [fromArticle, setFromArticle] = useState('Football');
  const [toArticle, setToArticle] = useState('FIFA World Cup');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState('EASY');

  // API Hooks
  const { data: lobbies, isLoading: loadingLobbies, refetch: refetchLobbies } = useListLobbies({
    query: {
      queryKey: getListLobbiesQueryKey(),
      refetchInterval: view === 'list' ? 5000 : false,
    },
  });

  const createMutation = useCreateLobby();
  const joinMutation = useJoinLobby();

  // Room State
  const { data: roomData, isLoading: loadingRoom, refetch: refetchRoom } = useGetLobby(lobbyId ?? '', {
    query: {
      queryKey: getGetLobbyQueryKey(lobbyId ?? ''),
      enabled: !!lobbyId && view === 'room',
    },
  });

  const { socket, connected } = useSocket();

  useEffect(() => {
    if (lobbyId && view !== 'room') setView('room');
  }, [lobbyId, view]);

  useEffect(() => {
    if (view === 'room' && lobbyId && player && connected && socket) {
      socket.emit('lobby:join', { lobbyId, username: player.username });

      socket.on('lobby:state', (_state: unknown) => { refetchRoom(); });
      socket.on('game:start', (_data: unknown) => { /* future: navigate to game */ });

      return () => {
        socket.emit('lobby:leave');
        socket.off('lobby:state');
        socket.off('game:start');
      };
    }
    return undefined;
  }, [view, lobbyId, player, connected, socket, refetchRoom]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;
    createMutation.mutate({
      data: { hostUsername: player.username, fromArticle, toArticle, maxPlayers, difficulty },
    }, {
      onSuccess: (data) => { setLobbyId(data.id); setView('room'); },
    });
  };

  const handleJoin = (id: string) => {
    if (!player) { setScreen('login'); return; }
    joinMutation.mutate({ id, data: { username: player.username } }, {
      onSuccess: (data) => { setLobbyId(data.id); setView('room'); },
    });
  };

  const leaveRoom = () => { setLobbyId(null); setView('list'); };

  /* ── Create Form ──────────────────────────────────────────────────────── */
  if (view === 'create') {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in slide-in-from-right-8">
        <h2 className="text-xl font-pixel mt-10 mb-8">CREATE LOBBY</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-5 w-full max-w-sm border border-white/20 p-6 bg-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50">START ARTICLE</label>
            <input type="text" value={fromArticle} onChange={e => setFromArticle(e.target.value)}
              className="pixel-input" required placeholder="e.g. Football" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50">TARGET ARTICLE</label>
            <input type="text" value={toArticle} onChange={e => setToArticle(e.target.value)}
              className="pixel-input" required placeholder="e.g. FIFA World Cup" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50">MAX PLAYERS: {maxPlayers}</label>
            <input type="range" min={2} max={8} value={maxPlayers}
              onChange={e => setMaxPlayers(parseInt(e.target.value))} className="w-full accent-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50">DIFFICULTY</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="pixel-input bg-black">
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="pixel-btn bg-white text-black mt-2 py-3 flex justify-center items-center gap-2">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={14} /> CREATE & JOIN</>}
          </button>
          <button type="button" onClick={() => setView('list')}
            className="text-[10px] text-white/40 hover:text-white">CANCEL</button>
        </form>
      </div>
    );
  }

  /* ── Waiting Room ─────────────────────────────────────────────────────── */
  if (view === 'room') {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in zoom-in-95">
        <h2 className="text-xl font-pixel mt-10 mb-6">WAITING ROOM</h2>

        {loadingRoom || !roomData ? (
          <div className="my-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-5">
            {/* Lobby info */}
            <div className="border border-white/20 p-4 bg-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50">LOBBY CODE</span>
                <span className="font-pixel text-yellow-400 text-lg">{roomData.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50">ROUTE</span>
                <span className="text-xs text-right max-w-[60%]">
                  {roomData.fromArticle} → {roomData.toArticle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50">DIFFICULTY</span>
                <span className={`text-[10px] ${roomData.difficulty === 'EASY' ? 'text-green-400' : roomData.difficulty === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {roomData.difficulty}
                </span>
              </div>
            </div>

            {/* Player list */}
            <div className="border border-white/20 bg-white/5">
              <div className="px-4 py-2 border-b border-white/20 flex justify-between text-[9px] text-white/50 uppercase">
                <span>PLAYERS ({roomData.players.length}/{roomData.maxPlayers})</span>
                <span>STATUS</span>
              </div>
              {roomData.players.map((p, i) => (
                <div key={i} className="px-4 py-3 border-b border-white/10 last:border-0 flex justify-between items-center">
                  <span className={`text-sm ${p.username === player?.username ? 'text-yellow-400' : 'text-white'}`}>
                    {p.username}
                    {p.username === roomData.host && (
                      <span className="ml-2 text-[9px] text-white/40 border border-white/20 px-1">HOST</span>
                    )}
                  </span>
                  <span className={`text-[10px] ${p.ready ? 'text-green-400' : 'text-orange-400'}`}>
                    {p.ready ? 'READY' : 'WAITING'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={leaveRoom} className="pixel-btn flex-1">LEAVE</button>
              {player?.username === roomData.host ? (
                <button className="pixel-btn flex-1 bg-green-900/30 text-green-400 border-green-500/50">START GAME</button>
              ) : (
                <button className="pixel-btn flex-1 border-yellow-500/50 text-yellow-400">READY UP</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Lobby List ───────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full p-4 pb-24 overflow-y-auto animate-in slide-in-from-right-8">
      <h2 className="text-xl font-pixel mt-10 mb-8">LOBBIES</h2>

      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <button onClick={() => refetchLobbies()} className="pixel-btn !p-2" title="Refresh">
          <RefreshCw size={14} className={loadingLobbies ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={() => { if (!player) { setScreen('login'); return; } setView('create'); }}
          className="pixel-btn text-sm flex items-center gap-2"
        >
          <Plus size={14} /> CREATE LOBBY
        </button>
      </div>

      <div className="w-full max-w-3xl border border-white/20 bg-white/5">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/20 text-[9px] text-white/50 uppercase">
          <div className="col-span-5">HOST / ROUTE</div>
          <div className="col-span-3 text-center">DIFF</div>
          <div className="col-span-2 text-center">PLAYERS</div>
          <div className="col-span-2"></div>
        </div>

        {loadingLobbies ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-white/40" /></div>
        ) : lobbies && lobbies.length > 0 ? (
          <div className="flex flex-col">
            {lobbies.map(l => {
              const isFull = l.players.length >= l.maxPlayers;
              return (
                <div key={l.id} className="grid grid-cols-12 gap-2 px-4 py-4 text-xs border-b border-white/10 last:border-0 items-center hover:bg-white/5">
                  <div className="col-span-5 flex flex-col gap-1 min-w-0">
                    <span className="text-yellow-400 truncate">{l.host}'S GAME</span>
                    <span className="text-[9px] text-white/50 truncate">{l.fromArticle} → {l.toArticle}</span>
                  </div>
                  <div className={`col-span-3 text-center text-[10px] ${l.difficulty === 'EASY' ? 'text-green-400' : l.difficulty === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {l.difficulty}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <Users size={11} className={isFull ? 'text-red-400' : 'text-white/50'} />
                    <span className={isFull ? 'text-red-400' : 'text-white/70'}>{l.players.length}/{l.maxPlayers}</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => handleJoin(l.id)}
                      disabled={isFull || joinMutation.isPending}
                      className="pixel-btn !py-1 !px-2 text-[9px] disabled:opacity-40"
                    >
                      {isFull ? 'FULL' : 'JOIN'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Users size={32} className="text-white/20" />
            <p className="text-[10px] text-white/40">NO OPEN LOBBIES<br />BE THE FIRST TO CREATE ONE!</p>
          </div>
        )}
      </div>

      <button onClick={() => setScreen('menu')} className="mt-10 pixel-btn">BACK</button>
    </div>
  );
};
