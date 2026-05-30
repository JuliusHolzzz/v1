import { useState, useEffect, createContext, useContext } from 'react';

export type Screen =
  | 'intro' | 'menu' | 'mode_select' | 'sp_mode' | 'briefing'
  | 'game' | 'leaderboard' | 'settings' | 'mp_lobby'
  | 'profile' | 'how_to_play' | 'about' | 'ranked' | 'login';

export interface Player {
  id: string;
  username: string;
}

export interface GameSettings {
  language: 'DE' | 'EN';
  scanlines: boolean;
}

export interface GameStateValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  player: Player | null;
  loginPlayer: (p: Player) => void;
  logoutPlayer: () => void;
  settings: GameSettings;
  updateSettings: (s: Partial<GameSettings>) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  fromArticle: string;
  setFromArticle: (a: string) => void;
  toArticle: string;
  setToArticle: (a: string) => void;
  lobbyId: string | null;
  setLobbyId: (id: string | null) => void;
}

export const GameStateContext = createContext<GameStateValue | null>(null);

export function useGameStateProvider(): GameStateValue {
  const [screen, setScreen] = useState<Screen>('intro');
  const [player, setPlayer] = useState<Player | null>(null);
  const [settings, setSettings] = useState<GameSettings>({ language: 'DE', scanlines: true });
  const [difficulty, setDifficulty] = useState<string>('EASY');
  const [fromArticle, setFromArticle] = useState<string>('');
  const [toArticle, setToArticle] = useState<string>('');
  const [lobbyId, setLobbyId] = useState<string | null>(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('wikirace_player');
    if (savedPlayer) {
      try { setPlayer(JSON.parse(savedPlayer)); } catch { /* ignore */ }
    }
    const savedSettings = localStorage.getItem('wikirace_settings');
    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch { /* ignore */ }
    }
  }, []);

  const loginPlayer = (p: Player) => {
    setPlayer(p);
    localStorage.setItem('wikirace_player', JSON.stringify(p));
  };

  const logoutPlayer = () => {
    setPlayer(null);
    localStorage.removeItem('wikirace_player');
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('wikirace_settings', JSON.stringify(updated));
  };

  return {
    screen, setScreen,
    player, loginPlayer, logoutPlayer,
    settings, updateSettings,
    difficulty, setDifficulty,
    fromArticle, setFromArticle,
    toArticle, setToArticle,
    lobbyId, setLobbyId,
  };
}

export function useGameState(): GameStateValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used inside GameStateProvider');
  return ctx;
}
