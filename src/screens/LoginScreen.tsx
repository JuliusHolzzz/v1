import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useLoginPlayer, useRegisterPlayer } from '@workspace/api-client-react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

export const LoginScreen = () => {
  const { setScreen, loginPlayer } = useGameState();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useLoginPlayer();
  const registerMutation = useRegisterPlayer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('USERNAME IS REQUIRED');
      return;
    }

    // Guest mode — no password required
    if (!password) {
      loginPlayer({ id: `guest_${Date.now()}`, username: username.trim().toUpperCase() });
      setScreen('menu');
      return;
    }

    const payload = { data: { username: username.trim(), password } };

    if (isRegister) {
      registerMutation.mutate(payload, {
        onSuccess: (data) => {
          loginPlayer({ id: data.id, username: data.username });
          setScreen('menu');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          setError(msg ?? 'REGISTRATION FAILED');
        },
      });
    } else {
      loginMutation.mutate(payload, {
        onSuccess: (data) => {
          loginPlayer({ id: data.id, username: data.username });
          setScreen('menu');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          setError(msg ?? 'LOGIN FAILED');
        },
      });
    }
  };

  const loading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-6 animate-in slide-in-from-bottom-8">
      {/* Logo */}
      <div className="w-16 h-16 rounded-full border border-white flex items-center justify-center mb-8">
        <span className="text-3xl font-pixel">W</span>
      </div>

      <h2 className="text-xl font-pixel mb-2">
        {isRegister ? 'CREATE ACCOUNT' : 'IDENTIFY YOURSELF'}
      </h2>
      <p className="text-[10px] text-white/40 mb-10 text-center">
        {isRegister
          ? 'Register to save scores and appear on the leaderboard.'
          : 'Log in or enter a name to play as guest (no password needed).'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-xs">
        {error && (
          <div className="text-red-400 text-[10px] text-center border border-red-400/30 bg-red-400/10 p-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-white/50">USERNAME</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="pixel-input w-full"
            maxLength={16}
            autoFocus
            placeholder="YOUR NAME"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-white/50">PASSWORD <span className="text-white/30">(optional for guest)</span></label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="pixel-input w-full"
            autoComplete="current-password"
            placeholder={isRegister ? 'MIN. 4 CHARACTERS' : 'LEAVE BLANK TO PLAY AS GUEST'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="pixel-btn py-4 mt-2 flex justify-center items-center gap-2 bg-white text-black hover:bg-white/90"
        >
          {loading
            ? <Loader2 className="animate-spin" size={16} />
            : isRegister
              ? <><UserPlus size={14} /> REGISTER</>
              : password
                ? <><LogIn size={14} /> LOGIN</>
                : 'PLAY AS GUEST'
          }
        </button>

        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          className="text-[10px] text-white/40 hover:text-white transition-colors"
        >
          {isRegister
            ? 'ALREADY HAVE AN ACCOUNT? LOGIN'
            : 'NEED AN ACCOUNT? REGISTER FOR FREE'}
        </button>
      </form>
    </div>
  );
};
