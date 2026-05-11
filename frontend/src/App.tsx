import LeaderboardPage from './pages/LeaderboardPage';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NavBar } from './components/NavBar'
import { ReportsPage } from './pages/ReportPage'
import UserProfile from './pages/UserProfile'
import { LoginPage } from './pages/LoginPage'
import { AddPicturePage } from './pages/AddPicturePage'

function App() {
  const location = useLocation()
  return (
    <>
      {location.pathname !== '/login' && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/add-picture" element={<AddPicturePage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
