import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainApp from "./MainApp";
import { GameStateContext, useGameStateProvider } from "./hooks/useGameState";
import { setBaseUrl } from "@workspace/api-client-react";

// On Vercel: VITE_API_URL = your deployed Replit backend URL
// e.g. https://your-app-name.replit.app
// On Replit: not set — API calls go to /api via the built-in proxy
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

function GameStateProvider({ children }: { children: React.ReactNode }) {
  const value = useGameStateProvider();
  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameStateProvider>
        <MainApp />
        <Toaster />
      </GameStateProvider>
    </QueryClientProvider>
  );
}

export default App;
