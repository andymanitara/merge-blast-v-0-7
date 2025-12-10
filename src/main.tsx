import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { GamePage } from '@/pages/GamePage'
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { PublicProfilePage } from '@/pages/PublicProfilePage';
import { RootLayout } from '@/components/layout/RootLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
        },
    },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        index: true,
        element: (
            <AuthGuard>
                <HomePage />
            </AuthGuard>
        ),
      },
      {
        path: "game",
        element: (
            <AuthGuard>
                <GamePage />
            </AuthGuard>
        ),
      },
      {
        path: "profile",
        element: (
            <AuthGuard>
                <ProfilePage />
            </AuthGuard>
        ),
      },
      {
        path: "leaderboard",
        element: (
            <AuthGuard>
                <LeaderboardPage />
            </AuthGuard>
        ),
      },
      {
        path: "player/:userId",
        element: (
            <AuthGuard>
                <PublicProfilePage />
            </AuthGuard>
        ),
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)