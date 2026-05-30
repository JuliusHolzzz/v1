import { useEffect, useState } from 'react';
import { useGameState } from '../hooks/useGameState';

export const IntroScreen = () => {
  const { setScreen, player } = useGameState();
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => {
      if (!player) {
        setScreen('login');
      } else {
        setScreen('menu');
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [setScreen, player]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full animate-in fade-in duration-500">
      <div className={`w-32 h-32 rounded-full border-4 border-white flex items-center justify-center mb-8 transition-transform duration-1000 ${bounce ? 'scale-110' : 'scale-50'}`}>
        <span className="text-6xl">W</span>
      </div>
      <h1 className="text-3xl font-pixel mb-2 animate-pulse">WIKI RACE</h1>
    </div>
  );
};
