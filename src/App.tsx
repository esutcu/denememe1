import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MatchDetail from './pages/MatchDetail'
import AdminPanel from './pages/AdminPanel'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Pricing from './pages/subscription/Pricing'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        {/* Subscription Routes */}
        <Route path="/subscription/pricing" element={<Pricing />} />
        
        {/* Protected App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App