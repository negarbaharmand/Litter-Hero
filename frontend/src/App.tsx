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
import PrivateRoute from './components/PrivateRoute'

function App() {
  const location = useLocation()
  return (
    <>
      {location.pathname !== '/login' && <NavBar />}
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App