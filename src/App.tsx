import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MatchDetail from './pages/MatchDetail'
import LeagueDetail from './pages/LeagueDetail'
import AIAnalytics from './pages/AIAnalytics'
import About from './pages/About'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import AdminPanel from './pages/AdminPanel'
import AdminLLMPage from './pages/AdminLLM'
import ApiTest from './pages/ApiTest'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <Router basename="/">
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/match/:id" element={<MatchDetail />} />
              <Route path="/league/:leagueId" element={<LeagueDetail />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/llm" element={<AdminLLMPage />} />
              <Route path="/api-test" element={<ApiTest />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#F1F5F9'
              }
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App