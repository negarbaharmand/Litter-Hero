import './App.css'
import LeaderboardPage from './pages/LeaderboardPage';
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NavBar } from './components/NavBar'
import { ReportsPage } from './pages/ReportPage'
import { ReportsPage as ReportsPageEmpty } from './pages/ReportsPage'
import UserProfile from './pages/UserProfile'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <>
      <NavBar />
      {/* Fill remaining height under fixed NavBar (fyller höjd i flex-layout) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/reports" element={<ReportsPage />} />
        {/* Placeholder route for navbar Reports icon (placeholder route för Reports) */}
        <Route path="/reports-page" element={<ReportsPageEmpty />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
