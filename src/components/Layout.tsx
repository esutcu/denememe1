// src/components/Layout.tsx - Genişletilmiş navigasyon menüsü
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  Home,
  Zap,
  Users,
  Settings,
  LogIn,
  LogOut,
  Shield,
  Bell,
  User,
  HelpCircle,
  ChevronDown,
  Trophy
} from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const mainNavigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home, requireAuth: false },
    { name: 'Özellikler', href: '/ai-analytics', icon: Zap, requireAuth: false },
    { name: 'Hakkında', href: '/about', icon: Users, requireAuth: false },
  ]

  // Kullanıcı menüsü - sadece mevcut sayfalar
  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requireAuth: true },
    { name: 'AI Analitik', href: '/ai-analytics', icon: Zap, requireAuth: true },
    { name: 'Hakkında', href: '/about', icon: HelpCircle },
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                <span className="text-muted-foreground">Score</span>
                <span className="text-green-600">Results</span>
                <span className="text-foreground">AI</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {mainNavigation.map((item) => {
                const Icon = item.icon
                // Auth gerektiren sayfaları kontrol et
                if (item.requireAuth && !user) return null
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-muted text-foreground shadow-md transform scale-105'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Right Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              {user && (
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
              )}

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-3 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center border border-border">
                          <span className="text-xs font-medium text-muted-foreground">
                            {user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="hidden md:inline-block text-sm font-medium max-w-24 truncate">
                          {user.email?.split('@')[0] || 'Kullanıcı'}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-white/20">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Hesabım</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      if (item.requireAuth && !user) return null
                      
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.href} className="flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" asChild className="glass-button rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                    <Link to="/auth">
                      <LogIn className="mr-2 h-4 w-4" />
                      Giriş Yap
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="glass-medium rounded-xl text-white border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
                    <Link to="/auth">
                      <User className="mr-2 h-4 w-4" />
                      Kayıt Ol
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-9 w-9 p-0 glass-button rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 glass-strong">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Main Navigation */}
              {mainNavigation.map((item) => {
                const Icon = item.icon
                if (item.requireAuth && !user) return null
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'glass-medium text-white shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:glass-button'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* User Menu Items */}
              {user && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hesap
                    </div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      if (item.requireAuth && !user) return null
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:glass-button transition-all duration-300"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Theme Toggle & Auth */}
              <div className="border-t pt-2 mt-2 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start"
                >
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
                </Button>

                {user ? (
                  <>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="w-full justify-start text-red-600 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Giriş Yap
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full justify-start" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Kayıt Ol
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border glass-navbar mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img 
                  src="/images/scoreresultsai_logo.svg" 
                  alt="ScoreResultsAI" 
                  className="h-6 w-6"
                />
                <span className="font-semibold text-foreground">ScoreResultsAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Yapay zeka destekli futbol analiz platformu
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/ai-analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
                  AI Analitik
                </Link>

              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Destek</h4>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Hakkında
                </Link>
                <a href="mailto:info@scoreresultsai.com" className="block text-muted-foreground hover:text-foreground transition-colors">
                  İletişim
                </a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Yasal</h4>
              <div className="space-y-2 text-sm">
                <Link to="/privacy-policy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link to="/terms-of-use" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Kullanım Şartları
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ScoreResultsAI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout