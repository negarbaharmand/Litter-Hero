import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PrivateRoute = () => {
  const { authState } = useAuth()

  if (authState.status === 'loading') return null

  return authState.status === 'authenticated'
    ? <Outlet />
    : <Navigate to="/login" replace />
}

export default PrivateRoute
