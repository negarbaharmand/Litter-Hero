// Importera fler sidor här efterhand:
// import Home from './pages/Home'
// import Reports from './pages/Reports'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProfile from './pages/UserProfile'

//Här ska vi definiera våra routes, så att vi kan navigera mellan olika sidor i vår app. Just nu la jag in min route för UserProfile.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<UserProfile />} />

        {/* Lägg till fler routes här: */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}

      </Routes>
    </BrowserRouter>
  )
}

export default App