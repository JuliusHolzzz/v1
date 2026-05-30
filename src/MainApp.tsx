import { IntroScreen } from './screens/IntroScreen';
import { MenuScreen } from './screens/MenuScreen';
import { ModeSelectScreen } from './screens/ModeSelectScreen';
import { SPModeScreen } from './screens/SPModeScreen';
import { BriefingScreen } from './screens/BriefingScreen';
import { GameScreen } from './screens/GameScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MPLobbyScreen } from './screens/MPLobbyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { AboutScreen } from './screens/AboutScreen';
import { RankedScreen } from './screens/RankedScreen';
import { useGameState } from './hooks/useGameState';

export const MainApp = () => {
  const { screen, settings } = useGameState();

  return (
    /*
     * overflow-y-auto here so every screen can scroll top-to-bottom.
     * Screens that need no scroll (intro, menu) use justify-center internally.
     * The GameScreen manages its own scrollable area inside.
     */
    <div className="fixed inset-0 w-full h-full bg-black overflow-y-auto font-pixel">
      {settings.scanlines && <div className="scanlines pointer-events-none" />}

      {screen === 'intro'       && <IntroScreen />}
      {screen === 'login'       && <LoginScreen />}
      {screen === 'menu'        && <MenuScreen />}
      {screen === 'mode_select' && <ModeSelectScreen />}
      {screen === 'sp_mode'     && <SPModeScreen />}
      {screen === 'briefing'    && <BriefingScreen />}
      {screen === 'game'        && <GameScreen />}
      {screen === 'leaderboard' && <LeaderboardScreen />}
      {screen === 'settings'    && <SettingsScreen />}
      {screen === 'mp_lobby'    && <MPLobbyScreen />}
      {screen === 'profile'     && <ProfileScreen />}
      {screen === 'how_to_play' && <HowToPlayScreen />}
      {screen === 'about'       && <AboutScreen />}
      {screen === 'ranked'      && <RankedScreen />}
    </div>
  );
};

export default MainApp;
