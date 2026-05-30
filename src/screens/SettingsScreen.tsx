import { useGameState } from '../hooks/useGameState';

export const SettingsScreen = () => {
  const { setScreen, settings, updateSettings } = useGameState();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white w-full p-4 animate-in slide-in-from-right-8">
      <h2 className="text-2xl font-pixel mb-12">SETTINGS</h2>

      <div className="flex flex-col gap-8 w-full max-w-sm border border-white/20 p-8">
        <div className="flex flex-col gap-4">
          <div className="text-[10px] text-white/40">WIKIPEDIA LANGUAGE</div>
          <div className="flex gap-4">
            <button
              onClick={() => updateSettings({ language: 'EN' })}
              className={`pixel-btn flex-1 py-3 ${settings.language === 'EN' ? 'bg-white text-black' : ''}`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => updateSettings({ language: 'DE' })}
              className={`pixel-btn flex-1 py-3 ${settings.language === 'DE' ? 'bg-white text-black' : ''}`}
            >
              DEUTSCH
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[10px] text-white/40">VISUALS</div>
          <button
            onClick={() => updateSettings({ scanlines: !settings.scanlines })}
            className="pixel-btn py-3 text-sm flex justify-between px-4 items-center"
          >
            <span>CRT SCANLINES</span>
            <span className={settings.scanlines ? 'text-green-400' : 'text-red-400'}>
              {settings.scanlines ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      <button onClick={() => setScreen('menu')} className="mt-12 pixel-btn">BACK</button>
    </div>
  );
};
