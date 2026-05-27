import { useEffect } from 'react';
import LeaderboardPage from './pages/LeaderboardPage';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NavBar } from './components/NavBar'
import { ReportsPage } from './pages/Reports'
import UserProfile from './pages/UserProfile'
import { LoginPage } from './pages/LoginPage'
import { AddPicturePage } from './pages/AddPicturePage'
import { ReportDetailPage } from './pages/ReportDetailPage'
import { AboutPage } from './pages/AboutPage'
import PrivateRoute from './components/PrivateRoute'
import PrivacyPage from './pages/PrivacyPage'

function App() {
  const location = useLocation()

  useEffect(() => {
    const main = document.querySelector('#main-content')
    if (main instanceof HTMLElement) {
      main.focus()
    }
  }, [location.pathname])

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {location.pathname !== '/login' && location.pathname !== '/about' && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/add-picture" element={<AddPicturePage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App