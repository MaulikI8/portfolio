import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { AppLayout } from './components/AppLayout';

import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { GamesIndexPage } from './pages/GamesIndexPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { ChatPage } from './pages/ChatPage';
import { NotesPage } from './pages/NotesPage';
import { MovieNightPage } from './pages/MovieNightPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import './index.css';

function RootRedirect() {
  const hasOnboarded = localStorage.getItem('has_onboarded') === 'true';
  if (!hasOnboarded) {
    return <Navigate to="/welcome" replace />;
  }
  return <Navigate to="/login" replace />;
}

const getNormalizedBasename = () => {
  const base = import.meta.env.BASE_URL || '/seema';
  return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
};

export function App() {
  return (
    <AuthProvider>
      <Router basename={getNormalizedBasename()}>
        <Routes>
          {/* Unauthenticated / Onboarding Routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Layout Routes */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesIndexPage />} />
            <Route path="/games/:gameSlug" element={<GameDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/movie-night" element={<MovieNightPage />} />
            <Route path="/movie" element={<MovieNightPage />} />
            <Route path="/cinema" element={<MovieNightPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<SettingsPage />} />
          </Route>

          {/* Root & Catch-all 404 */}
          <Route path="/auth-check" element={<RootRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
