import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import Layout from './components/Layout'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MatchDetail from './pages/MatchDetail'
import AdminPanel from './pages/AdminPanel'
import Settings from './pages/Settings'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Subscription Pages
import Pricing from './pages/subscription/Pricing'

import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="scoreai-ui-theme">
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
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/match/:id" element={
            <Layout>
              <MatchDetail />
            </Layout>
          } />
          <Route path="/admin" element={
            <Layout>
              <AdminPanel />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}