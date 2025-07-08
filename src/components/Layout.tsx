import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, BarChart3, Home, Zap, Users, Settings, LogIn, LogOut, Shield } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requireAuth: true },
    { name: 'AI Analitik', href: '/ai-analytics', icon: Zap, requireAuth: true },
    { name: 'Hakkında', href: '/about', icon: Users },
  ]

  // Admin kontrolü (basit email kontrolü - gerçek uygulamada role-based olmalı)
  const isAdmin = user?.email === 'admin@scoreresultsai.com' || user?.email?.endsWith('@admin.com')

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Başarıyla çıkış yapıldı')
      navigate('/')
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/images/scoreresultsai_logo.svg" 
                alt="ScoreResultsAI" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ScoreResultsAI
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon
                // Auth gerektiren sayfaları kontrol et
                if (item.requireAuth && !user) return null
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Admin Panel */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Theme Toggle & Auth & Mobile Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Tema değiştir</span>
              </Button>

              {/* Auth Buttons */}
              {!loading && (
                <>
                  {user ? (
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Çıkış</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="hidden md:flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/auth')}
                        className="flex items-center space-x-2"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Giriş</span>
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  // Auth gerektiren sayfaları kontrol et
                  if (item.requireAuth && !user) return null
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                
                {/* Admin Panel Mobile */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Mobile Auth */}
                {!loading && (
                  <div className="border-t pt-2 mt-2">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Giriş Yap</span>
                      </Link>
                    )}
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img 
                  src="/images/scoreresultsai_logo.svg" 
                  alt="ScoreResultsAI" 
                  className="h-6 w-6"
                />
                <span className="font-bold">ScoreResultsAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Yapay zeka destekli futbol analizi ve tahmin platformu
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Platform</h3>
              <div className="space-y-2 text-sm">
                <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">Dashboard</Link>
                <Link to="/ai-analytics" className="block text-muted-foreground hover:text-foreground">AI Analitik</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Ligler</h3>
              <div className="space-y-2 text-sm">
                <span className="block text-muted-foreground">180+ Lig Desteği</span>
                <span className="block text-muted-foreground">Gerçek Zamanlı Veriler</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Destek</h3>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block text-muted-foreground hover:text-foreground">Hakkında</Link>
                <a href="#" className="block text-muted-foreground hover:text-foreground">İletişim</a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            © 2025 ScoreResultsAI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout